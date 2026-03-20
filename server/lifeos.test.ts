import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-lifeos",
    email: "seeker@lifeos.com",
    name: "Test Seeker",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Seeker");
    expect(result?.email).toBe("seeker@lifeos.com");
  });

  it("logout clears session cookie and returns success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const { ctx } = createAuthContext();
    ctx.res.clearCookie = (name: string, options: Record<string, unknown>) => {
      clearedCookies.push({ name, options });
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Community Router Tests ───────────────────────────────────────────────────

describe("community.posts", () => {
  it("returns an array (public access, no DB in test env)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.community.posts({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Oracle Router Tests ──────────────────────────────────────────────────────

describe("oracle.insights", () => {
  it("returns an array for authenticated user (no DB in test env)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.oracle.insights();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Profile Router Tests ─────────────────────────────────────────────────────

describe("profile.me", () => {
  it("returns user data for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Seeker");
  });
});

// ─── Habits Router Tests ──────────────────────────────────────────────────────

describe("habits.list", () => {
  it("returns an array for authenticated user (no DB in test env)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.habits.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Journal Router Tests ─────────────────────────────────────────────────────

describe("journal.list", () => {
  it("returns an array for authenticated user (no DB in test env)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.journal.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Beliefs Router Tests ─────────────────────────────────────────────────────

describe("beliefs.list", () => {
  it("returns an array for authenticated user (no DB in test env)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.beliefs.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Decisions Router Tests ───────────────────────────────────────────────────

describe("decisions.list", () => {
  it("returns an array for authenticated user (no DB in test env)", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.decisions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Resources Router Tests ───────────────────────────────────────────────────

describe("resources.list", () => {
  it("returns an array (public access, no DB in test env)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.resources.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Courses Router Tests ─────────────────────────────────────────────────────

describe("courses.list", () => {
  it("returns an array (public access, no DB in test env)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.courses.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Products Router Tests ────────────────────────────────────────────────────

describe("products.list", () => {
  it("returns an array (public access, no DB in test env)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
