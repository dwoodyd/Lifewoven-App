# App-Function Sweep — 2026-09-17

## Browser-mount check

The preview was opened in the interactive browser at `https://3000-iw8q8nevpwib0hayu9q17-e6704b5d.us1.manus.computer/`. The mounted React interface rendered normally, the static `#crawlable-landing` fallback computed to `display: none`, and the document title was `Lifewoven — Habits, Identity & Goals With AI Guidance`.

The automated screenshot utility captured the intentionally static crawler fallback rather than the hydrated React page. That utility-specific result is not treated as evidence of a user-facing blank shell or presentation defect. The interactive browser view showed the actual public header, hero, guided account-creation action, and public navigation.

## Functional baseline

TypeScript passed. The complete Vitest suite passed with 33 test files and 249 tests. The production PWA build passed, and `pnpm audit --prod --audit-level=high` reported no known vulnerabilities. Local and production public-route checks returned 200 for `/`, `/pricing`, `/about`, `/audit`, `/sitemap.xml`, and `/robots.txt`; a nonexistent JavaScript asset returned `404 text/plain` in both environments.

The live worker contains `self.skipWaiting()` and `clientsClaim()`. The exact retired stale-shell URL reported by the owner, `/assets/index-Bsa4Toxu.js`, returns `404 text/plain` with the literal body `JavaScript asset not found` on `app.lifewoven.click`. The public account-creation CTA already presents Terms, Privacy, sign-in-method, and optional Manus AI-service disclosure inline beside the one-click sign-up action. Explicit `/signup?returnTo=/pricing` now preserves `/pricing` through the OAuth state; explicit Seeker and Oracle choices preserve `/pricing?tier=seeker` and `/pricing?tier=oracle`.

An interactive non-payment navigation of `/signup?returnTo=/pricing` reached the provider-controlled OAuth page with `type=signUp` and a decoded state return path of `/pricing`. Completing the final callback requires a fresh provider account selection and human-verification step, so the final post-callback destination is not represented as browser-verified in this sweep. It remains source- and state-verified only.

## Scope note

Real installed-device checks and PayPal approval-page testing remain external or owner-controlled validation, not claims made by this source/build sweep.

## Controlled onboarding replay

A controlled `lifewoven:replay-onboarding` event in the mounted preview opened the full-screen onboarding controller. The first scene presented an icon-only close control, the named CTA `Show me how →`, readable line breaks, and visible spaces between animated words. The implementation keeps each word in an `inline-block` with a `0.3em` trailing margin and applies the complete sentence as the surrounding reveal container's `aria-label`. This is preview evidence for the replay event and first-scene typography only; full device typography validation remains external.

The controlled replay was advanced through the second and third scenes. Both retained the expected named transition CTA and visually spaced headline copy; the second scene used `And the story I tell myself? →` and the third used `What if I fall? →`. These interactions confirm that non-final CTAs advance the controller rather than incorrectly exiting it. The complete animation and installed-device matrix remains outside this limited preview check.

The Reset scene also rendered with its intended multi-line hierarchy, including `When you fall —` and `Reset doesn't shame you back.` The preview interaction was intentionally stopped there rather than invoking the final CTA, which would navigate to the survey flow; the last two scenes therefore remain source-verified rather than separately browser-verified in this sweep.

## Conversion timing and entitlement behavior

The server records `reflective_tool_completed` for direct authenticated survey saves, Weave saves, and Ground Check completion. It records `content_consumed` for Ground practice completion, Oracle responses, full course-PDF redemption, and unlocked article consumption. `PostActivationInvite` derives eligibility server-side from the presence of both event types, excludes beta and paid users, and is dismissible in local storage.

The sweep found that the invitation was mounted after Ground Check and on Dashboard but was absent from the Audit and Weave result surfaces. The correction mounts the same respectful component at all three reflective surfaces and invalidates the server-derived activation query after direct Audit or Weave saves. Anonymous survey-claim redemption now also records the authenticated reflective milestone atomically with the claimed result, while preserving the existing `redeemedAt` idempotency guard.

## Catalog policy reconciliation

The current source and focused catalog regression confirm the Revision 3 policy: `The Reset Protocol` remains a recording-free guided script at `$27`; storefront and product data preserve PDF-delivery labels and the `$607` combined retail value; the marketplace tab is `Scripts`; and unsupported MP3, AI-voice, audio-session, or guided-recording claims are rejected. Resource Library guided-practice materials remain labeled as document-based practices rather than an Audio category.

## Additional focused validation

Focused Vitest coverage passed for catalog format, conversion timing, launch trust, and Reading Bridge: 4 files, 30 tests. The final full release validation also passed after the anonymous-claim conversion-event correction and root-entry onboarding repair: TypeScript (`pnpm check`), **34 Vitest files / 255 tests**, the production PWA build, `pnpm audit --prod --audit-level=high` with no known vulnerabilities, and `git diff --check`.

The production build generated a precache with 23 entries totaling 3265.41 KiB. Vite reported an advisory oversized application chunk (2.83 MB minified / 824 KB gzip) because large editor and diagram dependencies remain bundled; this is a performance follow-up, not a build failure or a missing-route indication.

## Remaining boundary

This sweep deliberately leaves external or evidence-limited work open: the direct production database cleanup migration that drops the legacy empty Stripe table, custom Resend sender-domain DNS, an owner-controlled PayPal approval-page exercise, real installed iOS/Android PWA checks, and the broader watermark audit of legacy-named ambient/onboarding media. No protected download files, payment credentials, billing rules, account data, or content assets were modified.

## Follow-up application-function repair — 2026-09-17

The current follow-up closes several code-owned interaction gaps without changing payments, access grants, account data, or protected files. Oracle's guide now opens with the intended invitation—“What are you carrying right now?”—and its supporting line makes clear that an answer need not be fully formed. Every Oracle upgrade invitation now carries `tier=oracle` or `tier=seeker` as appropriate, so the selected plan remains intact through the established pricing and OAuth flow.

The Ground weekly-reflection view now reads the same server-side seven-day evidence eligibility used elsewhere. A member with access but insufficient signal sees an honest threshold explanation rather than a generation action that would fail; eligible members retain generation controls, and non-members retain the Seeker-specific invitation. A long-absent member (30 or more days) sees one optional Becoming Question only inside the Daily Check-in, without blocking a return or requiring an answer.

The personal Library now initializes a selected chat session through a React effect rather than a state initializer, which prevents an effect from running during render initialization. Its resource view adds an accessible list/grid control and a stable server-backed pathway filter. The public preview correctly renders the unauthenticated Oracle and Library entry surfaces at `/oracle` and `/my-library`; authenticated Library controls and member-only Oracle copy are covered by source and regression tests rather than a browser login in this sweep.

The complete release gate passed after these changes: TypeScript, **35 Vitest files / 260 tests**, production PWA build, `pnpm audit --prod --audit-level=high` with no known vulnerabilities, and `git diff --check`. The build retains the previously documented advisory 2.83 MB minified (824.90 KB gzip) application chunk; this is a performance follow-up rather than a failed build.
