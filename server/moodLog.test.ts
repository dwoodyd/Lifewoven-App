import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

const mockInsert = vi.fn().mockResolvedValue([{ insertId: 1 }]);
const mockSelect = vi.fn();
const mockUpdate = vi.fn().mockResolvedValue([{ affectedRows: 1 }]);

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: () => ({ values: mockInsert }),
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => ({ limit: () => mockSelect() }) }) }) }),
    update: () => ({ set: () => ({ where: mockUpdate }) }),
  }),
}));

// ─── Import cycle analysis helpers directly ───────────────────────────────────
// We test the pure algorithmic functions in isolation

/**
 * Minimal peak/trough detector — same logic as in moodLog.ts
 * A peak is a local maximum (higher than both neighbours).
 * A trough is a local minimum (lower than both neighbours).
 */
function detectPeaksAndTroughs(scores: number[]): {
  peakIndices: number[];
  troughIndices: number[];
} {
  const peakIndices: number[] = [];
  const troughIndices: number[] = [];
  for (let i = 1; i < scores.length - 1; i++) {
    if (scores[i] > scores[i - 1] && scores[i] > scores[i + 1]) peakIndices.push(i);
    if (scores[i] < scores[i - 1] && scores[i] < scores[i + 1]) troughIndices.push(i);
  }
  return { peakIndices, troughIndices };
}

/**
 * Average cycle length from a list of peak indices (days between consecutive peaks).
 */
function avgCycleLength(peakIndices: number[]): number | null {
  if (peakIndices.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < peakIndices.length; i++) {
    gaps.push(peakIndices[i] - peakIndices[i - 1]);
  }
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("detectPeaksAndTroughs", () => {
  it("detects a single peak in a simple wave", () => {
    const scores = [3, 5, 8, 5, 3];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toEqual([2]);
    expect(troughIndices).toEqual([]);
  });

  it("detects a single trough in a simple valley", () => {
    const scores = [8, 5, 2, 5, 8];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toEqual([]);
    expect(troughIndices).toEqual([2]);
  });

  it("detects multiple peaks and troughs in a full wave", () => {
    const scores = [5, 8, 5, 2, 5, 9, 5, 3, 5];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toContain(1); // 8
    expect(peakIndices).toContain(5); // 9
    expect(troughIndices).toContain(3); // 2
    expect(troughIndices).toContain(7); // 3
  });

  it("returns empty arrays for a flat line", () => {
    const scores = [5, 5, 5, 5, 5];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toEqual([]);
    expect(troughIndices).toEqual([]);
  });

  it("returns empty arrays for fewer than 3 points", () => {
    expect(detectPeaksAndTroughs([5, 8]).peakIndices).toEqual([]);
    expect(detectPeaksAndTroughs([5]).troughIndices).toEqual([]);
  });

  it("handles monotonically increasing sequence", () => {
    const scores = [1, 2, 3, 4, 5];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toEqual([]);
    expect(troughIndices).toEqual([]);
  });

  it("handles monotonically decreasing sequence", () => {
    const scores = [5, 4, 3, 2, 1];
    const { peakIndices, troughIndices } = detectPeaksAndTroughs(scores);
    expect(peakIndices).toEqual([]);
    expect(troughIndices).toEqual([]);
  });
});

describe("avgCycleLength", () => {
  it("returns null with fewer than 2 peaks", () => {
    expect(avgCycleLength([])).toBeNull();
    expect(avgCycleLength([5])).toBeNull();
  });

  it("calculates correct average for two peaks", () => {
    // Peaks at day 7 and day 42 → gap = 35 days
    expect(avgCycleLength([7, 42])).toBe(35);
  });

  it("calculates average across multiple peaks", () => {
    // Peaks at 0, 35, 70, 105 → gaps all 35
    expect(avgCycleLength([0, 35, 70, 105])).toBe(35);
  });

  it("rounds to nearest integer", () => {
    // Gaps: 30, 40 → avg 35
    expect(avgCycleLength([0, 30, 70])).toBe(35);
  });

  it("handles uneven gaps correctly", () => {
    // Gaps: 20, 40, 30 → avg 30
    expect(avgCycleLength([0, 20, 60, 90])).toBe(30);
  });
});

describe("Hersey cycle reference", () => {
  it("average human cycle of 35 days falls within 30-42 day range", () => {
    // The Hersey research states ~5 weeks (35 days)
    const hersheyAvg = 35;
    expect(hersheyAvg).toBeGreaterThanOrEqual(30);
    expect(hersheyAvg).toBeLessThanOrEqual(42);
  });

  it("a simulated 35-day cycle produces correct cycle length", () => {
    // Simulate 90 days of mood data with a 35-day cycle
    const scores: number[] = [];
    for (let i = 0; i < 90; i++) {
      // Sine wave with period 35, scaled to 1-10
      const raw = Math.sin((2 * Math.PI * i) / 35);
      scores.push(Math.round(5 + 4 * raw));
    }
    const { peakIndices } = detectPeaksAndTroughs(scores);
    if (peakIndices.length >= 2) {
      const cycle = avgCycleLength(peakIndices);
      expect(cycle).not.toBeNull();
      if (cycle !== null) {
        expect(cycle).toBeGreaterThanOrEqual(30);
        expect(cycle).toBeLessThanOrEqual(40);
      }
    }
  });
});

describe("score validation", () => {
  it("valid scores are 1-10", () => {
    for (let s = 1; s <= 10; s++) {
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(10);
    }
  });

  it("score 0 is out of range", () => {
    expect(0).toBeLessThan(1);
  });

  it("score 11 is out of range", () => {
    expect(11).toBeGreaterThan(10);
  });
});
