/**
 * Lumin video catalogue — all S3 paths served as relative /manus-storage/ URLs.
 * Black backgrounds are stripped at render time via CSS mix-blend-mode: screen.
 */

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
    url: "/manus-storage/Lumen_performs_bouncy_dance_202605051720_dbc48df8.mp4",
    action: "Bouncy celebratory dance",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pointing_energy",
    url: "/manus-storage/Lumen_pointing_with_energy_202605051726_99b22815.mp4",
    action: "Points forward with energy",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "sliding_in_1",
    url: "/manus-storage/Lumen_sliding_into_view_202605051841_2c0e24db.mp4",
    action: "Slides into view from the side",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "sliding_in_2",
    url: "/manus-storage/Lumen_sliding_into_view_202605051843_f159069c.mp4",
    action: "Slides into view (variant 2)",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "spins_dizzy",
    url: "/manus-storage/Lumen_spins_and_stops_dizzy_202605051638_f1b454e5.mp4",
    action: "Spins and stops dizzy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "taps_camera",
    url: "/manus-storage/Lumen_taps_camera_lens_202605051708_a725a928.mp4",
    action: "Taps the camera lens",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "bouncing_joyfully",
    url: "/manus-storage/Mascot_Lumen_bouncing_joyfully_202605051832_86b6101e.mp4",
    action: "Bounces joyfully",
    role: "reaction",
    duration: 8,
  },
  {
    id: "bobs_taps",
    url: "/manus-storage/Mascot_bobs_up_down_taps_202605051744_fab360ba.mp4",
    action: "Bobs up and down, taps",
    role: "ambient",
    duration: 8,
  },
  {
    id: "core_unfurls",
    url: "/manus-storage/Mascot_core_lights_up_unfurls_202605051825_63db4081.mp4",
    action: "Core lights up and unfurls",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "self_soothing",
    url: "/manus-storage/Mascot_self-soothing_hug_202605051747_a5efca78.mp4",
    action: "Self-soothing hug",
    role: "ambient",
    duration: 8,
  },
  // ── Cropped (watermark removed) ──────────────────────────────────────────
  {
    id: "scene_1",
    url: "/manus-storage/Untitled_video_1_cb165677.mp4",
    action: "Lumin emerges in cosmic space",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_2",
    url: "/manus-storage/Untitled_video_2_de8986b2.mp4",
    action: "Lumin floats in warm light",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_3",
    url: "/manus-storage/Untitled_video_3_b30af40f.mp4",
    action: "Lumin in cosmic energy burst",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_4",
    url: "/manus-storage/Untitled_video_4_45e76ae5.mp4",
    action: "Lumin drifts in deep space",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_5",
    url: "/manus-storage/Untitled_video_5_5695431b.mp4",
    action: "Lumin glows softly",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_6",
    url: "/manus-storage/Untitled_video_6_279360f8.mp4",
    action: "Lumin in dark atmospheric scene",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_7",
    url: "/manus-storage/Untitled_video_7_0bc00db2.mp4",
    action: "Lumin underwater/deep scene",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_8",
    url: "/manus-storage/Untitled_video_8_db93ddff.mp4",
    action: "Lumin with energy streaks",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_9",
    url: "/manus-storage/Untitled_video_9_23b03c25.mp4",
    action: "Lumin in soft glow",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_10",
    url: "/manus-storage/Untitled_video_10_729527b4.mp4",
    action: "Lumin radiant burst",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "scene_11",
    url: "/manus-storage/Untitled_video_11_9cfb3b71.mp4",
    action: "Lumin warm atmospheric",
    role: "ambient",
    duration: 8,
  },
  {
    id: "scene_14",
    url: "/manus-storage/Untitled_video_14_1b1346ae.mp4",
    action: "Lumin cinematic reveal",
    role: "onboarding",
    duration: 8,
  },
  // ── Landscape backgrounds ────────────────────────────────────────────────
  {
    id: "landscape_cinematic",
    url: "/manus-storage/p_landscape_Cinemat_2a8ca9da.mp4",
    action: "Cinematic landscape background",
    role: "landscape",
    duration: 8,
  },
  {
    id: "landscape_fun",
    url: "/manus-storage/p_landscape_Fun_pl_3fb54b73.mp4",
    action: "Fun landscape background",
    role: "landscape",
    duration: 8,
  },
];

/** Ambient video to loop on the Oracle page */
export const ORACLE_AMBIENT = "bobs_taps";

/** Ambient video for the Dashboard welcome moment */
export const DASHBOARD_AMBIENT = "self_soothing";
