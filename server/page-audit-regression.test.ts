import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const root = resolve(process.cwd());
const source = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() && path.endsWith(".tsx") ? [path] : [];
  });
}

function authenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "page-audit-user",
      email: "audit@example.com",
      name: "Page Audit User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("page-by-page audit regression contract", () => {
  it("returns saved energy audits only to the signed-in owner and keeps requests bounded", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    expect(Array.isArray(await caller.energy.recent({ limit: 7 }))).toBe(true);
    await expect(caller.energy.recent({ limit: 31 })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    const anonymousCaller = appRouter.createCaller(publicContext());
    await expect(anonymousCaller.energy.recent({ limit: 7 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps energy audit write-to-read history visible and refreshed", () => {
    const stewardship = source("client/src/pages/modules/StewardshipModule.tsx");
    expect(stewardship).toContain('trpc.energy.recent.useQuery({ limit: 7 }');
    expect(stewardship).toContain("utils.energy.recent.invalidate({ limit: 7 })");
    expect(stewardship).toContain("Recent energy audits");
    expect(stewardship).toContain("Your saved audits will appear here.");
    expect(stewardship).toContain("audit.sleepHours");
    expect(stewardship).toContain("audit.movementMinutes");
    expect(stewardship).toContain("audit.notes");
    expect(stewardship).toContain("Energy ${score}/10");
  });

  it("makes saved beliefs and decisions visibly durable after save and reload", () => {
    const story = source("client/src/pages/modules/StoryModule.tsx");
    const strategy = source("client/src/pages/modules/StrategyModule.tsx");
    const routers = source("server/routers.ts");

    expect(story).toContain("trpc.beliefs.list.useQuery");
    expect(story).toContain("utils.beliefs.list.invalidate()");
    expect(story).toContain("Saved beliefs");
    expect(story).toContain("beliefs.map");
    expect(story).toContain("belief.affirmation");
    expect(strategy).toContain("trpc.decisions.list.useQuery");
    expect(strategy).toContain("utils.decisions.list.invalidate()");
    expect(strategy).toContain("Saved decisions");
    expect(strategy).toContain("decisions.map");
    expect(strategy).toContain("decision.reasoning");
    expect(strategy).toContain("decision.secondOrderEffects");
    expect(routers).toContain('affirmation: declaration');
    expect(routers).toContain('feature: "story_belief_rewrite"');
    expect(routers).toContain('feature: "strategy_decision_analysis"');
    expect(routers).toContain('reasoning: typeof content.analysis === "string" ? content.analysis : null');
  });

  it("gives every rendered image a non-empty text alternative", () => {
    const imageTags = sourceFiles(resolve(root, "client/src"))
      .flatMap((file) => [...readFileSync(file, "utf8").matchAll(/<img\b[\s\S]*?>/g)])
      .map((match) => match[0]);
    const allClientSource = sourceFiles(resolve(root, "client/src"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(imageTags.length).toBeGreaterThan(0);
    for (const tag of imageTags) {
      expect(tag).toMatch(/\balt=(?:"[^"\s][^"]*"|\{[^}]+\})/);
    }
    expect(allClientSource).not.toContain('alt=""');
    expect(source("client/index.html")).not.toContain('alt=""');
    expect(source("client/src/components/LuminScene.tsx")).toContain("const mediaLabel");
    expect(source("client/src/components/LuminScene.tsx")).toContain("aria-label={mediaLabel}");
  });

  it("gives the remaining audited controls programmatic names", () => {
    const settings = source("client/src/pages/Settings.tsx");
    const character = source("client/src/pages/Character.tsx");
    const referrals = source("client/src/pages/Referrals.tsx");

    expect(settings).toContain('aria-label={lowBandwidth ? "Disable simplified view" : "Enable simplified view"}');
    expect(settings).toContain('aria-label={showProfile ? "Hide profile in navigation" : "Show profile in navigation"}');
    expect(character).toContain('aria-label="Book category"');
    expect(character).toContain('aria-label="Reading status"');
    expect(character).toContain('aria-label="Remove selected cover"');
    expect(character).toContain('aria-label={`More actions for ${book.title}`}');
    expect(character).toContain('aria-label="Upload a book cover image"');
    expect(character).toContain('aria-label={`Replace the cover for ${book.title}`}');
    expect(referrals).toContain('aria-label="Copy referral link"');
    expect(referrals).toContain('aria-label="Copy trial referral link"');
    expect(referrals).toContain('aria-label="Referral code to apply"');
    expect(referrals).toContain('aria-label="Trial code to redeem"');
  });
});
