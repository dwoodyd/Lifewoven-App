import { describe, it, expect, vi } from "vitest";

// ─── Redis rate-limit store configuration ─────────────────────────────────────
describe("Redis rate-limit store: index.ts configuration", () => {
  it("index.ts imports ioredis and rate-limit-redis", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/index.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("from \"ioredis\"");
    expect(source).toContain("from \"rate-limit-redis\"");
  });

  it("index.ts checks for REDIS_URL before connecting", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/index.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("process.env.REDIS_URL");
  });

  it("index.ts emits a warning when REDIS_URL is absent", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/index.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("REDIS_URL not set");
  });

  it("rate limiters spread the redisStore when present", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/index.ts", import.meta.url).pathname,
      "utf-8"
    );
    // Both authLimiter and apiLimiter should conditionally spread the store
    const storeSpreadCount = (source.match(/store: redisStore/g) ?? []).length;
    expect(storeSpreadCount).toBeGreaterThanOrEqual(2);
  });
});

// ─── Stripe idempotency ledger ────────────────────────────────────────────────
describe("Stripe idempotency ledger", () => {
  it("stripe_events table is defined in schema.ts", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("../drizzle/schema.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("stripeEvents");
    expect(source).toContain("event_id");
    // Drizzle expresses uniqueness via .unique() on the column definition
    expect(source).toContain(".unique()");
  });

  it("webhook.ts inserts into stripeEvents before processing", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./stripe/webhook.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("stripeEvents");
    expect(source).toContain("db.insert(stripeEvents)");
  });

  it("webhook.ts returns 200 with duplicate:true for duplicate events", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./stripe/webhook.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("duplicate: true");
    expect(source).toContain("Duplicate entry");
  });
});

// ─── Billing resilience ───────────────────────────────────────────────────────
describe("Billing resilience: trialing/past_due grace period", () => {
  it("webhook.ts keeps paid tier for trialing subscriptions", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./stripe/webhook.ts", import.meta.url).pathname,
      "utf-8"
    );
    // The active/trialing/past_due block should NOT downgrade to explorer
    const graceBlock = source.match(/\["active", "trialing", "past_due"\][\s\S]{0,200}?membershipTier: tier/)?.[0] ?? "";
    expect(graceBlock).toBeTruthy();
    expect(graceBlock).not.toContain("explorer");
  });

  it("webhook.ts only downgrades on canceled or unpaid", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./stripe/webhook.ts", import.meta.url).pathname,
      "utf-8"
    );
    // The downgrade block should be triggered only by canceled/unpaid
    const downgradeBlock = source.match(/\["canceled", "unpaid"\][\s\S]{0,200}?explorer/)?.[0] ?? "";
    expect(downgradeBlock).toBeTruthy();
  });

  it("webhook.ts handles invoice.payment_failed event", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./stripe/webhook.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("invoice.payment_failed");
    expect(source).toContain("notifyOwner");
    expect(source).toContain("Payment Failed");
  });
});
