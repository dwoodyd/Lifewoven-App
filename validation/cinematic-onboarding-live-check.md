# Cinematic Onboarding Live Check — 2026-08-28

- Authenticated development-browser verification showed Lumen as the primary full-screen visual through the intro sequence, with readable word separation and line spacing.
- The first-run completion action on an account without a saved survey routed to `/audit`.
- Settings → Replay reopened the intro after completion.
- An authenticated `/weave` deep link remained unobscured.
- A returning-user race was observed when Dashboard briefly evaluated an unloaded response as empty. It was corrected by requiring loaded Dashboard data before dispatching the first-run event.
- The published site has an active worker at `/sw.js`; it is ready to serve as the baseline for a second-release waiting-worker prompt test.
