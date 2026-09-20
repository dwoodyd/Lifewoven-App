# Production Feedback Repair — 2026-09-19

## Scope

This repair responds to production feedback on Story, Strategy, runtime image alternatives, and Character controls. It deliberately distinguishes **changed** behavior from **checked** evidence.

## Changed

| Area | Change |
|---|---|
| Story retrieval | The Story module now uses the same cache invalidation pattern as the repaired Energy Audit, gives persisted entries an explicit **Saved beliefs** section, and distinguishes the learning example from account data. Belief declarations now map to the existing `beliefs.affirmation` column, so a rewrite survives reload. |
| Strategy retrieval | The Strategy module now invalidates and reloads `decisions.list` after saving or analyzing, gives entries an explicit **Saved decisions** section, and persists Oracle analysis and second-order effects to the decision record rather than only component state. |
| AI safeguards | Belief rewrites and decision analyses now route through `invokeMeteredLLM` at the economical tier, preserving the usage ledger and bounded model policy. |
| Image alternatives | `LuminScene` posters and videos now expose a meaningful Lumen scene description. Lifewoven brand images use a non-empty alternative. No client source image retains `alt=""`. |
| Character controls | The hidden book-cover upload and replacement inputs now have programmatic names; filter controls expose pressed state. |

## Checked but not reported as changed

The deployed bundle before this repair already had one real client caller each for `beliefs.list` and `decisions.list`; the one-occurrence count is not a router-only definition in browser code. That source presence was **checked**, not treated as proof that the complete write → reload → visible-history experience worked. The repair above changes that experience explicitly.

## Source and bundle validation

The current source passed TypeScript and the full test suite: **36 test files / 267 tests**. A production build passed and `pnpm audit --prod --audit-level=high` reported no known vulnerabilities. The generated main bundle contains `Saved beliefs` twice, `Saved decisions` twice, the Story and Strategy query callers, `Lumen animation:`, and `Upload a book cover image`; it contains no `alt:""` marker.

## Remaining confirmation boundary

An authenticated owner write → hard reload round-trip for a newly saved belief and decision is still an environment-level verification after deployment. The prior published Energy Audit round-trip is already confirmed by the owner; this report does not claim that a new owner-owned Story or Strategy record was created during the repair.

## Preview render check

On the unauthenticated `/pathways` preview, the mounted navigation logo and four mounted Lumen poster images expose non-empty alternatives. A document-wide DOM query found one empty alternative on the hidden static crawler fallback, not the mounted application tree; the next validation step scopes the query to `#root` before treating it as an application defect.

A scoped preview DOM inspection of `#root` on `/pathways` found **5 images and 0 empty alternatives**: one Lifewoven brand mark and four Lumen scene posters. The document-wide empty alternative observed earlier belonged to the hidden static fallback/recovery markup; that recovery image has also been given `Lifewoven logo` text so the document now has no intentional empty brand alternative.

## Final release validation

After the final accessibility and saved second-order-effects updates, TypeScript passed; the full suite passed; the production PWA build completed; the production dependency audit reported no known vulnerabilities; and `git diff --check` passed. The generated main asset was `index-DaVtnorc.js`. Its shipped markers were: `Saved beliefs` (2), `Saved decisions` (2), `beliefs.list.useQuery` (1), `decisions.list.useQuery` (1), `Lumen animation:` (1), and `Upload a book cover image` (1); no `alt:""` marker was present.
