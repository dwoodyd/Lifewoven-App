import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getLumenPoster, LUMEN_POSTERS } from "../shared/lumenMedia";

describe("Lumen media fallbacks", () => {
  it("uses only frames extracted from the matching canonical Lumen video", () => {
    expect(getLumenPoster("nodding_gently")).toBe(LUMEN_POSTERS.nodding_gently);
    expect(getLumenPoster("taps_chin")).toBe(LUMEN_POSTERS.taps_chin);
    expect(getLumenPoster("core_unfurls")).toBe(LUMEN_POSTERS.core_unfurls);
    expect(getLumenPoster("bouncing_joyfully")).toBe(LUMEN_POSTERS.bouncing_joyfully);
    expect(getLumenPoster("screen1_hero")).toBe(LUMEN_POSTERS.screen1_hero);
    expect(getLumenPoster("transformation")).toBe(LUMEN_POSTERS.transformation);
    expect(getLumenPoster("unknown-video-id")).toBeUndefined();
  });

  it("never reintroduces generated Lumen artwork as a poster fallback", () => {
    for (const posterUrl of Object.values(LUMEN_POSTERS)) {
      expect(posterUrl).toMatch(/^\/manus-storage\//);
      expect(posterUrl).toMatch(/\.jpg$/);
      expect(posterUrl).not.toContain("lumen-poster-");
    }
  });

  it("uses matching canonical posters while loading and collapses failed decorative media", () => {
    const sceneSource = readFileSync(resolve(process.cwd(), "client/src/components/LuminScene.tsx"), "utf8");
    expect(sceneSource).toContain("poster={poster}");
    expect(sceneSource).toContain("src={poster}");
    expect(sceneSource).toContain("showMediaSkeleton");
    expect(sceneSource).toContain("if (ambient && videoFailed && !posterReady) return null;");
  });

  it("uses browser-safe MP4 sources for every registered mascot scene", () => {
    const registrySource = readFileSync(resolve(process.cwd(), "client/src/data/lumin.ts"), "utf8");
    const urls = [...registrySource.matchAll(/url:\s*"([^"]+)"/g)].map((match) => match[1]);

    expect(urls.length).toBeGreaterThan(20);
    expect(urls.every((url) => url.startsWith("/manus-storage/") && url.endsWith(".mp4"))).toBe(true);

    for (const brokenKey of [
      "-landscape_",
      "-clean-landscape_",
      "self_soothing_8fc40df4.mp4",
      "nodding_gently_e60b644d.mp4",
      "taps_chin_b455c537.mp4",
      "tilting_listening_f4d923b8.mp4",
      "onboarding_scene3_v2_2e4f9665.mov",
    ]) {
      expect(registrySource).not.toContain(brokenKey);
    }
  });

  it("keeps affected pathway cards on their assigned clean video sources", () => {
    const pathways = readFileSync(resolve(process.cwd(), "client/src/pages/PathwaysListing.tsx"), "utf8");
    const registry = readFileSync(resolve(process.cwd(), "client/src/data/lumin.ts"), "utf8");
    const pathwayRecord = (slug: string) => pathways.match(new RegExp(`\\{\\n\\s+slug: "${slug}"[\\s\\S]*?\\n  \\},`))?.[0] ?? "";
    const align = pathwayRecord("align");
    const flow = pathwayRecord("flow");
    const purpose = pathwayRecord("purpose");

    expect(align).toContain('scene: "pathway_align_clean"');
    expect(pathwayRecord("reset")).toContain('scene: "pathway_reset_clean"');
    expect(pathwayRecord("uplift")).toContain('scene: "pathway_uplift_clean"');
    expect(flow).toContain('scene: "pathway_flow_clean"');
    expect(purpose).toContain('scene: "pathway_purpose_clean"');
    expect(registry).toContain('id: "pathway_align_clean"');
    expect(registry).toContain('url: "/manus-storage/align-grounding-clean_51f6d462.mp4"');
    expect(registry).toContain('id: "pathway_reset_clean"');
    expect(registry).toContain('url: "/manus-storage/reset-resilience-clean_dbe54966.mp4"');
    expect(registry).toContain('id: "pathway_flow_clean"');
    expect(registry).toContain('url: "/manus-storage/flow-visualization-clean_9944f8ae.mp4"');
    expect(align).not.toMatch(/scene: "(?:pathway_uplift_clean|settling)"/);
    expect(flow).not.toContain('scene: "pointing_energy"');
    expect(purpose).not.toContain('scene: "self_hug"');
  });
});
