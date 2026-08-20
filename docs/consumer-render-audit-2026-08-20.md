# Consumer Render Audit — 2026-08-20

## Homepage, desktop live render

The page loads, but the hero currently has a readability failure: the headline, descriptive copy, and secondary CTA sit directly across the commissioned Lumen image without enough protected negative space or a strong enough scrim. The mascot is visible, but the type competes with its face and rays. The primary survey button remains legible, while secondary and supporting text have inadequate contrast against the active media.

The live DOM confirms the hero is serving the extracted canonical `floating_center` JPEG before its video. The consumer-facing correction should preserve that video and its poster, but reposition the copy and add a deliberately shaped readability field rather than darkening or replacing Lumen.

## Pathways, desktop live render

The Reset feature card preserves its real canonical frame, but its oversized close crop competes with the recovery copy. The secondary pathway cards are the more severe issue: their poster frames fill nearly the whole card while white headings and paragraphs are printed directly over Lumen’s face and tendrils. This makes the type difficult to read and turns the portrait media into an uncontrolled background.

The requested portrait dimensions should remain, but each card needs a dedicated copy surface and the media needs to be positioned away from the text. The design should use the frame as a portrait scene alongside or above the content, not as a full-card image under body copy.

## Dashboard, desktop live render

The greeting and next-action order are clear. The primary Lumen diagnostic is in the first viewport, but it is visually empty: only a dim, blurred glow appears where the canonical poster/video should be. The reading copy is legible because it sits on dark ground, but the intended central character is absent, which leaves a large blank technical panel rather than a Lumen-led opening.

The visible behavior suggests the current screen-blend and/or container cropping is suppressing the real JPEG poster before video readiness. This is a high-priority render defect because the character is the primary dashboard diagnostic, not decoration.

## Oracle, desktop live render

The signed-out Oracle threshold state is visually clear and readable, with no mascot-media conflict. This browser session cannot review the signed-in conversation tabs, chat scroll, or composer state without an authenticated customer session, so those remain pending for a later authenticated check.

## The Weave, desktop live render

The guest-facing Weave page is readable and avoids the Lumen-over-text issue. Its signed-out state still exposes a large prompt panel beside the sign-in message, which feels like a crowded partially accessible tool rather than a focused invitation. This is a lower-priority composition issue; it does not have the immediate media or contrast failure seen on the dashboard and Pathways.

## The Ground, desktop live render

The Ground is the strongest reviewed page. Its text is readable against a consistent dark field, its state choices are structurally clear, and no Lumen media conflicts with copy. The state-choice row would still benefit from stronger selected-state contrast, but it is not blocking compared with the dashboard’s missing primary poster and Pathways’ text-on-media collision.

## Load-Bearing Survey, desktop live render

The survey introduction is clear, well spaced, and readable. The engineering field supports the language rather than competing with it. No visual correction is required from this review.

## Confirmed repair priorities

| Severity | Surface | Observed defect | Consumer-facing correction |
|---|---|---|---|
| Blocker | Dashboard | Primary Lumen scene is a blank haze rather than the commissioned character. | Ensure the canonical extracted poster is visible independently of video blend/readiness. |
| Blocker | Pathways | Portrait Lumen images sit underneath headings and body copy, including Lumen’s face. | Keep the portrait media but reserve a solid copy surface beside or below it. |
| High | Home | Hero copy crosses the character and loses contrast. | Preserve the canonical hero media while moving copy into negative space over a dedicated readable field. |
| Medium | The Weave | Guest state competes with the large prompt panel. | Simplify the guest composition after the media and hero issues are corrected. |

## Verification environment note

The public domain remained on the prior deployed revision during the first correction review: browser inspection showed the pre-correction hero class list and centered media treatment. Subsequent visual checks must use the active development preview until the new checkpoint is ready, then recheck the deployed revision after publication.

## Working-build homepage recheck

The corrected development preview now keeps the headline, support copy, and calls to action in a protected left-hand copy field. The commissioned Lumen frame is visible at the right; her face is no longer covered by text, and the hero’s supporting typography is readable. This resolves the observed homepage hierarchy and contrast failure without replacing the canonical media.

## Working-build Pathways recheck

The repaired development preview now retains the canonical Reset portrait in a separate 520×650 media panel and places all Reset text on an adjacent solid reading surface. The secondary cards likewise separate their portrait scenes from their heading and description areas. The face and tendrils are no longer behind the card typography.

## Remaining authenticated review

The local dashboard route redirects to the existing sign-in flow in this browser session. A signed-in customer session is required to complete the visual review of the diagnostic, Oracle conversation, check-in, and saved Weave states.

## Authenticated Oracle, working-build review

The Oracle opening is structurally improved: Lumen occupies a dedicated portrait panel and the title/copy occupy an adjacent reading field. The composer remains attached to the prompt and its send control. The tab row intentionally scrolls horizontally rather than overlapping labels; the first three tabs remain readable, with the fourth available by horizontal scroll. No blocking visual change is required from this review.

## Authenticated Weave recheck

The Weave empty-state poster is now an independent portrait scene above the empty-state title, description, and call to action. Its journal invitation is fully readable, and the commissioned frame remains present without competing with text.

## Mobile-viewport limitation

The active review browser is fixed at 1280×1100 and does not honor window resize requests, so a true 390px consumer render cannot be claimed from this session. The desktop responsive breakpoints are implemented and the mobile audit remains explicitly open for a device-width browser session rather than being marked complete without visual evidence.

## Canonical Pathways full-figure framing

The Reset and Align commissioned frames both place Lumen’s full figure and tendrils across the landscape width. The full composition cannot survive a portrait `object-fit: cover` crop. Pathways therefore needs a landscape full-bleed frame with the video scaled to fill width and the original background retained as its edge-to-edge field; this preserves the entire character without adding synthetic borders or substituting new art.

