import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { hasSufficientWeeklyReflectionData, scoreGroundCheck } from "./routers/btw";

// ─── Ground Check Scoring ─────────────────────────────────────────────────────
describe("BTW Ground Check Scoring", () => {
  it("returns settled when all answers are low", () => {
    const result = scoreGroundCheck([0, 0, 0, 0, 0, 0, 0]);
    expect(result.state).toBe("settled");
    expect(result.practice).toBe("enter_the_ground");
  });

  it("returns depleted when depletion answer is high", () => {
    const result = scoreGroundCheck([2, 2, 2, 2, 2, 2, 5]);
    expect(result.state).toBe("depleted");
    expect(result.practice).toBe("gentle_reset");
  });

  it("returns bracing when fear is high", () => {
    const result = scoreGroundCheck([2, 5, 1, 1, 1, 1, 1]);
    expect(result.state).toBe("bracing");
    expect(result.practice).toBe("return_to_ground");
  });

  it("returns striving when striving is high", () => {
    const result = scoreGroundCheck([2, 1, 5, 1, 1, 1, 1]);
    expect(result.state).toBe("striving");
    expect(result.practice).toBe("living_as_heard");
  });

  it("returns drifting when drift is high", () => {
    const result = scoreGroundCheck([2, 1, 1, 1, 5, 1, 1]);
    expect(result.state).toBe("drifting");
    expect(result.practice).toBe("midday_return");
  });

  it("prioritizes depletion over fear", () => {
    const result = scoreGroundCheck([2, 5, 1, 5, 1, 1, 5]);
    expect(result.state).toBe("depleted");
  });

  it("does not call a midpoint reading settled", () => {
    expect(scoreGroundCheck([2, 2, 2, 2, 2, 2, 2]).state).toBe("drifting");
  });

  it("honors scattered as a floor even when answers are otherwise calm", () => {
    expect(scoreGroundCheck([5, 0, 0, 0, 0, 0, 0], "scattered").state).toBe("drifting");
  });

  it("weights declared burden and carried load against a settled result", () => {
    expect(scoreGroundCheck([4, 1, 1, 2, 1, 1, 1], "burdened").state).toBe("bracing");
  });
});

// ─── BTW Schema Validation ────────────────────────────────────────────────────

describe("BTW Prayer Tags", () => {
  const VALID_TONE_TAGS = ["trust", "fear", "striving", "grief", "gratitude", "honest", "mixed"];
  const VALID_STATUS_TAGS = ["carrying", "released", "answered", "returning"];
  const VALID_TOPIC_TAGS = ["long_wait", "fear", "provision", "relationship", "calling", "grief", "uncertainty", "gratitude", "not_yet", "answered", "still_carrying"];

  it("has all expected tone tags", () => {
    expect(VALID_TONE_TAGS).toContain("honest");
    expect(VALID_TONE_TAGS).toContain("trust");
    expect(VALID_TONE_TAGS).toHaveLength(7);
  });

  it("has all expected status tags", () => {
    expect(VALID_STATUS_TAGS).toContain("carrying");
    expect(VALID_STATUS_TAGS).toContain("answered");
    expect(VALID_STATUS_TAGS).toHaveLength(4);
  });

  it("has all expected topic tags", () => {
    expect(VALID_TOPIC_TAGS).toContain("still_carrying");
    expect(VALID_TOPIC_TAGS).toContain("long_wait");
    expect(VALID_TOPIC_TAGS).toHaveLength(11);
  });
});

// ─── BTW Return Types ─────────────────────────────────────────────────────────

describe("BTW Return Types", () => {
  const VALID_RETURN_TYPES = ["30sec", "2min", "fear", "discouragement", "depletion"];

  it("includes all five return types", () => {
    expect(VALID_RETURN_TYPES).toHaveLength(5);
    expect(VALID_RETURN_TYPES).toContain("30sec");
    expect(VALID_RETURN_TYPES).toContain("depletion");
  });
});

// ─── BTW Session Types ────────────────────────────────────────────────────────

describe("BTW Session Types", () => {
  const VALID_SESSION_TYPES = ["morning", "midday", "evening", "return", "emergency"];

  it("covers all daily rhythm sessions", () => {
    expect(VALID_SESSION_TYPES).toContain("morning");
    expect(VALID_SESSION_TYPES).toContain("midday");
    expect(VALID_SESSION_TYPES).toContain("evening");
    expect(VALID_SESSION_TYPES).toHaveLength(5);
  });
});

describe("Weekly Reflection data sufficiency", () => {
  it("requires at least three recent check-ins when no recent Weave entry exists", () => {
    expect(hasSufficientWeeklyReflectionData({ checkInCount: 2, journalEntryCount: 0 })).toBe(false);
    expect(hasSufficientWeeklyReflectionData({ checkInCount: 3, journalEntryCount: 0 })).toBe(true);
  });

  it("requires three recent Weave entries when check-ins do not meet the threshold", () => {
    expect(hasSufficientWeeklyReflectionData({ checkInCount: 0, journalEntryCount: 2 })).toBe(false);
    expect(hasSufficientWeeklyReflectionData({ checkInCount: 0, journalEntryCount: 3 })).toBe(true);
  });

  it("rejects generation when the user has no meaningful recent data", () => {
    expect(hasSufficientWeeklyReflectionData({ checkInCount: 0, journalEntryCount: 0 })).toBe(false);
  });

  it("counts enough recent Weave entries to apply the same three-record evidence rule", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers/btw.ts"), "utf8");
    const helperBlock = routerSource.slice(routerSource.indexOf("async function getWeeklyReflectionEligibility"), routerSource.indexOf("// ─── Router"));
    expect(helperBlock).toContain("journalEntries.createdAt, weekAgo))).limit(3)");
    expect(helperBlock).not.toContain("journalEntries.createdAt, weekAgo))).limit(1)");
  });
});
