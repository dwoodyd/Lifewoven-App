/**
 * Lumin video catalogue — all S3 URLs and scene metadata.
 * Black backgrounds are stripped at render time via CSS mix-blend-mode: screen.
 */

const BASE = "https://static.manus.space";

export interface LuminVideo {
  id: string;
  url: string;
  /** Human-readable description of what Lumin does in this clip */
  action: string;
  /** Suggested use-case in the UI */
  role: "onboarding" | "ambient" | "reaction" | "landscape";
  /** Duration in seconds (all are 8s) */
  duration: number;
}

export const LUMIN_VIDEOS: LuminVideo[] = [
  // ── Named / clean originals ──────────────────────────────────────────────
  {
    id: "bouncy_dance",
    url: `${BASE}/manus-storage/Lumen_performs_bouncy_dance_202605051720_70de9e8b.mp4`,
    action: "Bouncy celebratory dance",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pointing_energy",
    url: `${BASE}/manus-storage/Lumen_pointing_with_energy_202605051726_affc651c.mp4`,
    action: "Points forward with energy",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "sliding_in_1",
    url: `${BASE}/manus-storage/Lumen_sliding_into_view_202605051841_e83d8f1a.mp4`,
    action: "Slides into view from the side",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "sliding_in_2",
    url: `${BASE}/manus-storage/Lumen_sliding_into_view_202605051843_c8d944af.mp4`,
    action: "Slides into view (variant 2)",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "spins_dizzy",
    url: `${BASE}/manus-storage/Lumen_spins_and_stops_dizzy_202605051638_e1e69794.mp4`,
    action: "Spins and stops dizzy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "taps_camera",
    url: `${BASE}/manus-storage/Lumen_taps_camera_lens_202605051708_9da1f2cd.mp4`,
    action: "Taps the camera lens",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "bouncing_joyfully",
    url: `${BASE}/manus-storage/Mascot_Lumen_bouncing_joyfully_202605051832_434e09ab.mp4`,
    action: "Bounces joyfully",
    role: "reaction",
    duration: 8,
  },
  {
    id: "bobs_taps",
    url: `${BASE}/manus-storage/Mascot_bobs_up_down_taps_202605051744_e5c14edc.mp4`,
    action: "Bobs up and down, taps",
    role: "ambient",
    duration: 8,
  },
  {
    id: "core_unfurls",
    url: `${BASE}/manus-storage/Mascot_core_lights_up_unfurls_202605051825_bafddaa5.mp4`,
    action: "Core lights up and unfurls",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "self_soothing",
    url: `${BASE}/manus-storage/Mascot_self-soothing_hug_202605051747_017a53d7.mp4`,
    action: "Self-soothing hug",
    role: "ambient",
    duration: 8,
  },
  // ── Cropped (watermark removed) ──────────────────────────────────────────
  {
    id: "scene_1",
    url: `${BASE}/manus-storage/Untitled_video_1_f3afe6c7.mp4`,
    action: "Lumin emerges in cosmic space",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_2",
    url: `${BASE}/manus-storage/Untitled_video_2_ec5ff5db.mp4`,
    action: "Lumin floats in warm light",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_3",
    url: `${BASE}/manus-storage/Untitled_video_3_aff94ecf.mp4`,
    action: "Lumin in cosmic energy burst",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_4",
    url: `${BASE}/manus-storage/Untitled_video_4_4a23ed3f.mp4`,
    action: "Lumin drifts in deep space",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_5",
    url: `${BASE}/manus-storage/Untitled_video_5_55635c88.mp4`,
    action: "Lumin glows softly",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_6",
    url: `${BASE}/manus-storage/Untitled_video_6_bbe424fb.mp4`,
    action: "Lumin in dark atmospheric scene",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_7",
    url: `${BASE}/manus-storage/Untitled_video_7_95e3f10b.mp4`,
    action: "Lumin underwater/deep scene",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_8",
    url: `${BASE}/manus-storage/Untitled_video_8_ea32710f.mp4`,
    action: "Lumin with energy streaks",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_9",
    url: `${BASE}/manus-storage/Untitled_video_9_65b13ca3.mp4`,
    action: "Lumin in soft glow",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_10",
    url: `${BASE}/manus-storage/Untitled_video_10_172e9ba3.mp4`,
    action: "Lumin radiant burst",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_11",
    url: `${BASE}/manus-storage/Untitled_video_11_99df1537.mp4`,
    action: "Lumin warm atmospheric",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_14",
    url: `${BASE}/manus-storage/Untitled_video_14_b836c334.mp4`,
    action: "Lumin cinematic reveal",
    role: "onboarding",
    duration: 8,
  },
  // ── Landscape backgrounds ────────────────────────────────────────────────
  {
    id: "landscape_cinematic",
    url: `${BASE}/manus-storage/p_landscape_Cinemat_f823260d.mp4`,
    action: "Cinematic landscape background",
    role: "landscape",
    duration: 8,
  },
  {
    id: "landscape_fun",
    url: `${BASE}/manus-storage/p_landscape_Fun_pl_1d56152a.mp4`,
    action: "Fun landscape background",
    role: "landscape",
    duration: 8,
  },
];

/** Videos to use for the immersive onboarding sequence (in order) */
export const ONBOARDING_SEQUENCE: string[] = [
  "core_unfurls",    // Slide 1 — Lumin is born / intro
  "sliding_in_1",   // Slide 2 — She arrives
  "pointing_energy", // Slide 3 — She points the way
  "taps_camera",    // Slide 4 — She connects with you
  "bouncing_joyfully", // Slide 5 — Celebration / begin
];

/** Ambient video to loop on the Oracle page */
export const ORACLE_AMBIENT = "bobs_taps";

/** Ambient video for the Dashboard welcome moment */
export const DASHBOARD_AMBIENT = "self_soothing";
