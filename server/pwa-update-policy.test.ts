import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA update policy", () => {
  it("offers prompt-based worker activation and prefers fresh online JavaScript", () => {
    const config = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");
    const main = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(config).toContain("clientsClaim: true");
    expect(config).toContain("skipWaiting: false");
    expect(config).toContain('registerType: "prompt"');
    expect(main).toContain("onNeedRefresh");
    expect(config).toContain('handler: "NetworkFirst"');
  });
});
