import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA update policy", () => {
  it("offers prompt-based worker activation and prefers fresh online JavaScript", () => {
    const config = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");
    const main = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(config).toContain("clientsClaim: true");
    expect(config).toContain("skipWaiting: true");
    expect(config).toContain('registerType: "prompt"');
    expect(main).toContain("onNeedRefresh");
    expect(config).toContain('handler: "NetworkFirst"');
    expect(html).toContain('id="pwa-startup-recovery"');
    expect(html).toContain("target.type === 'module'");
    expect(html).toContain("MutationObserver");
    expect(html).toContain("navigator.serviceWorker.getRegistrations()");
    expect(html).toContain("caches.keys()");
    expect(app).not.toContain("lazy(() => import(");
    expect(main).toContain('getElementById("pwa-startup-recovery")');
  });
});
