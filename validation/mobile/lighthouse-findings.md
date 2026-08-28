# Direct mobile Lighthouse findings

The first Lighthouse mobile run against the development preview recorded performance 36, accessibility 95, and best practices 79. The high-impact findings were a 20.2-second LCP, 2.36-second total blocking time, 2.7 seconds of JavaScript execution, a 19.4 MiB transfer estimate, contrast failures, and a back-forward-cache blocker.

Route-level lazy loading reduced the generated initial entry chunk from approximately 3.31 MiB to 424 KiB and reduced the service-worker precache from approximately 4.10 MiB to 1.28 MiB. The second development-preview Lighthouse run recorded performance 35, accessibility 95, and best practices 79. Its LCP fell to 9.47 seconds and FCP to 2.2 seconds, but total blocking time and measured main-thread work were still adversely affected by the non-production preview environment and remaining runtime work. These results are diagnostic; they are not a production acceptance score.

The next remediation targets are the documented color-contrast failure, redundant-image-alt warning, back-forward-cache blocker, asset delivery, and an actual published measurement. The project should not claim the checklist’s full objective-instrumentation completion until it is tested on the production domain and real installed iOS/Android PWAs.
