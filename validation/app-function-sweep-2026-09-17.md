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
