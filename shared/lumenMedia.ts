/**
 * Poster frames are extracted directly from their matching commissioned Lumen
 * MP4. Generated or substitute artwork is deliberately never used here.
 */
export const LUMEN_POSTERS = {
  taps_chin: "/manus-storage/taps_chin_74ab7efd.jpg",
  nodding_gently: "/manus-storage/nodding_gently_832a863e.jpg",
  tilting_listening: "/manus-storage/tilting_listening_44a221af.jpg",
  core_unfurls: "/manus-storage/core_unfurls_e0e1badd.jpg",
  floating_center: "/manus-storage/floating_center_25c8d7bc.jpg",
  self_soothing: "/manus-storage/self_soothing_15851a30.jpg",
  settling: "/manus-storage/settling_6bf42ccf.jpg",
  waves_sparkles: "/manus-storage/waves_sparkles_8b2067bb.jpg",
  starburst_pose: "/manus-storage/starburst_pose_486f25e1.jpg",
  pointing_energy: "/manus-storage/pointing_energy_fa9f1389.jpg",
  turning_dial: "/manus-storage/turning_dial_d68d92b9.jpg",
  self_hug: "/manus-storage/self_hug_f4025afd.jpg",
  burst_joy: "/manus-storage/burst_joy_ecefdb2d.jpg",
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
