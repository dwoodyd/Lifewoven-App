import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (relative: string) => readFileSync(resolve(root, relative), "utf8");

describe("frictionless beta access and conversion timing", () => {
  it("grants one 30-day free beta with a database uniqueness guard and does not renew it after expiry", () => {
    const schema = source("drizzle/schema.ts");
    const beta = source("server/routers/beta.ts");
    expect(schema).toContain('uniqueIndex("uq_beta_access_userId").on(t.userId)');
    expect(beta).toContain("const DEFAULT_FREE_BETA_DAYS = 30");
    expect(beta).toContain('source: "free_beta"');
    expect(beta).toContain('reason: "expired" as const');
    expect(beta).toContain("if (access?.expired) return");
    expect(beta).toContain("const concurrent = await getBetaAccess(userId)");
    expect(beta).toContain("direct deep link cannot race the client bootstrap");
  });

  it("preserves intentional beta-code and referral acquisition paths", () => {
    expect(source("server/routers/beta.ts")).toContain('source: "beta_code"');
    expect(source("server/routers/referral.ts")).toContain('source: "referral"');
  });

  it("keeps install prompting out of the first session and allows it only after a survey, second session, or Settings request", () => {
    const prompt = source("client/src/components/PWAInstallPrompt.tsx");
    expect(prompt).toContain("PWA_SURVEY_COMPLETE_EVENT");
    expect(prompt).toContain("SESSION_COUNT_KEY");
    expect(prompt).toContain("sessionCount >= 2");
    expect(prompt).not.toContain("setTimeout(openInstallPrompt, 20000)");
  });

  it("shows a Seeker invitation only after recorded reflective and content activation, never during beta", () => {
    const invite = source("client/src/components/PostActivationInvite.tsx");
    expect(invite).toContain("activation?.isActivated");
    expect(invite).toContain("access?.isBetaMember");
    const systemRouter = source("server/_core/systemRouter.ts");
    expect(systemRouter).toContain("activationStatus");
    expect(systemRouter).toContain('"reflective_tool_completed"');
    expect(systemRouter).toContain('"content_consumed"');
  });

  it("places the one dismissible invitation after all three reflective surfaces and refreshes it after an Audit or Weave save", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    const weave = source("client/src/pages/Journal.tsx");
    const groundCheck = source("client/src/pages/btw/GroundCheck.tsx");

    expect(audit).toContain('import PostActivationInvite from "@/components/PostActivationInvite"');
    expect(audit).toContain("utils.system.activationStatus.invalidate()");
    expect(audit).toContain("{isAuthenticated && <PostActivationInvite />}");
    expect(weave).toContain('import PostActivationInvite from "@/components/PostActivationInvite"');
    expect(weave).toContain("utils.system.activationStatus.invalidate()");
    expect(weave).toContain("{isAuthenticated && <PostActivationInvite />}");
    expect(groundCheck).toContain("<PostActivationInvite />");
  });

  it("records the authenticated completion of an anonymous survey claim without changing its idempotency guard", () => {
    const auditRouter = source("server/routers.ts");
    expect(auditRouter).toContain('properties: JSON.stringify({ tool: "soul_engineer_assessment", source: "audit_claim" })');
    expect(auditRouter).toContain("if (claim.redeemedAt)");
    expect(auditRouter).toContain("alreadyRedeemed: true");
  });

  it("opens the cinematic intro only from the eligible first-run root or dashboard entry", () => {
    const firstRunHome = source("client/src/components/NewMemberHome.tsx");
    const dashboard = source("client/src/pages/Dashboard.tsx");
    const onboarding = source("client/src/components/OnboardingModal.tsx");

    expect(firstRunHome).toContain('window.dispatchEvent(new Event("lifewoven:first-run-onboarding"))');
    expect(dashboard).toContain('if (dashData && isFirstRun) window.dispatchEvent(new Event("lifewoven:first-run-onboarding"))');
    expect(onboarding).toContain('window.addEventListener("lifewoven:first-run-onboarding", openFirstRun)');
    expect(onboarding).toContain("if (localStorage.getItem(DEVICE_KEY)) return");
  });
});
