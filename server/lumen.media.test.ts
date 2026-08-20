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
});
