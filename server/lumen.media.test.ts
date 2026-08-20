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
});
