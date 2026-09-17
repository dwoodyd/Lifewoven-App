# Lifewoven First-Time-User Audit Reconciliation

Source: `/home/ubuntu/upload/LifeWoven—First-TimeUserAudit.md`, dated 2026-09-16.

| Audit finding | Current handling | Validation target |
|---|---|---|
| Stale worker can serve a shell that references a removed hashed bundle | VitePWA uses `registerType: "autoUpdate"`, `skipWaiting: true`, and `clientsClaim: true`; Express returns a literal 404 for a missing `/assets/*.js` request before the SPA fallback. | Build the service worker and verify a generated Express server returns 404/plain text for a nonexistent hashed JS path. |
| Paid actions do not preserve plan intent | Landing Seeker and Oracle actions invoke same-tab OAuth with `/pricing?tier=seeker` or `/pricing?tier=oracle`; Explorer retains the survey-first route. | Inspect OAuth state and the existing return-path regression suite. |
| Abstract discovery copy and empty raw HTML | Title, descriptions, social cards, and a static crawler landing block use plain-language habit, identity, goals, and optional AI guidance language. React hides the fallback after mount. | Confirm raw production HTML includes copy and that the mounted browser hides the fallback. |
| Social preview image fails external fetch | The original 1200×630 JPEG was re-uploaded as `/manus-storage/lifewoven-og-share_f0a81bd1.jpg`; direct public request returns 307 followed by `image/jpeg` 200. | Recheck in an external link-preview service after publication. |
| Sitemap contains image files instead of public pages | Static `client/public/sitemap.xml` lists homepage, pricing, legal pages, and support; `robots.txt` continues to advertise it. | Fetch `/sitemap.xml` from the generated application. |
| Root-domain messaging, GitHub visibility, and owner-controlled identity choices | Not changed in this app workspace. The active project controls `app.lifewoven.click`, not a separate root-domain site or repository visibility policy. | Owner decision outside this code release. |
| Fresh-account onboarding and complete return-path exercise | Not performed by the audit because it stopped before account selection. Existing source tests cover the route and claim safeguards, but a fresh-account owner/browser run remains a separate live check. | Fresh test account, without payment submission. |
