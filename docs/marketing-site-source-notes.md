# Marketing-Site Source Notes

The marketing site is the separately referenced task **“Lifewoven Website Copy, Design, and Style Instructions”** (`Du5gZaxEjEEsVCekT1vhiK`) and is published at `https://www.lifewoven.click`.

The referenced task contains a marketing builder brief, a site-update builder prompt, pricing/store instructions, and individual section source artifacts such as `PathwaysSection.tsx`, `SixDimensionsSection.tsx`, `LibrarySection.tsx`, `VaultSection.tsx`, `AppPreviewSection.tsx`, and `marketing-update-lifewoven.html`.

The task replay explicitly identifies its scope as **lifewoven.click only**, distinct from `app.lifewoven.click`. Its June builder brief directed the older public nomenclature “Capacity Audit,” while the current app standard is “Load-Bearing Survey”; the launch reconciliation must apply the user’s newer request for consistent current funnel language rather than blindly preserve the older brief.

The referenced-task artifacts are readable through the supplied session reference, but the active Lifewoven app workspace at `/home/ubuntu/lifeos` does not contain the marketing-site project source. Cross-site edits require activating or providing the marketing-site workspace/repository in addition to the app project.

## Corrected Repository Deployment Status

On 2026-08-21, the verified marketing reconciliation was cherry-picked and pushed to `dwoodyd/lifewovenwebsite1` main as commit `e134601` (`Reconcile launch pricing policies and funnel copy`). A cache-busted visit to `https://lifewoven.click/?cb=e134601` still served the prior production bundle: it showed “Capacity Audit,” “Annual save ~47%,” and the visible honeypot label. The deployed site has not yet switched to the corrected repository/branch. Public-funnel verification must wait for the marketing hosting configuration to point to `lifewovenwebsite1` main or deploy from that source.

Later on 2026-08-21, the marketing project synchronized `lifewovenwebsite1` main and published checkpoint `0e430d44`. A cache-busted live recheck confirmed the corrected public bundle: the homepage uses “Load-Bearing Survey,” the annual toggle states “save 17–18% vs monthly,” Seeker is $9/month, the honeypot has no visible label or field, and desktop navigation collapses before wrapping. The deployed Terms and Privacy policies now agree with the app on adult access, seven-day initial refunds, founding-rate continuity, consent-based AI processing, optional personalization responses, and Manus Analytics.
