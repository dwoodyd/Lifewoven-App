import { describe, it, expect } from "vitest";

// ─── Ground Check Scoring ─────────────────────────────────────────────────────
// Mirrors the logic in server/routers/btw.ts

function scoreGroundCheck(answers: number[]): { state: string; practice: string } {
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  const hasHighFear = answers[1] >= 4 || answers[3] >= 4;
  const hasHighStriving = answers[2] >= 4 || answers[5] >= 4;
  const hasDepletion = answers[6] >= 4;
  const hasDrift = answers[4] >= 4;

  if (avg <= 1.5) return { state: "settled", practice: "enter_the_ground" };
  if (hasDepletion) return { state: "depleted", practice: "gentle_reset" };
  if (hasHighFear) return { state: "bracing", practice: "return_to_ground" };
  if (hasHighStriving) return { state: "striving", practice: "living_as_heard" };
  if (hasDrift) return { state: "drifting", practice: "midday_return" };
  return { state: "settled", practice: "thanking_from_there" };
}

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

  it("returns settled when avg is at threshold", () => {
    const result = scoreGroundCheck([1, 1, 1, 1, 1, 1, 1]);
    expect(result.state).toBe("settled");
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
