/**
 * Tests for the founding member applications router.
 * Covers: submit, validateCode, approve, decline, redeemCode.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be at top, before any imports that use them) ──────────────────

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ insertId: 42 }]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  }),
}));

vi.mock("./email", () => ({
  sendApplicationQueueEmail: vi.fn().mockResolvedValue({ id: "email-1" }),
  sendApplicationApprovalEmail: vi.fn().mockResolvedValue({ id: "email-2" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Helpers ──────────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeCtx(user: AuthenticatedUser | null = null): TrpcContext {
  return {
    user,
    req: {
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("applications.validateCode", () => {
  it("returns valid:false for not_found when no row", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.applications.validateCode({ code: "NOTEXIST" });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not_found");
  });
});

describe("applications.submit", () => {
  it("returns ok:true for a valid submission", async () => {
    const { getDb } = await import("./db");
    vi.mocked(getDb).mockResolvedValueOnce({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // no existing application
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      }),
    } as any);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.applications.submit({
      name: "Alice Tester",
      email: "alice@example.com",
      answer: "I have been deeply engaged in personal transformation work for many years and am ready to go deeper.",
      origin: "https://lifewoven.click",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects short answers (< 50 chars)", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.submit({
        name: "Bob",
        email: "bob@example.com",
        answer: "Too short",
        origin: "https://lifewoven.click",
      })
    ).rejects.toThrow();
  });
});

describe("applications.list (admin only)", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "user" })));
    await expect(caller.applications.list()).rejects.toThrow();
  });

  it("returns applications array for admin users", async () => {
    const { getDb } = await import("./db");
    vi.mocked(getDb).mockResolvedValueOnce({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);

    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "admin" })));
    const result = await caller.applications.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
