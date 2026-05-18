/**
 * PWA & Infrastructure Tests
 * Covers: manifest shape, PayPal webhook handler, REDIS_URL env, storageProxy route
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// ── 1. manifest.json shape ────────────────────────────────────────────────────
describe("PWA manifest", () => {
  const manifestPath = path.resolve(__dirname, "../client/public/manifest.json");

  it("exists in client/public", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it("has required PWA fields", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it("has at least one 512x512 icon", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const has512 = manifest.icons.some((i: { sizes: string }) => i.sizes === "512x512");
    expect(has512).toBe(true);
  });

  it("theme_color is set", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.theme_color).toMatch(/^#/);
  });
});

// ── 2. vite.config.ts includes VitePWA ───────────────────────────────────────
describe("vite.config.ts", () => {
  const viteCfg = fs.readFileSync(
    path.resolve(__dirname, "../vite.config.ts"),
    "utf-8"
  );

  it("imports VitePWA", () => {
    expect(viteCfg).toContain("vite-plugin-pwa");
  });

  it("sets registerType autoUpdate", () => {
    expect(viteCfg).toContain("autoUpdate");
  });

  it("includes workbox globPatterns", () => {
    expect(viteCfg).toContain("globPatterns");
  });
});

// ── 3. index.html PWA meta tags ───────────────────────────────────────────────
describe("index.html PWA meta", () => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "../client/index.html"),
    "utf-8"
  );

  it("has theme-color meta", () => {
    expect(html).toContain('name="theme-color"');
  });

  it("has apple-touch-icon link", () => {
    expect(html).toContain("apple-touch-icon");
  });

  it("has apple-mobile-web-app-capable meta", () => {
    expect(html).toContain("apple-mobile-web-app-capable");
  });
});

// ── 4. PayPal webhook handler ─────────────────────────────────────────────────
describe("PayPal webhook handler", () => {
  it("paypal.ts exists in server/paypal", () => {
    expect(
      fs.existsSync(path.resolve(__dirname, "./paypal/paypal.ts"))
    ).toBe(true);
  });

  it("paypal.ts has capture-order endpoint", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "./paypal/paypal.ts"),
      "utf-8"
    );
    expect(src).toContain("capture-order");
  });

  it("paypal.ts calls notifyOwner on payment", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "./paypal/paypal.ts"),
      "utf-8"
    );
    expect(src).toContain("notifyOwner");
  });
});

// ── 5. Redis rate limiter env detection ──────────────────────────────────────
describe("Redis rate limiter", () => {
  const indexSrc = fs.readFileSync(
    path.resolve(__dirname, "./_core/index.ts"),
    "utf-8"
  );

  it("imports ioredis and rate-limit-redis", () => {
    expect(indexSrc).toContain("ioredis");
    expect(indexSrc).toContain("rate-limit-redis");
  });

  it("checks REDIS_URL env before connecting", () => {
    expect(indexSrc).toContain("REDIS_URL");
  });

  it("falls back to memory when REDIS_URL absent", () => {
    expect(indexSrc).toContain("in-memory store");
  });
});

// ── 6. storageProxy route registered ─────────────────────────────────────────
describe("storageProxy", () => {
  it("storageProxy.ts exists", () => {
    expect(
      fs.existsSync(path.resolve(__dirname, "./_core/storageProxy.ts"))
    ).toBe(true);
  });

  it("is registered in index.ts", () => {
    const indexSrc = fs.readFileSync(
      path.resolve(__dirname, "./_core/index.ts"),
      "utf-8"
    );
    expect(indexSrc).toContain("registerStorageProxy");
  });
});
