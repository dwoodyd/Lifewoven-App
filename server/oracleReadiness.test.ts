import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildOracleReadiness, hasSufficientOracleEvidence, ORACLE_MINIMUM_RECENT_RECORDS } from "./oracleReadiness";

describe("Oracle evidence threshold", () => {
  it("requires three recent records from one evidence stream before a personalized pattern may be surfaced", () => {
    expect(ORACLE_MINIMUM_RECENT_RECORDS).toBe(3);
    expect(hasSufficientOracleEvidence({ checkInCount: 0, journalEntryCount: 0 })).toBe(false);
    expect(hasSufficientOracleEvidence({ checkInCount: 2, journalEntryCount: 2 })).toBe(false);
    expect(hasSufficientOracleEvidence({ checkInCount: 3, journalEntryCount: 0 })).toBe(true);
    expect(hasSufficientOracleEvidence({ checkInCount: 0, journalEntryCount: 3 })).toBe(true);
  });

  it("reports exact readiness information for an honest empty-data state", () => {
    expect(buildOracleReadiness({ checkInCount: 0, journalEntryCount: 0 })).toEqual({
      checkInCount: 0,
      journalEntryCount: 0,
      totalRecords: 0,
      hasSufficientData: false,
      minimumRecords: 3,
    });
  });

  it("requires the shared threshold before Pattern Mirror reads or generates user-specific insights", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(routerSource).toContain("if (!buildOracleReadiness({ checkInCount: recentCheckIns.length, journalEntryCount: recentJournalEntries.length }).hasSufficientData)");
    expect(routerSource).toContain("const readiness = buildOracleReadiness({ checkInCount: recentCheckIns.length, journalEntryCount: recentJournals.length });");
    expect(routerSource).toContain("if (!readiness.hasSufficientData) {");
    expect(routerSource).toContain("return { insights: [] };");
  });
});
