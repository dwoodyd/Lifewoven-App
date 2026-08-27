import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLoginUrl } from "../client/src/const";
import { resolveReturnPath } from "../client/src/pages/Login";

const root = resolve(import.meta.dirname, "..");
const readClient = (path: string) => readFileSync(resolve(root, "client", "src", path), "utf8");

describe("new-user entry funnel", () => {
  it("uses an explicit signUp intent and preserves the selected paid tier", () => {
    const login = readClient("pages/Login.tsx");
    const home = readClient("pages/Home.tsx");
    const pricing = readClient("pages/Pricing.tsx");

    expect(login).toContain('getLoginUrl(returnPath, "signUp")');
    expect(login).toContain("new URLSearchParams(search)");
    expect(login).not.toContain('location.split("?")[1]');
    expect(login).toContain('return `/pricing?tier=${tier}`');
    expect(home).toContain('getLoginUrl("/pricing?tier=seeker", "signUp")');
    expect(home).toContain('getLoginUrl("/pricing?tier=oracle", "signUp")');
    expect(pricing).toContain("getLoginUrl('/dashboard', 'signUp')");
  });

  it("reads signup returnTo from the browser search string and preserves only approved pricing tiers", () => {
    expect(resolveReturnPath("?returnTo=/pricing")).toBe("/pricing");
    expect(resolveReturnPath("?returnTo=/pricing&tier=seeker")).toBe("/pricing?tier=seeker");
    expect(resolveReturnPath("?returnTo=/pricing&tier=unapproved")).toBe("/pricing");
    expect(resolveReturnPath("?returnTo=https://untrusted.example")).toBe("/dashboard");
  });

  it("encodes the resolved pricing path in the OAuth state payload", () => {
    vi.stubEnv("VITE_OAUTH_PORTAL_URL", "https://oauth.example");
    vi.stubEnv("VITE_APP_ID", "lifewoven-test-app");
    vi.stubGlobal("window", { location: { origin: "https://app.lifewoven.click" } });

    const oauthUrl = new URL(getLoginUrl(resolveReturnPath("?returnTo=/pricing"), "signUp"));
    const state = Buffer.from(oauthUrl.searchParams.get("state") ?? "", "base64").toString("utf8");

    expect(oauthUrl.searchParams.get("type")).toBe("signUp");
    expect(state.split("||")[1]).toBe("/pricing");
    expect(state.split("||")[2]).toBe("https://app.lifewoven.click");

    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("shows Lifewoven legal consent before the signup OAuth handoff", () => {
    const login = readClient("pages/Login.tsx");

    expect(login).toContain("Welcome to Lifewoven");
    expect(login).toContain('href="/legal/terms"');
    expect(login).toContain('href="/legal/privacy"');
    expect(login).toContain("Continue to account creation");
    expect(login).toContain("provided through Manus services");
  });

  it("does not auto-open installation on first visit and unlocks only after an intentional event", () => {
    const prompt = readClient("components/PWAInstallPrompt.tsx");

    expect(prompt).toContain('PWA_SURVEY_COMPLETE_EVENT = "lifewoven:survey-completed"');
    expect(prompt).toContain("window.addEventListener(PWA_INSTALL_REQUEST_EVENT, openInstallPrompt)");
    expect(prompt).not.toContain("setTimeout(() => setShow(true)");
  });

  it("uses the same real evidence summary in Guide, Pattern Mirror, and Weekly Summary", () => {
    const oracle = readClient("pages/Oracle.tsx");

    expect(oracle).toContain("function evidenceSummary");
    expect(oracle.match(/evidenceSummary\(oracleReadiness\.data\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(oracle).toContain("Evidence check.");
    expect(oracle).toContain("it will not claim a personal pattern from limited history");
  });

  it("gives Guide the same seven-day evidence boundary before it may name a pattern", () => {
    const router = readFileSync(resolve(root, "server", "routers.ts"), "utf8");

    expect(router).toContain("const recentEvidenceStart = new Date()");
    expect(router).toContain("buildOracleReadiness({");
    expect(router).toContain("RECENT EVIDENCE SAFEGUARD");
    expect(router).toContain("MUST NOT infer recurring personal patterns, trends, or a weekly narrative");
  });
});
