/**
 * Lumin V2 video catalogue — knitted sun character.
 * All old colorful geometric Lumin videos replaced with new character.
 * Black backgrounds are stripped at render time via CSS mix-blend-mode: screen.
 */

export interface LuminVideo {
  id: string;
  url: string;
  /** Human-readable description of what Lumin does in this clip */
  action: string;
  /** Suggested use-case in the UI */
  role: "onboarding" | "ambient" | "reaction" | "landscape";
  /** Duration in seconds */
  duration: number;
}

export const LUMIN_VIDEOS: LuminVideo[] = [
  // ── Onboarding screen 1 hero ─────────────────────────────────────────────
  {
    id: "screen1_hero",
    url: "/manus-storage/scene1_hero_v2_cropped_3f793bf0.mp4",
    action: "Opening hero video for onboarding screen 1",
    role: "onboarding",
    duration: 10,
  },
  // ── Named / clean originals ──────────────────────────────────────────────
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
    url: "/manus-storage/Lumen_pointing_with_energetic_smile_202605082000_7f9cfe4f.mp4",
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
    url: "/manus-storage/Mascot_Lumen_bouncing_joyfully_202605081915_0baedd24.mp4",
    action: "Bounces joyfully",
    role: "reaction",
    duration: 8,
  },
  {
    id: "analyzing",
    url: "/manus-storage/Mascot_analyzing_with_magnifying\u2026_202605081817_54ece545.mp4",
    action: "Analyzing with magnifying glass — curious",
    role: "ambient",
    duration: 8,
  },
  {
    id: "core_unfurls",
    url: "/manus-storage/Mascot_core_lights_up_unfurls_202605081910_09362c4a.mp4",
    action: "Core lights up and unfurls — Oracle mode",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "crosses_face",
    url: "/manus-storage/Mascot_crosses_limbs_over_face_202605081729_f9c17066.mp4",
    action: "Crosses limbs over face — overwhelmed",
    role: "reaction",
    duration: 8,
  },
  {
    id: "starburst_pose",
    url: "/manus-storage/Mascot_in_dynamic_starburst_pose_202605081833_70151f12.mp4",
    action: "Dynamic starburst pose — high energy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pushing_table",
    url: "/manus-storage/Mascot_pushing_holographic_table_202605081828_ad59eb2f.mp4",
    action: "Pushes holographic UI table",
    role: "ambient",
    duration: 8,
  },
  {
    id: "self_soothing",
    url: "/manus-storage/Mascot_self-soothing_hug_glowing_202605081857_f43381f6.mp4",
    action: "Self-soothing hug with glow",
    role: "ambient",
    duration: 8,
  },
  {
    id: "smiles_sweeping",
    url: "/manus-storage/Mascot_smiles_sweeping_outward_f\u2026_202605081522_985e11eb.mp4",
    action: "Smiles and sweeps arms outward — welcoming",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "taps_chin",
    url: "/manus-storage/Mascot_taps_chin_pulsing_light_202605081534_ea0a6928.mp4",
    action: "Taps chin with pulsing light — thinking",
    role: "ambient",
    duration: 8,
  },
  {
    id: "tilting_listening",
    url: "/manus-storage/Mascot_tilting_core_listening_202605081754_00589b96.mp4",
    action: "Tilts core while listening — attentive",
    role: "ambient",
    duration: 8,
  },
  {
    id: "turning_dial",
    url: "/manus-storage/Mascot_turning_holographic_UI_dial_202605081825_e6f69148.mp4",
    action: "Turns holographic UI dial",
    role: "ambient",
    duration: 8,
  },
  {
    id: "turning_extending",
    url: "/manus-storage/Mascot_turning_right_extending_l\u2026_202605081518_73b0d78a.mp4",
    action: "Turns right and extends limb — pointing/directing",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "twirls_sparkles",
    url: "/manus-storage/Mascot_twirls_releasing_sparkles_202605081724_c52b7bf8.mp4",
    action: "Twirls releasing sparkles",
    role: "reaction",
    duration: 8,
  },
  {
    id: "floating_center",
    url: "/manus-storage/Woven_mascot_floating_center_202605081537_eb205f5f.mp4",
    action: "Floating centered — calm ambient",
    role: "ambient",
    duration: 8,
  },
  {
    id: "nodding_gently",
    url: "/manus-storage/nodding_gently_cropped_d8a18bac.mp4",
    action: "Nodding gently — affirming",
    role: "ambient",
    duration: 8,
  },

  // ── Untitled videos (analyzed) ────────────────────────────────────────────
  {
    id: "waves_sparkles",
    url: "/manus-storage/Untitledvideo(31)_f3caad09.mp4",
    action: "Waves arms with magical sparkles — peaceful happy",
    role: "ambient",
    duration: 8,
  },
  {
    id: "burst_arms",
    url: "/manus-storage/Untitledvideo(32)_c8031332.mp4",
    action: "Bursts arms outward with magical dust — wide happy smile",
    role: "reaction",
    duration: 8,
  },
  {
    id: "gentle_open",
    url: "/manus-storage/Untitledvideo(37)_dd0f4f1a.mp4",
    action: "Brings arms together gently then spreads wide — opening",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "peaceful_idle",
    url: "/manus-storage/Untitledvideo(53)_b4aa31f0.mp4",
    action: "Smiling peacefully, eyes closed, gently waving — IDLE",
    role: "ambient",
    duration: 8,
  },
  {
    id: "spin_return",
    url: "/manus-storage/Untitledvideo(54)_50091211.mp4",
    action: "Waves, spins with sparks, returns to calm — transition",
    role: "reaction",
    duration: 8,
  },
  {
    id: "spin_celebrate",
    url: "/manus-storage/Untitledvideo(55)_03a2cf54.mp4",
    action: "Spins rapidly then celebratory pose with sparks",
    role: "reaction",
    duration: 8,
  },
  {
    id: "protect_head",
    url: "/manus-storage/Untitledvideo(56)_0b690d72.mp4",
    action: "Open arms then wraps around head — overwhelmed/protect",
    role: "reaction",
    duration: 8,
  },
  {
    id: "idle_wriggle",
    url: "/manus-storage/Untitledvideo(57)_92946994.mp4",
    action: "Standing, rays wriggling — idle loop",
    role: "ambient",
    duration: 8,
  },
  {
    id: "magnifying",
    url: "/manus-storage/Untitledvideo(58)_bad25587.mp4",
    action: "Holds glowing magnifying glass with curiosity — analyzing",
    role: "ambient",
    duration: 8,
  },
  {
    id: "awakening",
    url: "/manus-storage/Untitledvideo(60)_fb3ba5b0.mp4",
    action: "Arms outstretched, magical circle, face glows — awakening",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "elder_book",
    url: "/manus-storage/Untitledvideo(63)_812252f5.mp4",
    action: "Felt elder man holding Before the Words book — reading/character",
    role: "ambient",
    duration: 8,
  },
  {
    id: "holographic_panel",
    url: "/manus-storage/onboarding_scene3_v2_2e4f9665.mov",
    action: "Raises arms to lift holographic panel — presenting data",
    role: "ambient",
    duration: 8,
  },
  {
    id: "starburst_joy",
    url: "/manus-storage/scene1_hero_cropped_78f454f5.mp4",
    action: "Throws arms wide, star pose, sparkles — starburst joy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "winking_idle",
    url: "/manus-storage/Untitledvideo(66)_69cd4878.mp4",
    action: "Standing, smiling, eyes closed, winking — content idle",
    role: "ambient",
    duration: 8,
  },
  {
    id: "self_hug",
    url: "/manus-storage/self_hug_cropped_5c99c7fe.mp4",
    action: "Wraps rays around glowing face — self-soothing hug",
    role: "ambient",
    duration: 8,
  },
  {
    id: "dancing",
    url: "/manus-storage/Untitledvideo(68)_12b4860e.mp4",
    action: "Joyfully dances, waving rays",
    role: "reaction",
    duration: 8,
  },
  {
    id: "settling",
    url: "/manus-storage/Untitledvideo(69)_589a6792.mp4",
    action: "Gently lowers arms — settling/calm",
    role: "ambient",
    duration: 8,
  },
  {
    id: "burst_joy",
    url: "/manus-storage/burst_joy_cropped_21bc11b5.mp4",
    action: "Claps, glows, jumps, explodes into yarn puff — burst of joy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "peekaboo_reveal",
    url: "/manus-storage/Untitledvideo(71)_d746cd92.mp4",
    action: "Peekaboo then throws arms wide with laugh and light — reveal",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "transformation",
    url: "/manus-storage/transformation_cropped_f7f54faa.mp4",
    action: "Spins in magical burst, surprised then dancing — transformation",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pure_joy",
    url: "/manus-storage/Untitledvideo(73)_03b3bd15.mp4",
    action: "Joyfully dancing and laughing — pure joy",
    role: "reaction",
    duration: 8,
  },
  {
    id: "pointing_down",
    url: "/manus-storage/Untitledvideo(74)_da0c331b.mp4",
    action: "Enthusiastically points downward — CTA/directing",
    role: "onboarding",
    duration: 8,
  },
  {
    id: "spinning",
    url: "/manus-storage/Untitledvideo(75)_b8896f89.mp4",
    action: "Joyfully spins, twirling rays",
    role: "reaction",
    duration: 8,
  },
  {
    id: "peeking",
    url: "/manus-storage/Untitledvideo(76)_7ea1b82b.mp4",
    action: "Waves arms, hides behind wall, peeks out — shy/playful",
    role: "reaction",
    duration: 8,
  },
];

/** Ambient video to loop on the Oracle page — core unfurls, listening presence */
export const ORACLE_AMBIENT = "core_unfurls";

/** Ambient video for the Dashboard welcome moment — peaceful idle */
export const DASHBOARD_AMBIENT = "peaceful_idle";

/** Default idle loop for any ambient placement */
export const DEFAULT_AMBIENT = "idle_wriggle";
