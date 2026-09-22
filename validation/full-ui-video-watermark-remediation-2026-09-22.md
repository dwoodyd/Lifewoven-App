# Full UI Video Watermark Remediation — 2026-09-22

## Scope

This review covered the **entire active Lifewoven UI video catalogue**, including Pathways cards, onboarding scenes, Oracle and dashboard ambient media, empty states, reaction moments, and direct video literals. It is distinct from a filename-only audit: contact sheets were generated from each active source and visually reviewed across the beginning, middle, and end of each clip.

## Finding

The initial active catalogue contained a broader watermark problem than the onboarding sequence alone. In addition to the already-repaired onboarding scenes, **24 legacy catalogue entries visibly carried a Veo watermark**. Several were reachable in the UI, including the prior dashboard/books empty-state default, Journal save reaction, and Standards habit-completion reaction. The remaining entries were still selectable through the catalogue and therefore represented a regression risk even where no current call site was found.

## Remediation

The active `LUMIN_VIDEOS` catalogue has been reduced from 54 entries to **30 visually reviewed sources**. All 24 visually failed entries were removed from the catalogue rather than hidden or renamed. The direct UI assignments that had used a failed clip were changed as follows:

| Surface | Prior selection | Active reviewed selection |
|---|---|---|
| Dashboard default empty state | `peaceful_idle` | `nodding_gently` |
| Books empty state | `peaceful_idle` | `nodding_gently` |
| Dashboard ambient default | `peaceful_idle` / `idle_wriggle` | `nodding_gently` / `floating_center` |
| Journal-save reaction | `waves_sparkles` | `nodding_gently` |
| Habit-completion reaction | `spin_celebrate` | `twirls_sparkles` |

Stale poster mappings for removed clips were deleted as well. The clean onboarding assignments remain intact: `screen1_hero`, `nodding_gently`, `onboarding_framework_clean`, `transformation`, `onboarding_contemplative_clean`, and `onboarding_launch_clean`.

## Visual review result

The final active catalogue contains **30 sources**: six Pathways clips, six onboarding clips, and eighteen reaction/ambient/interface clips. Contact sheets were regenerated after the catalogue cleanup and each active source was visually inspected for a watermark. No visible **Veo** watermark, logo, or vendor overlay was found in the sampled frames of any active source.

This is a visual assessment of the active UI assets, not a claim about unreferenced objects that still exist in storage. The legacy watermarked source files may remain in storage for rollback/history, but no active Lifewoven source assignment points to them.

## Regression protection

`server/lumen.media.test.ts` now rejects every removed watermark-associated clip identifier and `Untitledvideo(...)` source in the active catalogue. The regression also checks direct video assignments on the affected dashboard, empty-state, Journal, and Standards surfaces. This makes an accidental reintroduction fail automated validation.

## Validation

| Check | Result |
|---|---|
| Active video inventory | 30 registered sources; no unregistered direct UI video literals |
| Visual review | 30 regenerated active-source contact sheets reviewed |
| Watermark blacklist scan | No removed watermark-associated catalogue identifier or `Untitledvideo(...)` source in the active catalogue/poster mappings |
| Focused media regressions | Passed |
| TypeScript | Passed |
| Full test suite | 39 test files: 38 passed, 1 intentionally skipped; 282 tests: 281 passed, 1 intentionally skipped |
| Production PWA build | Passed |
| Production dependency audit | Passed with no known vulnerabilities |

## Boundary

The review establishes that the sources currently capable of rendering in the Lifewoven UI are visually clean in sampled contact-sheet frames. It does **not** delete old storage objects or establish provenance/licensing for any asset; those require an asset-owner decision and are outside this UI remediation.
