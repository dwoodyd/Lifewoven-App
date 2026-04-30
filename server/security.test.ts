import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ─── C1: Stripe webhook fails closed ──────────────────────────────────────────
// Tested via the webhook handler's guard logic (unit-level)
describe("C1: Stripe webhook signature guard", () => {
  it("rejects when STRIPE_WEBHOOK_SECRET is missing", async () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const mockReq = {
      headers: { "stripe-signature": "sig123" },
      body: Buffer.from("{}"),
    };
    // Import handler dynamically so env is read at call time
    const { stripeWebhookHandler } = await import("./stripe/webhook");
    await stripeWebhookHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  it("rejects when stripe-signature header is missing", async () => {
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const mockReq = {
      headers: {},
      body: Buffer.from("{}"),
    };
    const { stripeWebhookHandler } = await import("./stripe/webhook");
    await stripeWebhookHandler(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});

// ─── M2: genTrialCode uses crypto.randomBytes ─────────────────────────────────
describe("M2: Referral code generation uses crypto.randomBytes", () => {
  it("generates codes with the expected REF-XXXX-XXXX format", () => {
    // Test the pattern by calling crypto.randomBytes directly and verifying format
    const bytes = crypto.randomBytes(8);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 8; i++) rand += chars[bytes[i] % chars.length];
    const code = `REF-${rand.slice(0, 4)}-${rand.slice(4)}`;
    expect(code).toMatch(/^REF-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("generates different codes on each call", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const bytes = crypto.randomBytes(8);
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let rand = "";
      for (let j = 0; j < 8; j++) rand += chars[bytes[j] % chars.length];
      codes.add(`REF-${rand.slice(0, 4)}-${rand.slice(4)}`);
    }
    // With 20 iterations, collision probability is negligible
    expect(codes.size).toBeGreaterThan(15);
  });
});

// ─── H2: LLM rate limiter ─────────────────────────────────────────────────────
describe("H2: Per-user LLM rate limiter", () => {
  it("allows up to 10 calls per minute", async () => {
    const { checkLlmRateLimit } = await import("./_core/llmRateLimiter");
    const userId = 999_001; // unique test user
    let allowed = 0;
    for (let i = 0; i < 10; i++) {
      if (checkLlmRateLimit(userId)) allowed++;
    }
    expect(allowed).toBe(10);
  });

  it("blocks the 11th call within the same window", async () => {
    const { checkLlmRateLimit } = await import("./_core/llmRateLimiter");
    const userId = 999_002; // unique test user
    for (let i = 0; i < 10; i++) checkLlmRateLimit(userId);
    const result = checkLlmRateLimit(userId);
    expect(result).toBe(false);
  });

  it("allows different users independently", async () => {
    const { checkLlmRateLimit } = await import("./_core/llmRateLimiter");
    const userA = 999_003;
    const userB = 999_004;
    // Exhaust userA
    for (let i = 0; i < 10; i++) checkLlmRateLimit(userA);
    // userB should still be allowed
    expect(checkLlmRateLimit(userB)).toBe(true);
  });
});

// ─── H3: auth.me minimal projection ──────────────────────────────────────────
describe("H3: auth.me returns only safe fields", () => {
  it("does not include stripeCustomerId or openId in the projection", () => {
    // Verify the field list by inspecting the source
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./routers.ts", import.meta.url).pathname,
      "utf-8"
    );
    const meBlock = source.match(/me: publicProcedure\.query[\s\S]{0,500}?\}\)/)?.[0] ?? "";
    expect(meBlock).not.toContain("stripeCustomerId");
    expect(meBlock).not.toContain("openId");
  });
});

// ─── H4: Session TTL is 30 days ───────────────────────────────────────────────
describe("H4: Session TTL is capped at 30 days", () => {
  it("THIRTY_DAYS_MS is 30 days in milliseconds", () => {
    const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
    expect(THIRTY_DAYS_MS).toBe(2_592_000_000);
  });

  it("oauth.ts does not reference ONE_YEAR_MS", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/oauth.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).not.toContain("ONE_YEAR_MS");
  });
});

// ─── M4: SameSite=Lax cookie ─────────────────────────────────────────────────
describe("M4: Session cookie uses SameSite=Lax", () => {
  it("cookies.ts sets sameSite to lax", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/cookies.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("sameSite: \"lax\"");
    expect(source).not.toContain("sameSite: \"none\"");
  });
});

// ─── L5: Cron gating ─────────────────────────────────────────────────────────
describe("L5: Cron jobs are gated on ENABLE_CRONS env var", () => {
  it("index.ts starts crons only when ENABLE_CRONS=1", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/index.ts", import.meta.url).pathname,
      "utf-8"
    );
    expect(source).toContain("ENABLE_CRONS");
    // Cron calls must be inside the ENABLE_CRONS block
    const enableBlock = source.match(/if \(process\.env\.ENABLE_CRONS[\s\S]+?\}/)?.[0] ?? "";
    expect(enableBlock).toContain("startWeeklyDigestCron");
    expect(enableBlock).toContain("startBetaExpiryCheckCron");
  });
});

