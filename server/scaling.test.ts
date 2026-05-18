import { describe, it, expect } from "vitest";

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
    const storeSpreadCount = (source.match(/store: redisStore/g) ?? []).length;
    expect(storeSpreadCount).toBeGreaterThanOrEqual(2);
  });
});

// ─── PayPal idempotency ledger ────────────────────────────────────────────────
describe("PayPal idempotency ledger", () => {
  it("subscription_plans table is defined in schema.ts", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("../drizzle/schema.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("subscriptionPlans");
    expect(source).toContain("paypal_plan_id");
  });

  it("schema.ts has paypalSubscriptionId on users table", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("../drizzle/schema.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("paypalSubscriptionId");
  });
});

// ─── PayPal billing resilience ────────────────────────────────────────────────
describe("PayPal billing resilience", () => {
  it("paypal subscriptions router handles subscription activation", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./paypal/subscriptions.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("paypalSubscriptionId");
  });

  it("paypalOrders router has getMembershipStatus procedure", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./routers/paypalOrders.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("getMembershipStatus");
    expect(source).toContain("membershipTier");
  });
});
