import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  }),
}));

vi.mock("./email", () => ({
  sendRedemptionConfirmationEmail: vi.fn().mockResolvedValue({ id: "email-1" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(): TrpcContext {
  return {
    user: null,
    req: { headers: {}, socket: { remoteAddress: "127.0.0.1" } } as unknown as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("founding invitation router", () => {
  it("keeps validation for already-issued invite codes", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.founding.validateCode({ code: "NOTEXIST" })).resolves.toEqual({
      valid: false,
      reason: "not_found",
    });
  });

  it("does not expose the retired public applications.submit procedure", () => {
    const procedures = (appRouter as unknown as { _def: { procedures: Record<string, unknown> } })._def.procedures;
    expect(procedures).toHaveProperty("founding.validateCode");
    expect(procedures).not.toHaveProperty("applications.submit");
  });
});
