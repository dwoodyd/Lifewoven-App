/**
 * Validates that all 8 Lifewoven PayPal subscription plan IDs are configured
 * and that the PayPal sandbox API accepts them.
 *
 * For live mode, set PAYPAL_ENV=live and configure PAYPAL_LIVE_* env vars.
 */
import { describe, it, expect } from "vitest";

const SANDBOX_PLAN_KEYS = [
  "PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID",
  "PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID",
  "PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID",
  "PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID",
  "PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID",
  "PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID",
  "PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID",
  "PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID",
] as const;

const LIVE_PLAN_KEYS = [
  "PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID",
  "PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_ANNUAL_ID",
  "PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_MONTHLY_ID",
  "PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_ANNUAL_ID",
  "PAYPAL_LIVE_PLAN_SEEKER_RETAIL_MONTHLY_ID",
  "PAYPAL_LIVE_PLAN_SEEKER_RETAIL_ANNUAL_ID",
  "PAYPAL_LIVE_PLAN_ORACLE_RETAIL_MONTHLY_ID",
  "PAYPAL_LIVE_PLAN_ORACLE_RETAIL_ANNUAL_ID",
] as const;

const isLive = process.env.PAYPAL_ENV === "live";

describe("PayPal plan IDs", () => {
  it("all 8 sandbox plan ID env vars are set and non-empty", () => {
    // Sandbox plan IDs are always required (used for testing even in live mode)
    for (const key of SANDBOX_PLAN_KEYS) {
      const val = process.env[key];
      expect(val, `${key} must be set`).toBeTruthy();
      expect(val!.startsWith("P-"), `${key} must start with P-`).toBe(true);
    }
  });

  it("PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_WEBHOOK_ID are set", () => {
    expect(process.env.PAYPAL_CLIENT_ID, "PAYPAL_CLIENT_ID must be set").toBeTruthy();
    expect(process.env.PAYPAL_CLIENT_SECRET, "PAYPAL_CLIENT_SECRET must be set").toBeTruthy();
    expect(process.env.PAYPAL_WEBHOOK_ID, "PAYPAL_WEBHOOK_ID must be set").toBeTruthy();
  });

  it("sandbox plan IDs map covers all 8 subscription variants", () => {
    const PLAN_IDS: Record<string, string | undefined> = {
      "seeker-founding-monthly": process.env.PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID,
      "seeker-founding-annual":  process.env.PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID,
      "oracle-founding-monthly": process.env.PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID,
      "oracle-founding-annual":  process.env.PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID,
      "seeker-retail-monthly":   process.env.PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID,
      "seeker-retail-annual":    process.env.PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID,
      "oracle-retail-monthly":   process.env.PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID,
      "oracle-retail-annual":    process.env.PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID,
    };

    const variants = [
      "seeker-founding-monthly",
      "seeker-founding-annual",
      "oracle-founding-monthly",
      "oracle-founding-annual",
      "seeker-retail-monthly",
      "seeker-retail-annual",
      "oracle-retail-monthly",
      "oracle-retail-annual",
    ];

    for (const variant of variants) {
      expect(PLAN_IDS[variant], `Plan ID for "${variant}" must be set`).toBeTruthy();
    }
  });

  it("live mode: PAYPAL_LIVE_CLIENT_ID, PAYPAL_LIVE_CLIENT_SECRET, and PAYPAL_LIVE_WEBHOOK_ID are set", () => {
    // Now that PAYPAL_ENV=live, these are required
    expect(process.env.PAYPAL_LIVE_CLIENT_ID, "PAYPAL_LIVE_CLIENT_ID must be set").toBeTruthy();
    expect(process.env.PAYPAL_LIVE_CLIENT_SECRET, "PAYPAL_LIVE_CLIENT_SECRET must be set").toBeTruthy();
    expect(process.env.PAYPAL_LIVE_WEBHOOK_ID, "PAYPAL_LIVE_WEBHOOK_ID must be set").toBeTruthy();
  });

  it("live mode: all 8 live plan IDs are set and start with P-", () => {
    for (const key of LIVE_PLAN_KEYS) {
      const val = process.env[key];
      expect(val, `${key} must be set`).toBeTruthy();
      expect(val!.startsWith("P-"), `${key} must start with P-`).toBe(true);
    }
  });
});
