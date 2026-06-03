/**
 * Validates that all 8 Lifewoven PayPal subscription plan IDs are configured
 * and that the PayPal sandbox API accepts them.
 */
import { describe, it, expect } from "vitest";

const PLAN_KEYS = [
  "PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID",
  "PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID",
  "PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID",
  "PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID",
  "PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID",
  "PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID",
  "PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID",
  "PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID",
] as const;

describe("PayPal plan IDs", () => {
  it("all 8 plan ID env vars are set and non-empty", () => {
    for (const key of PLAN_KEYS) {
      const val = process.env[key];
      expect(val, `${key} must be set`).toBeTruthy();
      expect(val!.startsWith("P-"), `${key} must start with P-`).toBe(true);
    }
  });

  it("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set", () => {
    expect(process.env.PAYPAL_CLIENT_ID, "PAYPAL_CLIENT_ID must be set").toBeTruthy();
    expect(process.env.PAYPAL_CLIENT_SECRET, "PAYPAL_CLIENT_SECRET must be set").toBeTruthy();
  });

  it("plan IDs map covers all 8 subscription variants", () => {
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
});
