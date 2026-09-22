/**
 * Active Lumen video catalogue — knitted sun character.
 * Every registered source has passed the 2026-09-22 visual watermark review.
 * Black backgrounds are stripped at render time via CSS mix-blend-mode: screen.
 */

export interface LuminVideo {
  id: string;
  url: string;
  /** Human-readable description of what Lumen does in this clip */
  action: string;
  /** Suggested use-case in the UI */
  role: "onboarding" | "ambient" | "reaction" | "landscape";
  /** Duration in seconds */
  duration: number;
}

export const LUMIN_VIDEOS: LuminVideo[] = [
  // ── Clean Pathways-specific variants ──────────────────────────────────────
  {
    id: "pathway_reset_clean",
    url: "/manus-storage/reset-resilience-clean_dbe54966.mp4",
    action: "Calm reassuring wink for the Reset resilience scene",
    role: "landscape",
    duration: 8,
  },
  {
    id: "pathway_align_clean",
    url: "/manus-storage/align-grounding-clean_51f6d462.mp4",
    action: "Calm self-embrace for the Align daily-grounding scene",
    role: "landscape",
    duration: 8,
  },
  {
    id: "pathway_resonance_clean",
    url: "/manus-storage/lifewoven-core-unfurls-original_ffd8a81a.mp4",
    action: "Full-figure core unfurling for the Resonance pathway scene",
    role: "landscape",
    duration: 8,
  },
  {
    id: "pathway_uplift_clean",
    url: "/manus-storage/lumen-clean-65_a5bdeed4.mp4",
    action: "Full-figure celebratory burst with golden sparkles for Uplift",
    role: "landscape",
    duration: 8,
  },
  {
    id: "pathway_flow_clean",
    url: "/manus-storage/flow-visualization-clean_9944f8ae.mp4",
    action: "Radiant starburst and joyful expansion for Flow",
    role: "landscape",
    duration: 8,
  },
  {
    id: "pathway_purpose_clean",
    url: "/manus-storage/lumen-clean-67_c525a513.mp4",
    action: "Centered self-embrace for the Purpose pathway scene",
    role: "landscape",
    duration: 8,
  },

  // ── Active onboarding sequence ────────────────────────────────────────────
  {
    id: "screen1_hero",
    url: "/manus-storage/scene1_hero_v2_cropped_3f793bf0.mp4",
    action: "Opening hero for onboarding screen one",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "onboarding_framework_clean",
    url: "/manus-storage/lifewoven-onboarding-framework-clean-h264_15653685.mp4",
    action: "Peaceful attentive Lumen presence for the 5S Framework scene",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "onboarding_contemplative_clean",
    url: "/manus-storage/lifewoven-onboarding-contemplative-clean-h264_8562197f.mp4",
    action: "Gentle self-embrace for the contemplative practice scene",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "onboarding_launch_clean",
    url: "/manus-storage/lifewoven-onboarding-launch-clean_b487be0e.mp4",
    action: "Joyful starburst welcome for the launch scene",
    role: "onboarding",
    duration: 8,
  },

  // ── Clean reaction, ambient, and interface scenes ─────────────────────────
  {
    id: "bouncy_dance",
    url: "/manus-storage/Lumen_performs_bouncy_dance_202605082004_672236c5.mp4",
    action: "Bouncy celebratory dance with sparkles",
    role: "reaction",
    duration: 8,
  },
  {
    id: "peek_a_boo_sparkles",
    url: "/manus-storage/Lumen_playing_peek-a-boo_sparkles_202605081918_7695be2b.mp4",
    action: "Plays peek-a-boo with sparkles",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pointing_energy",
    url: "/manus-storage/lifewoven-original-pointing_energy_9690b72d.mp4",
    action: "Points forward with energetic smile",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "sliding_in",
    url: "/manus-storage/Lumen_sliding_into_view_202605082009_7ad94aa5.mp4",
    action: "Slides into view from the side",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "taps_camera",
    url: "/manus-storage/Lumen_taps_camera_lens_202605081958_44c95a10.mp4",
    action: "Taps the camera lens playfully",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "bouncing_joyfully",
    url: "/manus-storage/lifewoven-bouncing-original_60092b33.mp4",
    action: "Bounces joyfully",
    role: "reaction",
    duration: 8,
  },
  {
    id: "core_unfurls",
    url: "/manus-storage/lifewoven-core-unfurls-original_ffd8a81a.mp4",
    action: "Core lights up and unfurls for Oracle mode",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "crosses_face",
    url: "/manus-storage/Mascot_crosses_limbs_over_face_202605081729_f9c17066.mp4",
    action: "Crosses limbs over face when overwhelmed",
    role: "reaction",
    duration: 8,
  },
  {
    id: "starburst_pose",
    url: "/manus-storage/lifewoven-original-starburst_pose_4d26bfa1.mp4",
    action: "Dynamic starburst pose with high energy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pushing_table",
    url: "/manus-storage/Mascot_pushing_holographic_table_202605081828_ad59eb2f.mp4",
    action: "Pushes a holographic interface table",
    role: "ambient",
    duration: 8,
  },
  {
    id: "self_soothing",
    url: "/manus-storage/lifewoven-original-self_soothing_99caeafa.mp4",
    action: "Self-soothing hug with glow",
    role: "ambient",
    duration: 8,
  },
  {
    id: "taps_chin",
    url: "/manus-storage/lifewoven-original-taps_chin_bddea47f.mp4",
    action: "Taps chin with pulsing light while thinking",
    role: "ambient",
    duration: 8,
  },
  {
    id: "tilting_listening",
    url: "/manus-storage/lifewoven-original-tilting_listening_4abe4b89.mp4",
    action: "Tilts core while listening attentively",
    role: "ambient",
    duration: 8,
  },
  {
    id: "turning_dial",
    url: "/manus-storage/lifewoven-original-turning_dial_ab32ffbf.mp4",
    action: "Turns a holographic interface dial",
    role: "ambient",
    duration: 8,
  },
  {
    id: "turning_extending",
    url: "/manus-storage/lifewoven-original-turning_extending_0c8f099f.mp4",
    action: "Turns right and extends a limb to direct attention",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "twirls_sparkles",
    url: "/manus-storage/Mascot_twirls_releasing_sparkles_202605081724_c52b7bf8.mp4",
    action: "Twirls while releasing sparkles",
    role: "reaction",
    duration: 8,
  },
  {
    id: "floating_center",
    url: "/manus-storage/lifewoven-floating-original_9793a54e.mp4",
    action: "Floating centered in a calm ambient pose",
    role: "ambient",
    duration: 8,
  },
  {
    id: "nodding_gently",
    url: "/manus-storage/lifewoven-original-nodding_gently_b6d2dca1.mp4",
    action: "Nods gently in affirmation",
    role: "ambient",
    duration: 8,
  },
  {
    id: "starburst_joy",
    url: "/manus-storage/scene1_hero_cropped_78f454f5.mp4",
    action: "Throws arms wide into a joyful starburst",
    role: "reaction",
    duration: 8,
  },
  {
    id: "transformation",
    url: "/manus-storage/transformation_cropped_f7f54faa.mp4",
    action: "Spins in a magical burst then returns to calm",
    role: "reaction",
    duration: 8,
  },
];

/** Ambient video to loop on the Oracle page — core unfurls, listening presence */
export const ORACLE_AMBIENT = "core_unfurls";

/** Ambient video for the Dashboard welcome moment — gentle affirmation */
export const DASHBOARD_AMBIENT = "nodding_gently";

/** Default idle loop for any ambient placement */
export const DEFAULT_AMBIENT = "floating_center";
