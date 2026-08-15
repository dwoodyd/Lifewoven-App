import { describe, expect, it } from "vitest";
import { deriveSessionKey, sdk } from "./_core/sdk";

describe("deriveSessionKey", () => {
  it("derives a stable 32-byte key from a compact Manus session secret", () => {
    const compactSecret = "AbCdEfGhIjKlMnOpQrStUv";
    const first = deriveSessionKey(compactSecret);
    const second = deriveSessionKey(compactSecret);

    expect(first).toHaveLength(32);
    expect(Array.from(first)).toEqual(Array.from(second));
  });

  it("retains raw-key behavior for established 32+ character secrets", () => {
    const establishedSecret = "0123456789abcdef0123456789abcdef";

    expect(new TextDecoder().decode(deriveSessionKey(establishedSecret))).toBe(establishedSecret);
  });

  it("fails closed for missing or materially weak secrets", () => {
    expect(() => deriveSessionKey("short-secret")).toThrow("at least 16 characters");
  });

  it("signs and verifies a session using the active platform secret", async () => {
    const token = await sdk.createSessionToken("session-key-test-user", {
      name: "Session Key Test",
      expiresInMs: 60_000,
    });

    await expect(sdk.verifySession(token)).resolves.toMatchObject({
      openId: "session-key-test-user",
      name: "Session Key Test",
    });
  });
});
