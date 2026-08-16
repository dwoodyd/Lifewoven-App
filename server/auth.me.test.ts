import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      membershipTier: "oracle",
      primaryPathway: "align",
      onboardingCompleted: true,
      foundingMember: false,
      foundingTier: null,
      foundingRateLocked: false,
      needsIntro: false,
      luminEnabled: true,
      billingStatus: "active",
      betaEndDate: null,
      lowBandwidthMode: false,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    } as TrpcContext["user"],
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("auth.me response minimization", () => {
  it("never returns the server-side role, including for an administrator", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.auth.me();

    expect(result).not.toHaveProperty("role");
    expect(result).toMatchObject({ id: 1, membershipTier: "oracle" });
  });
});
