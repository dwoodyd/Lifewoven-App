import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("first-time user hardening", () => {
  const root = process.cwd();
  const viteConfig = readFileSync(resolve(root, "vite.config.ts"), "utf8");
  const viteServer = readFileSync(resolve(root, "server/_core/vite.ts"), "utf8");
  const html = readFileSync(resolve(root, "client/index.html"), "utf8");
  const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
  const sitemap = readFileSync(resolve(root, "client/public/sitemap.xml"), "utf8");

  it("uses immediate worker activation and preserves a missing-JavaScript 404 boundary", () => {
    expect(viteConfig).toContain('registerType: "autoUpdate"');
    expect(viteConfig).toContain("skipWaiting: true");
    expect(viteConfig).toContain("clientsClaim: true");
    expect(viteServer).toContain("isMissingJavaScriptAsset");
    expect(viteServer).toContain("JavaScript asset not found");
  });

  it("provides plain-language metadata and crawlable public landing content", () => {
    expect(html).toContain("Habits, Identity &amp; Goals With AI Guidance");
    expect(html).toContain("Check in on how you feel");
    expect(html).toContain('id="crawlable-landing"');
    expect(html).toContain('href="/pricing"');
  });

  it("keeps paid tier intent and a single clear first-visit account action", () => {
    expect(home).toContain('getLoginUrl(`/pricing?tier=${tier}`, "signUp")');
    expect(home).toContain('cta: "Start Seeker"');
    expect(home).toContain('cta: "Start Oracle"');
    expect(home).toContain("Start your private space");
    expect(home).toContain("Sign up with Google, Apple, Microsoft, or email");
  });

  it("lists only public HTML routes in the sitemap", () => {
    expect(sitemap).toContain("https://app.lifewoven.click/pricing");
    expect(sitemap).toContain("https://app.lifewoven.click/support");
    expect(sitemap).not.toContain(".png");
    expect(sitemap).not.toContain(".jpg");
  });
});
