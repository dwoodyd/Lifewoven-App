import { describe, it, expect, vi, beforeEach } from "vitest";
import { tierCanAccessGroundGuide, tierCanAccessWeeklyReflection, tierCanAccessOracle } from "./stripe/products";

// ─── Tier helper unit tests ────────────────────────────────────────────────────

describe("tierCanAccessGroundGuide", () => {
  it("returns false for explorer", () => {
    expect(tierCanAccessGroundGuide("explorer")).toBe(false);
  });
  it("returns true for seeker", () => {
    expect(tierCanAccessGroundGuide("seeker")).toBe(true);
  });
  it("returns true for oracle", () => {
    expect(tierCanAccessGroundGuide("oracle")).toBe(true);
  });
  it("returns false for null", () => {
    expect(tierCanAccessGroundGuide(null)).toBe(false);
  });
  it("returns false for undefined", () => {
    expect(tierCanAccessGroundGuide(undefined)).toBe(false);
  });
});

describe("tierCanAccessWeeklyReflection", () => {
  it("returns false for explorer", () => {
    expect(tierCanAccessWeeklyReflection("explorer")).toBe(false);
  });
  it("returns true for seeker", () => {
    expect(tierCanAccessWeeklyReflection("seeker")).toBe(true);
  });
  it("returns true for oracle", () => {
    expect(tierCanAccessWeeklyReflection("oracle")).toBe(true);
  });
});

describe("tierCanAccessOracle", () => {
  it("returns false for explorer", () => {
    expect(tierCanAccessOracle("explorer")).toBe(false);
  });
  it("returns false for seeker", () => {
    expect(tierCanAccessOracle("seeker")).toBe(false);
  });
  it("returns true for oracle", () => {
    expect(tierCanAccessOracle("oracle")).toBe(true);
  });
});
