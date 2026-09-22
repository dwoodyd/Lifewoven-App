# Onboarding Media Repair — 2026-09-22

**Author:** Manus AI

## Result

The three onboarding clips identified in the supplied screenshots as watermarked have been replaced with the approved, clean source media. The replacements are distinct from the pre-existing Pathways mappings. No pathway clip was repurposed or changed.

| Onboarding scene | Retired scene ID | Clean supplied source | Active storage asset |
|---|---|---|---|
| 5S Framework | `holographic_panel` | `Untitledvideo(58).mov` | `/manus-storage/lifewoven-onboarding-framework-clean-h264_15653685.mp4` |
| Contemplative practice | `self_hug` | `Untitledvideo(67).mov` | `/manus-storage/lifewoven-onboarding-contemplative-clean-h264_8562197f.mp4` |
| Launch | `burst_joy` | `Mascot_in_dynamic_starburst_pose_202605081833.mp4` | `/manus-storage/lifewoven-onboarding-launch-clean_b487be0e.mp4` |

## Browser compatibility correction

The supplied Framework and Contemplative source videos were encoded as HEVC. The preview browser resolved both files but rejected them before decoding, leaving the onboarding frame black. They were re-encoded from the supplied clean sources to browser-safe H.264 High Profile with `yuv420p` pixels and a fast-start MP4 layout. This changes the codec container only; it does not substitute or generate visual material. The Launch source was already H.264-compatible and was used directly.

## Verification performed

Each final storage file returned `200` with `video/mp4`. A SHA-256 comparison confirmed that the final uploaded bytes matched the prepared browser-ready local files. The Framework and Contemplative assets decode as H.264/yuv420p, and the Launch asset also decodes as H.264/yuv420p.

A controlled onboarding replay was exercised in the active preview. The Framework scene played `lifewoven-onboarding-framework-clean-h264_15653685.mp4` with `readyState: 4`, `paused: false`, and a decoded 1648 × 1080 frame. The Contemplative scene played `lifewoven-onboarding-contemplative-clean-h264_8562197f.mp4` with `readyState: 4`, `paused: false`, and a decoded 1650 × 1080 frame. The Launch scene played `lifewoven-onboarding-launch-clean_b487be0e.mp4` with `readyState: 4`, `paused: false`, and a decoded 1920 × 1080 frame. Preview screenshots showed the Framework and Launch scenes rendered as video rather than black fallback surfaces.

The clip review found no visible watermark, logo, or text overlay in each selected source. This is a review of the supplied files and the local preview only. It does not claim separate installed-device validation.

## Regression protection

`server/lumen.media.test.ts` now binds the three exact onboarding scene IDs to the approved storage URLs and rejects the prior `holographic_panel`, `self_hug`, and `burst_joy` mappings for those scenes. Focused media and mobile regression coverage passed. The full application release gate passed with **39 test files / 281 tests**, one intentionally skipped Redis connectivity test pending a valid TLS Redis endpoint, TypeScript, the production PWA build, and a clean production dependency audit.

## References

[1]: file:///home/ubuntu/upload/Untitledvideo%2858%29.mov "Owner-supplied clean Framework onboarding source"
[2]: file:///home/ubuntu/upload/Untitledvideo%2867%29.mov "Owner-supplied clean contemplative onboarding source"
[3]: file:///home/ubuntu/upload/Mascot_in_dynamic_starburst_pose_202605081833.mp4 "Owner-supplied clean launch onboarding source"
