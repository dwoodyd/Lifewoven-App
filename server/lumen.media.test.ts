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

  it("uses the native video poster without an overlapping image sibling", () => {
    const sceneSource = readFileSync(resolve(process.cwd(), "client/src/components/LuminScene.tsx"), "utf8");
    expect(sceneSource).toContain("poster={poster}");
    expect(sceneSource).not.toContain("<img");
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
});
