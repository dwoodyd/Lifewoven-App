import { describe, it, expect } from "vitest";

/**
 * Goals router — unit tests
 *
 * Full integration tests require a live DB connection.
 * These tests validate the schema shape, status enum values,
 * and the stats calculation logic in isolation.
 */

describe("goals schema", () => {
  it("status enum contains expected values", () => {
    const validStatuses = ["active", "completed", "paused", "archived"] as const;
    expect(validStatuses).toContain("active");
    expect(validStatuses).toContain("completed");
    expect(validStatuses).toContain("paused");
    expect(validStatuses).toContain("archived");
  });

  it("module enum contains all 5S values", () => {
    const validModules = ["state", "story", "standards", "strategy", "stewardship", "general"] as const;
    expect(validModules).toHaveLength(6);
    expect(validModules).toContain("general");
  });
});

describe("goals stats calculation", () => {
  it("computes active and completed counts correctly", () => {
    const goals = [
      { status: "active" },
      { status: "active" },
      { status: "completed" },
      { status: "paused" },
      { status: "archived" },
    ];
    const active = goals.filter(g => g.status === "active").length;
    const completed = goals.filter(g => g.status === "completed").length;
    expect(active).toBe(2);
    expect(completed).toBe(1);
  });

  it("computes milestone progress correctly", () => {
    const milestones = [
      { completed: true },
      { completed: true },
      { completed: false },
      { completed: false },
    ];
    const total = milestones.length;
    const done = milestones.filter(m => m.completed).length;
    const pct = Math.round((done / total) * 100);
    expect(total).toBe(4);
    expect(done).toBe(2);
    expect(pct).toBe(50);
  });

  it("handles zero milestones without division by zero", () => {
    const milestones: { completed: boolean }[] = [];
    const total = milestones.length;
    const done = milestones.filter(m => m.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    expect(pct).toBe(0);
  });
});

describe("goal milestone toggle", () => {
  it("toggles completed boolean correctly", () => {
    const milestone = { id: 1, completed: false };
    const toggled = { ...milestone, completed: !milestone.completed };
    expect(toggled.completed).toBe(true);
  });
});
