/**
 * Poster frames are extracted directly from their matching commissioned Lumen
 * MP4. Generated or substitute artwork is deliberately never used here.
 */
export const LUMEN_POSTERS = {
  pathway_reset_clean: "/manus-storage/bouncing_joyfully_8c18f649.jpg",
  pathway_align_clean: "/manus-storage/starburst_joy_d13a9a64.jpg",
  pathway_resonance_clean: "/manus-storage/core_unfurls_abd4a413.jpg",
  taps_chin: "/manus-storage/taps_chin_74ab7efd.jpg",
  nodding_gently: "/manus-storage/nodding_gently_832a863e.jpg",
  tilting_listening: "/manus-storage/tilting_listening_44a221af.jpg",
  core_unfurls: "/manus-storage/core_unfurls_e0e1badd.jpg",
  floating_center: "/manus-storage/floating_center_25c8d7bc.jpg",
  self_soothing: "/manus-storage/self_soothing_15851a30.jpg",
  settling: "/manus-storage/settling_16ce4abf.jpg",
  waves_sparkles: "/manus-storage/waves_sparkles_4709ca54.jpg",
  starburst_pose: "/manus-storage/starburst_pose_cd7c5c9f.jpg",
  pointing_energy: "/manus-storage/pointing_energy_76845d41.jpg",
  turning_dial: "/manus-storage/turning_dial_9be38951.jpg",
  self_hug: "/manus-storage/self_hug_7233bd09.jpg",
  burst_joy: "/manus-storage/burst_joy_22a7ca01.jpg",
  bouncing_joyfully: "/manus-storage/bouncing_joyfully_9584aadb.jpg",
  screen1_hero: "/manus-storage/screen1_hero_39a3cc5e.jpg",
  holographic_panel: "/manus-storage/holographic_panel_3764ec26.jpg",
  transformation: "/manus-storage/transformation_e580e170.jpg",
  starburst_joy: "/manus-storage/starburst_joy_a27b2e7f.jpg",
} as const;

/**
 * Returns a matching canonical-video frame when one has been prepared. A clip
 * without an extracted frame is allowed to remain video-only rather than being
 * represented by newly drawn mascot artwork.
 */
export function getLumenPoster(videoId: string): string | undefined {
  return LUMEN_POSTERS[videoId as keyof typeof LUMEN_POSTERS];
}