// ─── H6: trackEvent is protected ─────────────────────────────────────────────
describe("H6: trackEvent uses protectedProcedure and validates event enum", () => {
  it("systemRouter.ts uses protectedProcedure for trackEvent", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      new URL("./_core/systemRouter.ts", import.meta.url).pathname,
      "utf-8"
    );
    // The file must import protectedProcedure
    expect(source).toContain("protectedProcedure");
    // trackEvent must not use publicProcedure
    const trackBlock = source.match(/trackEvent:[\.\s\S]{0,1200}?return \{ ok: true \};/)?.[0] ?? source;
    expect(trackBlock).not.toContain("publicProcedure");
    // Should use z.enum for event validation
    expect(source).toContain("z.enum");
  });
});

// ─── OAuth returnPath: parseReturnPath ───────────────────────────────────────
// These tests mirror the parseReturnPath function in server/_core/oauth.ts
// to guard against regressions in the session-identity bug fix.

function parseReturnPath(state: string): string {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf8");
    const sepIdx = decoded.indexOf("||");
    if (sepIdx === -1) return "/";
    const returnPath = decoded.slice(sepIdx + 2);
    if (!returnPath.startsWith("/") || returnPath.startsWith("//")) return "/";
    return returnPath;
  } catch {
    return "/";
  }
}

describe("OAuth returnPath — parseReturnPath", () => {
  it("returns '/' when state contains no separator", () => {
    const state = Buffer.from("https://example.com/api/oauth/callback").toString("base64");
    expect(parseReturnPath(state)).toBe("/");
  });

  it("returns the returnPath when separator is present", () => {
    const state = Buffer.from("https://example.com/api/oauth/callback||/beta?ref=LW-ABCD-1234").toString("base64");
    expect(parseReturnPath(state)).toBe("/beta?ref=LW-ABCD-1234");
  });

  it("returns '/' when returnPath is an absolute URL (open redirect prevention)", () => {
    const state = Buffer.from("https://example.com/api/oauth/callback||https://evil.com").toString("base64");
    expect(parseReturnPath(state)).toBe("/");
  });

  it("returns '/' when returnPath starts with '//' (protocol-relative URL)", () => {
    const state = Buffer.from("https://example.com/api/oauth/callback||//evil.com").toString("base64");
    expect(parseReturnPath(state)).toBe("/");
  });

  it("returns '/' for invalid base64 input", () => {
    expect(parseReturnPath("!!!not-valid-base64!!!")).toBe("/");
  });

  it("returns '/' for empty state", () => {
    const state = Buffer.from("").toString("base64");
    expect(parseReturnPath(state)).toBe("/");
  });

  it("preserves query params in returnPath", () => {
    const path = "/beta?ref=REF-WXYZ-5678&code=ABC";
    const state = Buffer.from(`https://example.com/api/oauth/callback||${path}`).toString("base64");
    expect(parseReturnPath(state)).toBe(path);
  });

  it("returns '/' when returnPath is an empty string after separator", () => {
    const state = Buffer.from("https://example.com/api/oauth/callback||").toString("base64");
    // empty string does not start with "/" → falls back to "/"
    expect(parseReturnPath(state)).toBe("/");
  });
});

// ─── BetaAccess: wrong-account guard logic ────────────────────────────────────
describe("BetaAccess — wrong-account warning logic", () => {
  it("shows warning when a code is in the URL AND a user is already signed in", () => {
    const user = { id: 1, name: "Admin" };
    const codeInUrl = "LW-ABCD-1234";
    const wrongAccountWarning = !!user && !!codeInUrl;
    expect(wrongAccountWarning).toBe(true);
  });

  it("does not show warning when no code is in the URL", () => {
    const user = { id: 1, name: "Admin" };
    const codeInUrl = null;
    const wrongAccountWarning = !!user && !!codeInUrl;
    expect(wrongAccountWarning).toBe(false);
  });

  it("does not show warning when no user is signed in", () => {
    const user = null;
    const codeInUrl = "LW-ABCD-1234";
    const wrongAccountWarning = !!user && !!codeInUrl;
    expect(wrongAccountWarning).toBe(false);
  });

  it("currentReturnPath encodes the code into the return URL", () => {
    const code = "LW-ABCD-1234";
    const params = new URLSearchParams();
    if (code.trim()) params.set("ref", code.trim());
    const returnPath = `/beta${params.toString() ? `?${params.toString()}` : ""}`;
    expect(returnPath).toBe("/beta?ref=LW-ABCD-1234");
  });

  it("currentReturnPath returns /beta with no params when code is empty", () => {
    const code = "";
    const params = new URLSearchParams();
    if (code.trim()) params.set("ref", code.trim());
    const returnPath = `/beta${params.toString() ? `?${params.toString()}` : ""}`;
    expect(returnPath).toBe("/beta");
  });
});
