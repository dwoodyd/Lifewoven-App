import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("native-quality mobile foundations", () => {
  it("centralizes the mobile rhythm, safe-area, motion, and touch-target primitives", () => {
    const css = source("client/src/index.css");

    expect(css).toContain("--space-4: 1rem");
    expect(css).toContain("--tap-target: 2.75rem");
    expect(css).toContain("--duration-standard: 240ms");
    expect(css).toContain("--motion-settle: 280ms");
    expect(css).toContain("--motion-weave: 320ms");
    expect(css).toContain(".settle-in");
    expect(css).toContain(".weave-in > *");
    expect(css).toContain(".screen-safe");
    expect(css).toContain(".native-tabbar");
    expect(css).toContain("touch-action: manipulation");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("overflow-x: clip");
  });

  it("makes shared buttons and cards meet the mobile target and surface conventions", () => {
    const button = source("client/src/components/ui/button.tsx");
    const card = source("client/src/components/ui/card.tsx");
    const page = source("client/src/components/ui/page.tsx");

    expect(button).toContain("min-h-11");
    expect(button).toContain('icon: "size-11"');
    expect(button).toContain("touch-manipulation");
    expect(card).toContain("rounded-[var(--radius-surface)]");
    expect(card).toContain("shadow-[var(--elevation-1)]");
    expect(page).toContain("screen-safe");
    expect(page).toContain('data-slot="page"');
  });

  it("keeps navigation and cinematic onboarding clear of installed-device safe areas", () => {
    const nav = source("client/src/components/Nav.tsx");
    const onboarding = source("client/src/components/OnboardingModal.tsx");

    expect(nav).toContain("pt-safe");
    expect(nav).toContain("mobile-nav-panel");
    expect(onboarding).toContain("env(safe-area-inset-bottom, 0px)");
    expect(onboarding).toContain('aria-label="Skip intro"');
    expect(onboarding).toContain('preload="metadata"');
  });

  it("keeps the standalone PWA manifest, prompt-based updates, and entry shell offline-capable", () => {
    const vite = source("vite.config.ts");

    expect(vite).toContain('registerType: "prompt"');
    expect(vite).toContain("display: \"standalone\"");
    expect(vite).toContain("orientation: \"portrait-primary\"");
    expect(vite).toContain('purpose: "any maskable"');
    expect(vite).toContain('"assets/index-*.js"');
    expect(vite).toContain("navigateFallback: \"/index.html\"");
  });

  it("uses the shared settling and weaving motion language on core practice surfaces", () => {
    const ground = source("client/src/pages/btw/BTWLanding.tsx");
    const survey = source("client/src/pages/AlignmentAudit.tsx");

    expect(ground).toContain('className="settle-in relative');
    expect(ground).toContain('className="weave-in grid');
    expect(survey).toContain('key={q.id} className="settle-in');
  });
});
