import { describe, expect, it } from "vitest";

function decodeBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

describe("Web Push VAPID configuration", () => {
  it("loads a structurally valid VAPID public/private key pair from the runtime environment", () => {
    const publicKey = process.env.VAPID_PUBLIC_KEY ?? "";
    const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";

    expect(decodeBase64Url(publicKey)).toHaveLength(65);
    expect(decodeBase64Url(privateKey)).toHaveLength(32);
  });
});
