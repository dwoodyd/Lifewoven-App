import { and, eq, gte, lt, sql } from "drizzle-orm";
import { llmUsage } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM, type InvokeParams, type InvokeResult } from "./_core/llm";

export type LlmTier = "economical" | "rich";

export type MeteredLlmRequest = Omit<InvokeParams, "model" | "maxTokens" | "max_tokens"> & {
  userId: number;
  feature: string;
  tier: LlmTier;
  /** IANA user zone when the calling surface has it; UTC is the conservative fallback. */
  timeZone?: string;
};

export class DailyLlmLimitError extends Error {
  readonly code = "DAILY_LLM_LIMIT_REACHED";
  constructor() {
    super("You’ve reached today’s deeper reflection limit. You can return tomorrow.");
  }
}

const RICH_DAILY_CALL_CAP = Math.max(1, Number(process.env.LIFEWOVEN_RICH_LLM_DAILY_CAP ?? 4));

const ROUTES = {
  economical: { model: "gpt-5-mini", maxTokens: 640, inputPerMillion: 0.25, outputPerMillion: 2 },
  rich: { model: "gpt-5", maxTokens: 2048, inputPerMillion: 1.25, outputPerMillion: 10 },
} as const;

function localDayBounds(timeZone = "UTC", now = new Date()): { start: Date; end: Date } {
  // The browser can provide an IANA zone. If it cannot, UTC yields a deterministic
  // server-enforced 24-hour ceiling rather than an unbounded best-effort limit.
  let date = now.toISOString().slice(0, 10);
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    date = `${values.year}-${values.month}-${values.day}`;
  } catch {
    // Invalid client zone cannot weaken the limit.
  }
  const start = new Date(`${date}T00:00:00.000Z`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function estimateUsd(tier: LlmTier, usage: InvokeResult["usage"]): string {
  const route = ROUTES[tier];
  const value = ((usage?.prompt_tokens ?? 0) * route.inputPerMillion + (usage?.completion_tokens ?? 0) * route.outputPerMillion) / 1_000_000;
  return value.toFixed(6);
}

async function recordUsage(args: {
  userId: number;
  feature: string;
  model: string;
  tier: LlmTier;
  usage?: InvokeResult["usage"];
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("AI usage cannot be metered while the database is unavailable.");
  const usage = args.usage;
  await db.insert(llmUsage).values({
    userId: args.userId,
    feature: args.feature,
    model: args.model,
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
    costEstimateUsd: estimateUsd(args.tier, usage),
  });
}

/**
 * The only application-facing model entry point. It selects a bounded tier,
 * enforces the rich-call daily ceiling before spend, and records every outcome.
 */
export async function invokeMeteredLLM(request: MeteredLlmRequest): Promise<InvokeResult> {
  const route = ROUTES[request.tier];
  const db = await getDb();
  if (!db) throw new Error("AI is temporarily unavailable because usage metering is offline.");

  if (request.tier === "rich") {
    const { start, end } = localDayBounds(request.timeZone);
    const rows = await db.select({ count: sql<number>`count(*)` })
      .from(llmUsage)
      .where(and(
        eq(llmUsage.userId, request.userId),
        gte(llmUsage.createdAt, start),
        lt(llmUsage.createdAt, end),
      ));
    if (Number(rows[0]?.count ?? 0) >= RICH_DAILY_CALL_CAP) {
      throw new DailyLlmLimitError();
    }
  }

  try {
    const result = await invokeLLM({
      messages: request.messages,
      tools: request.tools,
      toolChoice: request.toolChoice,
      tool_choice: request.tool_choice,
      outputSchema: request.outputSchema,
      output_schema: request.output_schema,
      responseFormat: request.responseFormat,
      response_format: request.response_format,
      model: route.model,
      maxTokens: route.maxTokens,
    });
    await recordUsage({ userId: request.userId, feature: request.feature, model: route.model, tier: request.tier, usage: result.usage });
    return result;
  } catch (error) {
    if (!(error instanceof DailyLlmLimitError)) {
      await recordUsage({ userId: request.userId, feature: request.feature, model: route.model, tier: request.tier });
    }
    throw error;
  }
}

export const llmCostControlConfig = {
  richDailyCallCap: RICH_DAILY_CALL_CAP,
  routes: ROUTES,
  localDayBounds,
};
