/**
 * Tests for the cross-domain OAuth callback flow.
 * Verifies that the state parsing correctly handles the new 3-part format:
 *   base64(redirectUri||returnPath||finalOrigin)
 * and backward-compatible 2-part and 1-part formats.
 */

import { describe, it, expect } from "vitest";

// Replicate the parseState logic from oauth.ts for unit testing
function parseState(state: string): { returnPath: string; finalOrigin: string } {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf8");
    const parts = decoded.split("||");
    const returnPath = parts[1] || "/";
    const finalOrigin = parts[2] || "";

    const safePath =
      returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? returnPath
        : "/";

    const safeOrigins = [
      /^https:\/\/([a-z0-9-]+\.)*lifewoven\.click$/,
      /^https:\/\/([a-z0-9-]+\.)*manus\.space$/,
      /^https:\/\/([a-z0-9-]+\.)*manus\.computer$/,
      /^http:\/\/localhost(:\d+)?$/,
    ];
    const safeFinalOrigin = safeOrigins.some(r => r.test(finalOrigin))
      ? finalOrigin
      : "";

    return { returnPath: safePath, finalOrigin: safeFinalOrigin };
  } catch {
    return { returnPath: "/", finalOrigin: "" };
  }
}

describe("OAuth cross-domain state parsing", () => {
  it("parses new 3-part state format (cross-domain)", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||/dashboard||https://app.lifewoven.click"
    ).toString("base64");
    const result = parseState(state);
    expect(result.returnPath).toBe("/dashboard");
    expect(result.finalOrigin).toBe("https://app.lifewoven.click");
  });

  it("parses new 3-part state with empty finalOrigin (same domain)", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||/||"
    ).toString("base64");
    const result = parseState(state);
    expect(result.returnPath).toBe("/");
    expect(result.finalOrigin).toBe("");
  });

  it("handles backward-compatible 2-part state format", () => {
    const state = Buffer.from(
      "https://app.lifewoven.click/api/oauth/callback||/beta"
    ).toString("base64");
    const result = parseState(state);
    expect(result.returnPath).toBe("/beta");
    expect(result.finalOrigin).toBe("");
  });

  it("handles backward-compatible 1-part state format", () => {
    const state = Buffer.from(
      "https://app.lifewoven.click/api/oauth/callback"
    ).toString("base64");
    const result = parseState(state);
    expect(result.returnPath).toBe("/");
    expect(result.finalOrigin).toBe("");
  });

  it("blocks open redirect in returnPath", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||//evil.com||"
    ).toString("base64");
    const result = parseState(state);
    expect(result.returnPath).toBe("/");
  });

  it("blocks untrusted finalOrigin", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||/||https://evil.com"
    ).toString("base64");
    const result = parseState(state);
    expect(result.finalOrigin).toBe("");
  });

  it("allows manus.computer multi-level subdomain", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||/||https://3000-abc.us2.manus.computer"
    ).toString("base64");
    const result = parseState(state);
    expect(result.finalOrigin).toBe("https://3000-abc.us2.manus.computer");
  });

  it("allows localhost for development", () => {
    const state = Buffer.from(
      "https://lifeosplatform-krrwopfb.manus.space/api/oauth/callback||/||http://localhost:3000"
    ).toString("base64");
    const result = parseState(state);
    expect(result.finalOrigin).toBe("http://localhost:3000");
  });
});

describe("One-time code handoff flow", () => {
  it("nanoid generates URL-safe codes (no +, /, or = characters)", () => {
    // nanoid uses A-Za-z0-9_- alphabet by default — all URL-safe
    const { nanoid } = require("nanoid");
    for (let i = 0; i < 50; i++) {
      const code = nanoid(48);
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(code).not.toContain("+");
      expect(code).not.toContain("/");
      expect(code).not.toContain("=");
    }
  });

  it("handoff URL is constructed with searchParams (proper encoding)", () => {
    const finalOrigin = "https://app.lifewoven.click";
    const code = "abc123_-XYZ";
    const handoffUrl = new URL(`${finalOrigin}/api/auth/complete`);
    handoffUrl.searchParams.set("code", code);
    expect(handoffUrl.toString()).toBe(
      "https://app.lifewoven.click/api/auth/complete?code=abc123_-XYZ"
    );
  });

  it("safe returnPath validation rejects double-slash open redirect", () => {
    const returnPath = "//evil.com/steal";
    const safePath =
      returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? returnPath
        : "/";
    expect(safePath).toBe("/");
  });

  it("safe returnPath validation accepts normal paths", () => {
    const paths = ["/", "/dashboard", "/btw/living-as-heard", "/pricing"];
    for (const p of paths) {
      const safePath = p.startsWith("/") && !p.startsWith("//") ? p : "/";
      expect(safePath).toBe(p);
    }
  });
});
