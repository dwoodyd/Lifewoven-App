import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("launch trust safeguards", () => {
  it("makes a completed sign-out visible and clears the stale authenticated view", () => {
    const nav = source("client/src/components/Nav.tsx");
    const home = source("client/src/pages/Home.tsx");
    expect(nav).toContain('window.location.replace("/?signed_out=1")');
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
