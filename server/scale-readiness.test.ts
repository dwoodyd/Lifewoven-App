import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("dashboard scale readiness", () => {
  it("backs ordered and filtered dashboard reads with composite indexes", () => {
    const schema = source("drizzle/schema.ts");
    expect(schema).toContain("index(\"idx_check_ins_user_created\").on(t.userId, t.createdAt)");
    expect(schema).toContain("index(\"idx_journal_entries_user_created\").on(t.userId, t.createdAt)");
    expect(schema).toContain("index(\"idx_habits_user_active\").on(t.userId, t.isActive)");
    expect(schema).toContain("index(\"idx_habit_logs_user_completed\").on(t.userId, t.completedAt)");
    expect(schema).toContain("index(\"idx_oracle_insights_user_read_created\").on(t.userId, t.isRead, t.createdAt)");
    expect(schema).toContain("index(\"idx_user_pathways_user_status\").on(t.userId, t.status)");
    expect(schema).toContain("index(\"idx_audit_results_user_created\").on(t.userId, t.createdAt)");
  });

  it("orders the dashboard's unread Oracle slice before limiting it", () => {
    const routers = source("server/routers.ts");
    const dashboardStart = routers.indexOf("dashboard: protectedProcedure");
    const dashboard = routers.slice(dashboardStart, routers.indexOf("// ─── App Router", dashboardStart));
    const insightQueryStart = dashboard.indexOf("db.select().from(oracleInsights)");
    const insightQuery = dashboard.slice(insightQueryStart, dashboard.indexOf("db.select().from(userPathways)", insightQueryStart));
    expect(insightQuery).toContain("orderBy(desc(oracleInsights.createdAt))");
    expect(insightQuery.indexOf("orderBy(desc(oracleInsights.createdAt))")).toBeLessThan(insightQuery.indexOf(".limit(3)"));
  });

  it("routes identity sentence generation through the metered LLM boundary", () => {
    const routers = source("server/routers.ts");
    const identityStart = routers.indexOf("generateIdentitySentence: protectedProcedure");
    const identity = routers.slice(identityStart, routers.indexOf("homeContext: protectedProcedure", identityStart));
    expect(identity).toContain("invokeMeteredLLM({");
    expect(identity).toContain('feature: "identity_sentence"');
    expect(identity).toContain('tier: "economical"');
    expect(identity).not.toContain("invokeLLM({");
  });

  it("keeps every application-facing model call behind the metered boundary", () => {
    const routers = source("server/routers.ts");
    expect(routers).not.toContain("invokeLLM(");
    for (const feature of ["journal_prompt", "journal_reflection", "oracle_chat", "oracle_insights", "identity_sentence"]) {
      expect(routers).toContain(`feature: "${feature}"`);
    }
  });
});
