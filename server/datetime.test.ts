import { describe, expect, it } from "vitest";
import { formatLifewovenDate } from "../client/src/lib/datetime";

describe("Pacific date rendering", () => {
  it("treats timezone-naive MySQL timestamps as UTC before rendering Pacific calendar dates", () => {
    expect(formatLifewovenDate("2026-08-20 05:28:17")).toBe("Aug 19, 2026");
  });
});
