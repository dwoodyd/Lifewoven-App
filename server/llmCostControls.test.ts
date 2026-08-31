import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ count: 0, inserts: [] as unknown[], invoke: vi.fn() }));

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(async () => [{ count: state.count }]) })) })),
    insert: vi.fn(() => ({ values: vi.fn(async (value: unknown) => { state.inserts.push(value); }) })),
  })),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: state.invoke,
}));

import { DailyLlmLimitError, invokeMeteredLLM, llmCostControlConfig } from "./llmCostControls";

describe("centralized LLM cost controls", () => {
  beforeEach(() => {
    state.count = 0;
    state.inserts.length = 0;
    state.invoke.mockReset().mockResolvedValue({
      model: "gpt-5",
      choices: [{ index: 0, message: { role: "assistant", content: "Grounded response." }, finish_reason: "stop" }],
      usage: { prompt_tokens: 120, completion_tokens: 80, total_tokens: 200 },
    });
  });

  it("routes ordinary work economically and writes a token ledger row", async () => {
    await invokeMeteredLLM({ userId: 7, feature: "library_reading_companion", tier: "economical", messages: [{ role: "user", content: "Help me reflect." }] });
    expect(state.invoke).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-5-mini", maxTokens: 640 }));
    expect(state.inserts[0]).toMatchObject({ userId: 7, feature: "library_reading_companion", model: "gpt-5-mini", promptTokens: 120, completionTokens: 80, totalTokens: 200 });
  });

  it("allows a rich call below the configured daily boundary and meters it", async () => {
    state.count = llmCostControlConfig.richDailyCallCap - 1;
    await invokeMeteredLLM({ userId: 8, feature: "ground_prayer_reflection", tier: "rich", messages: [{ role: "user", content: "Prayer." }] });
    expect(state.invoke).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-5", maxTokens: 2048 }));
    expect(state.inserts).toHaveLength(1);
  });

  it("refuses a rich call exactly at the daily boundary before provider spend", async () => {
    state.count = llmCostControlConfig.richDailyCallCap;
    await expect(invokeMeteredLLM({ userId: 9, feature: "ground_weekly_reflection", tier: "rich", messages: [{ role: "user", content: "Weekly." }] })).rejects.toBeInstanceOf(DailyLlmLimitError);
    expect(state.invoke).not.toHaveBeenCalled();
    expect(state.inserts).toHaveLength(0);
  });
});
