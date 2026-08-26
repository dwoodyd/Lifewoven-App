import { describe, expect, it } from "vitest";
import { getAccessLevel, getEffectivePrice } from "./routers/store";

describe("Seeker standalone product pricing", () => {
  it("applies the verified 30% discount to a $97 product", () => {
    const level = getAccessLevel("seeker", "user");
    expect(level).toBe("discount");
    expect(getEffectivePrice(97, level)).toBe(67.9);
  });

  it("does not trust client presentation: Oracle access resolves to included", () => {
    const level = getAccessLevel("oracle", "user");
    expect(level).toBe("library");
    expect(getEffectivePrice(97, level)).toBe(0);
  });
});
