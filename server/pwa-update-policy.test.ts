import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA update policy", () => {
  it("activates a new worker immediately and refuses to serve HTML for missing hashed JavaScript", () => {
    const config = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");
    const main = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(config).toContain("clientsClaim: true");
    const viteServer = readFileSync(resolve(process.cwd(), "server/_core/vite.ts"), "utf8");
    expect(config).toContain("skipWaiting: true");
    expect(config).toContain('registerType: "autoUpdate"');
    expect(main).toContain("registerSW({ immediate: true })");
    expect(main).not.toContain("onNeedRefresh");
    expect(config).toContain('handler: "NetworkFirst"');
    expect(viteServer).toContain("isMissingJavaScriptAsset");
    expect(viteServer).toContain("JavaScript asset not found");
    expect(html).toContain('id="pwa-startup-recovery"');
    expect(html).toContain("data-lifewoven-bootstrap");
    expect(html).toContain("target === bootstrap");
    expect(html).toContain("MutationObserver");
    expect(html).toContain("navigator.serviceWorker.getRegistrations()");
    expect(html).toContain("caches.keys()");
    expect(app).not.toContain("lazy(() => import(");
    expect(main).toContain('getElementById("pwa-startup-recovery")');
  });
});
