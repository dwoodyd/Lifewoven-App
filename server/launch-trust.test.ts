import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("launch trust safeguards", () => {
  it("makes a completed sign-out visible and clears the stale authenticated view", () => {
    const signOut = source("client/src/hooks/useSignOut.ts");
    const home = source("client/src/pages/Home.tsx");
    expect(signOut).toContain('window.location.replace("/?signed_out=1")');
    expect(home).toContain('toast.success("Signed out"');
  });

  it("labels assessment bars as load and keeps the Oracle nudge on the highest-load dimension", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    expect(audit).toContain("Higher bars mean more present strain or support needed");
    expect(audit).toContain("const highestScore = Math.max");
    expect(audit).toContain("dimension is carrying the most load right now");
    expect(audit).toContain("% load");
  });

  it("states the fourth optional prompt and presents Lifewoven consent before OAuth handoff", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    expect(audit).toContain("Optional 4 of 4");
    expect(audit).toContain("four optional prompts");
    expect(audit).toContain("Terms of Service");
    expect(audit).toContain("Privacy Policy");
    expect(audit).toContain("Start free — save my results");
  });

  it("gives logged-out visitors a visible survey bypass that begins account setup", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    expect(audit).toContain("!isAuthenticated && (");
    expect(audit).toContain("Take me into the app");
    expect(audit).toContain('window.location.href = getLoginUrl("/dashboard")');
    expect(audit).not.toContain('href="/dashboard">Take me into the app</a>');
  });

  it("mints a server-backed anonymous result claim and explicitly redeems it after OAuth", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    const routers = source("server/routers.ts");
    const schema = source("drizzle/schema.ts");

    expect(schema).toContain('mysqlTable("audit_claims"');
    expect(routers).toContain("mintClaim: publicProcedure");
    expect(routers).toContain("redeemClaim: protectedProcedure");
    expect(audit).toContain("trpc.audit.mintClaim.useMutation()");
    expect(audit).toContain("trpc.audit.redeemClaim.useMutation");
    expect(audit).toContain('new URLSearchParams(window.location.search).get("audit_claim")');
    expect(audit).toContain("redeemAuditClaim.mutate({ claimId: pendingAuditClaimId }");
    expect(audit).toContain("getLoginUrl(`/audit?audit_claim=${encodeURIComponent(claimId)}`)");
    expect(audit).not.toContain("window.localStorage.setItem(storageKey, JSON.stringify(pendingAudit))");
    expect(audit).toContain('navigate("/dashboard")');
  });

  it("uses one full sign-out behavior from Profile and places sign out before account links", () => {
    const profile = source("client/src/pages/Profile.tsx");
    const nav = source("client/src/components/Nav.tsx");
    const signOut = source("client/src/hooks/useSignOut.ts");

    expect(signOut).toContain("await logout()");
    expect(signOut).toContain('window.location.replace("/?signed_out=1")');
    expect(profile).toContain("const { signOut, isSigningOut } = useSignOut()");
    expect(profile).toContain("onClick={signOut}");
    expect(nav).toContain("const { signOut, isSigningOut } = useSignOut()");
    expect(nav.indexOf("onClick={signOut}")).toBeLessThan(nav.indexOf("{/* Account */}"));
    expect(nav).not.toContain("logoutMutation.mutate");
  });

  it("shows results before optional refinement and limits logged-out result actions", () => {
    const audit = source("client/src/pages/AlignmentAudit.tsx");
    expect(audit).toContain('type Step = "entry" | "quiz" | "optional" | "mind_works" | "results"');
    expect(audit).not.toContain('type Step = "entry" | "consent" | "preframe"');
    expect(audit).toContain('setStep("results")');
    expect(audit).toContain("Sharpen this reading — about 60 seconds.");
    expect(audit).toContain("These four optional prompts can tailor your recommendations");
    expect(audit).toContain("isAuthenticated && (() =>");
    expect(audit).toContain("isAuthenticated && shareUrl &&");
    expect(audit).toContain('href="/pathway/reset">Start Reset</a>');
    expect(audit).toContain("Take me into the app");
    expect(audit).toContain('window.location.href = getLoginUrl("/dashboard")');
    expect(audit).toContain('{isAuthenticated && (\n            <div className="p-5 rounded-2xl border border-border bg-card mb-4">');
  });

  it("does not show Oracle-tier members an irrelevant upgrade quick link", () => {
    const profile = source("client/src/pages/Profile.tsx");
    expect(profile).toContain('...(tier !== "oracle" ? [{ href: "/pricing", label: "Upgrade Plan" }] : [])');
  });

  it("gives paid members access to the complete advertised Library guides", () => {
    const library = source("client/src/pages/ResourceLibrary.tsx");
    const articles = source("client/src/data/libraryArticles.ts");
    expect(library).toContain('slug: "load-bearing-beliefs-identification-guide"');
    expect(library).toContain('slug: "honest-step-framework"');
    expect(library).toContain('const hasPaidLibraryAccess = membershipTier === "oracle" || membershipTier === "seeker"');
    expect(library).toContain('resource.slug && canRead');
    expect(articles).toContain('slug: "load-bearing-beliefs-identification-guide"');
    expect(articles).toContain('slug: "honest-step-framework"');
  });

  it("issues secure downloads for Oracle-included tools and keeps their routes and delivery labels canonical", () => {
    const orders = source("server/routers/paypalOrders.ts");
    const store = source("client/src/pages/Store.tsx");
    const downloads = source("client/src/pages/Downloads.tsx");
    const course = source("client/src/pages/CourseDetail.tsx");
    const nav = source("client/src/components/Nav.tsx");

    expect(orders).toContain('getAccessLevel(ctx.user.membershipTier');
    expect(orders).toContain('No completed purchase or included membership access found');
    expect(orders).toContain('accessSource: "membership"');
    expect(orders).toContain('total: "0.00"');
    expect(store).toContain('onClick={() => navigate(`/product/${product.id}`)}');
    expect(store).toContain("Included with Oracle");
    expect(downloads).toContain("Secure download link ready to generate");
    expect(downloads).toContain("Included with Oracle");
    expect(downloads).toContain("Download link could not be generated");
    expect(course).toContain("PDF-first delivery");
    expect(course).toContain("Included with Oracle");
    expect(course).toContain('type="button"');
    expect(course).toContain('navigate(`/product/${courseId}`)');
    expect(course).toContain("Get the course PDF");
    expect(nav).toContain('{ label: "Wisdom Tools", href: "/store" }');
    expect(nav).toContain("My Downloads");
  });

  it("keeps every published product on a canonical product route instead of a coming-soon dead end", () => {
    const productDetail = source("client/src/pages/ProductDetail.tsx");
    const downloads = source("client/src/pages/Downloads.tsx");

    expect(productDetail).toContain("const serverProduct = storeProducts?.find");
    expect(productDetail).toContain("const product = localProduct ?? (serverProduct ?");
    expect(productDetail).toContain("if (productsLoading) return <PageSkeleton />");
    expect(productDetail).toContain("Download link could not be generated");
    expect(downloads).toContain('onClick={() => navigate(`/product/${order.productSlug}`)}');
  });

  it("uses the simplified single-action view for members with no first-run data", () => {
    const dashboard = source("client/src/pages/Dashboard.tsx");
    const simplified = source("client/src/components/LowBandwidthDashboard.tsx");
    expect(dashboard).toContain("const isFirstRun = isAuthenticated && !hasSurveyReading && !hasRecordedCheckIns && !hasHabits && !hasJournal");
    expect(dashboard).toContain("<LowBandwidthDashboard onExit={toggleLowBandwidth} firstRun />");
    expect(simplified).toContain("firstRun?: boolean");
    expect(simplified).toContain("Take the Load-Bearing Survey");
  });

  it("keeps untagged Weave entries reachable and grounds posture colors in the product palette", () => {
    const journal = source("client/src/pages/Journal.tsx");
    const groundCheck = source("client/src/pages/btw/GroundCheck.tsx");
    expect(journal).toContain('const filterModules = ["free", ...modules]');
    expect(journal).toContain('free: "Free writing"');
    expect(groundCheck).toContain('drifting: { label: "Drifting"');
    expect(groundCheck).not.toContain("text-purple-600");
    expect(groundCheck).not.toContain("text-emerald-600");
  });

  it("uses a shared 404 recovery voice and provides an in-app deletion-request path", () => {
    const appNotFound = source("client/src/pages/NotFound.tsx");
    const settings = source("client/src/pages/Settings.tsx");
    const routers = source("server/routers.ts");
    expect(appNotFound).toContain("This path is not part of the weave.");
    expect(settings).toContain("Request data deletion");
    expect(settings).toContain('requestDeletion.mutate({ confirmation: "DELETE MY DATA" })');
    expect(routers).toContain("requestDeletion: protectedProcedure");
    expect(routers).toContain("Data deletion request:");
  });

  it("bounds the startup splash so a stalled first frame cannot trap a visitor", () => {
    const indexHtml = source("client/index.html");
    expect(indexHtml).toContain("window.setTimeout(function() {");
    expect(indexHtml).toContain("if (s) s.remove();");
    expect(indexHtml).toContain("}, 1600);");
  });

  it("keeps app pricing claims tied to the displayed monthly comparison", () => {
    const pricing = source("client/src/pages/Pricing.tsx");
    expect(pricing).toContain("save 18% vs monthly");
    expect(pricing).toContain("save 17% vs monthly");
    expect(pricing).toContain("save 17–18% vs monthly");
    expect(pricing).not.toContain("save 53%");
    expect(pricing).not.toContain("save up to 48%");
    expect(pricing).not.toContain('"Community access"');
  });

  it("keeps app policies aligned on adult access, refund reference, AI processing, and analytics disclosure", () => {
    const terms = source("client/src/pages/legal/Terms.tsx");
    const refunds = source("client/src/pages/legal/Refunds.tsx");
    const privacy = source("client/src/pages/legal/Privacy.tsx");
    expect(terms).toContain("at least 18 years");
    expect(terms).toContain('href="/legal/refunds"');
    expect(terms).toContain("do not use personal content to train general AI models");
    expect(terms).not.toContain("change pricing with 30 days notice");
    expect(refunds).toContain("7-day full refund");
    expect(privacy).toContain("Manus Analytics");
    expect(privacy).toContain("attention, overwhelm, time perception");
    expect(privacy).toContain("aged 18 and over");
  });
});
