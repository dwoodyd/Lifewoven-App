import { describe, expect, it } from "vitest";
import { getLumenPoster, LUMEN_POSTERS } from "../shared/lumenMedia";

describe("Lumen media fallbacks", () => {
  it("provides an immediate poster for each supported Lumen role", () => {
    expect(getLumenPoster("smiles_sweeping")).toBe(LUMEN_POSTERS.welcome);
    expect(getLumenPoster("nodding_gently")).toBe(LUMEN_POSTERS.listening);
    expect(getLumenPoster("taps_chin")).toBe(LUMEN_POSTERS.focus);
    expect(getLumenPoster("bouncing_joyfully")).toBe(LUMEN_POSTERS.celebrate);
    expect(getLumenPoster("unknown-video-id")).toBe(LUMEN_POSTERS.calm);
  });
});
