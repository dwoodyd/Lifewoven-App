# Entry Funnel Verification — 2026-09-16

## Direct browser findings

- The unauthenticated development landing header displayed **How it works**, **Pricing**, **About**, **Sign in**, and one **Begin** action. It no longer exposed the six product-tool links before sign-in.
- The landing hero displayed one primary **Begin your private space** account-creation action, with Terms, Privacy Policy, and Manus-service context adjacent to that action.
- Navigating to `/signup?returnTo=/pricing` redirected directly to the OAuth account-selection page with `type=signUp`; its encoded return path was `/dashboard`, preserving the established bare-pricing beta-entry rule.

## Automated validation

- The focused new-user funnel suite passed after the source-level contract was updated.
- The complete Vitest suite and production PWA build passed after the final funnel change.

## Responsive review

An independent 390px Chromium capture showed the compact mobile header with the Lifewoven mark, theme control, and menu affordance only; the six-tool system was not displayed. The hero retained one visible primary entry action. A desktop DOM review found the navigation header to be the only fixed or sticky element, with no extra fixed overlay from the revised entry flow.

## Limitation

- The managed preview screenshot route still returned a blank frame because of its pre-existing preview-origin CORS behavior. The direct browser render, navigation extraction, and OAuth handoff checks above were usable.
