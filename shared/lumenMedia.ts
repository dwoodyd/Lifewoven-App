export const LUMEN_POSTERS = {
  welcome: "/manus-storage/lumen-poster-welcome_2be68ba1.png",
  calm: "/manus-storage/lumen-poster-calm_a2c70198.png",
  listening: "/manus-storage/lumen-poster-listening_06494cf0.png",
  focus: "/manus-storage/lumen-poster-focus_973db378.png",
  celebrate: "/manus-storage/lumen-poster-celebrate_a6251e9d.png",
} as const;

const CELEBRATION_VIDEO_IDS = new Set([
  "bouncy_dance",
  "bouncing_joyfully",
  "starburst_pose",
  "twirls_sparkles",
  "burst_arms",
  "spin_celebrate",
  "starburst_joy",
  "dancing",
  "burst_joy",
  "transformation",
  "pure_joy",
  "spinning",
]);

const FOCUS_VIDEO_IDS = new Set([
  "analyzing",
  "pushing_table",
  "taps_chin",
  "turning_dial",
  "magnifying",
  "holographic_panel",
]);

const LISTENING_VIDEO_IDS = new Set([
  "tilting_listening",
  "nodding_gently",
  "taps_camera",
  "peek_a_boo_sparkles",
]);

const WELCOME_VIDEO_IDS = new Set([
  "screen1_hero",
  "pointing_energy",
  "sliding_in",
  "smiles_sweeping",
  "turning_extending",
  "gentle_open",
  "awakening",
  "peekaboo_reveal",
  "pointing_down",
]);

/**
 * Every Lumen clip receives a visible poster immediately. The mappings are
 * intentionally role-based so a failed or deferred video still communicates
 * the appropriate emotional state without introducing a blank media strip.
 */
export function getLumenPoster(videoId: string): string {
  if (CELEBRATION_VIDEO_IDS.has(videoId)) return LUMEN_POSTERS.celebrate;
  if (FOCUS_VIDEO_IDS.has(videoId)) return LUMEN_POSTERS.focus;
  if (LISTENING_VIDEO_IDS.has(videoId)) return LUMEN_POSTERS.listening;
  if (WELCOME_VIDEO_IDS.has(videoId)) return LUMEN_POSTERS.welcome;
  return LUMEN_POSTERS.calm;
}
