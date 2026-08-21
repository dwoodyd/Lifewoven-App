# Pre-Launch Live Findings — 2026-08-21

The live marketing homepage at `https://lifewoven.click` presents the canonical **Load-Bearing Survey** language, the corrected annual-savings label (**17–18% vs monthly**), and the current founding-rate continuity condition. Its visible hero and primary survey CTA render correctly in the reviewed desktop view.

The live app route `https://app.lifewoven.click/signin` still reaches the branded 404 screen rather than the OAuth entry. The app route map therefore needs a `/signin` compatibility alias to `/login`.

The repaired development build was rechecked after implementation. Its `/signin` path now reaches the official Manus OAuth entry rather than the application 404. The authenticated `/audit` entry displayed the returning-member **“Take me into the app”** escape path. The anonymous setup control is conditionally rendered in source for logged-out visitors and is covered by launch-trust regression coverage.