## Pathways watermark audit — first samples

The sampled Reset (`burst_joy`) frames are clean. The sampled Align (`settling`) frames visibly carry the `Veo` watermark in the lower-right corner throughout the contact sheet and must not remain an active Pathways asset without an existing clean commissioned replacement or a safe, source-preserving remediation.

The sampled Resonance (`waves_sparkles`) frames also carry a lower-right `Veo` watermark. The sampled Uplift (`starburst_pose`) frames are clean across the inspected contact sheet.

The sampled Flow (`pointing_energy`) and Rhythms (`turning_dial`) frames are clean across the inspected playback samples.

The sampled Purpose (`self_hug`) frames are clean. The audit identifies only `settling` and `waves_sparkles` as watermark-affected among the seven active Pathways clips; both require a clean, source-preserving derivative before use.

The cleaned full-figure derivatives for `settling` and `waves_sparkles` were visually sampled across playback. Neither contact sheet shows a visible VEO mark, and Lumen’s complete figure remains inside the original-image field.

## Clean canonical Pathways swap candidates

`bouncing_joyfully` is clean and presents Lumen at full figure within a balanced landscape field, making it a stronger Reset candidate than the matted `burst_joy` source. `nodding_gently` is clean but is a close, intentionally cropped listening scene; it is not suitable where the requirement is a complete figure with all tendrils visible.

`core_unfurls` is clean and contains a full-figure unfurl sequence inside an even landscape field; it is a strong replacement for the watermarked Resonance scene. `floating_center` is clean but is cropped at the lower body in several frames and is not appropriate for the full-figure Pathways requirement.

`self_soothing` is clean but transitions into a close self-hug composition and is not a dependable full-figure Pathways scene. `starburst_joy` is clean and holds Lumen full figure against a broad, bright source field. The selected clean swaps are therefore `bouncing_joyfully` for Reset, `starburst_joy` for Align, and `core_unfurls` for Resonance; their current edited source assets remain available as fallbacks.

The rendered Pathways recheck confirms the three clean swaps are each playing with `readyState: 4`, are not paused, have no duplicate image siblings, and use their own extracted poster frames. Reset now fills its surface with a full-figure, clean canonical composition. Align and Resonance use the selected clean source treatments without watermark exposure.

## Dashboard full-figure recheck

The first-reading diagnostic now uses a source-matched 16:9 scene with `contain` rather than the inherited portrait `cover` crop. Lumen’s full arms and tendrils are visible in the opening, and the structural-reading copy occupies a distinct left-hand field rather than covering the character. The greeting scene also retains the complete commissioned figure at its smaller scale.

All visible dashboard empty states now use a dedicated 16:9 source-matched media field above a separate copy field. The recheck covered Rhythms, Goals, The Weave, Oracle Insights, and Active Pathways. Each scene keeps Lumen’s full figure visible, and every title, supporting sentence, and call to action now sits on the card surface below rather than over the commissioned media.

## Sign-in flow inspection

The Lifewoven `/login` route contains no mascot media. It immediately redirects to the Manus OAuth account-selection portal, which also contains no Lumen video or poster layer. The reported sign-in artifact therefore belongs to a different in-app surface that needs a page or screenshot identifier before it can be safely repaired.

## Public landing recheck

The public landing hero is the screen previously described as sign-in. It now mounts a single native video element with its matching `poster` attribute; the separate absolutely positioned poster image is removed. The full figure remains in a source-matched 16:9 scene, while the marketing copy remains in the dark protected field on the left.

## The Weave header recheck

The Weave header now uses a dedicated 16:9 source-matched Lumen field. Lumen’s full limbs are visible in the right-hand panel, and the title, description, and entry controls remain isolated in the left reading field without crossing the commissioned media.

## Oracle header recheck

The Oracle header now uses a single, source-matched 16:9 canonical scene on the right rather than the inherited portrait cover crop. Lumen’s complete arms and tendrils are visible, while the Oracle title and explanatory text occupy an independent left reading field.

## Weave route-entry recheck

Direct navigation to `/weave` now opens at document position zero with the navigation and Weave header visible. Browser scroll restoration is set to manual and route changes schedule an explicit top-of-page reset on the next animation frame.

## Landing-hero scale recheck

The deployed public hero now presents Lumen as the largest media treatment on the landing page, using one native video and its matching first-frame poster. The hero occupies the broad right-hand field while the marketing copy remains protected on the left; other page media placements were not reduced.

## Dashboard first-reading hierarchy recheck

The “Let’s take your first reading” scene now uses a diagnostic-only width allowance rather than the shared 520px ambient cap. It is the dominant Lumen media treatment on the dashboard, preserves the complete commissioned figure, and keeps the reading explanation and call to action in a protected left-side field. Other dashboard media sizes remain unchanged.

## Oracle entry and dissolve recheck

Direct navigation to `/oracle` now begins at document position zero. The initial empty conversation no longer scrolls to the input area. Its hero scene uses a subtle left-edge media mask so Lumen’s image dissolves into the adjacent reading field rather than ending at a hard rectangular boundary.

## Weave dissolve recheck

The Weave header now applies the same left-edge ambient mask to its compact Lumen scene. The character and her warm scene soften into the page field before the title and entry controls, removing the visible panel seam while preserving full text contrast.

## Light-mode recheck

The navigation control now clearly changes action from “Switch to light mode” to “Switch to dark mode.” In light mode, The Weave renders as a warm-paper interface with dark ink copy, white card surfaces, visible borders, and the same Lumen media treatment. The restored semantic tokens preserve legibility across navigation, buttons, prompts, entries, and supporting metadata.
