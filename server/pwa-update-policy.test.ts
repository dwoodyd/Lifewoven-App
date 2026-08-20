import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA update policy", () => {
  it("activates new workers promptly and prefers fresh online JavaScript", () => {
    const config = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");
    expect(config).toContain("clientsClaim: true");
    expect(config).toContain("skipWaiting: true");
    expect(config).toContain('handler: "NetworkFirst"');
  });
});
