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
