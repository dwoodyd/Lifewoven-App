# Lifewoven Scale and Launch-Readiness Assessment

**Date:** 2026-09-21  
**Scope:** The Lifewoven application at `app.lifewoven.click`, its configured TiDB Cloud database, and the application source at checkpoint `5a624db5`, with an additive index migration prepared and applied to the connected database.

## Bottom line

Lifewoven is **not load-tested**. There is no measured concurrent-user ceiling, requests-per-second result, or failure-point result in the repository or attached validation artifacts. The application has useful protections for a modest launch: bounded queries, API and authentication rate limits, a Redis-backed shared HTTP limiter when the configured Redis connection is available, and centralized AI metering. I also added and applied seven composite indexes for the current dashboard hot path. Those indexes remove the confirmed filter-and-sort plans for the key ordered and filtered reads.

The remaining launch risks are operational rather than a known functional failure. The current project settings did not expose the exact Manus hosting mode or request-concurrency configuration. The database endpoint is TiDB Cloud Serverless/Starter, but the account spending-limit state is not exposed to the app. Redis is configured in this environment, although earlier development logs show connection failures and fallback behavior; the production Redis connection should be checked in deployment logs before a traffic event. No production load or soak test has been run.

## Direct answers

| Question | Measured or source-backed answer | What remains unknown |
|---|---|---|
| **Database tier and connections** | The application connects to `gateway04.us-east-1.prod.aws.tidbcloud.com:4000`, running `8.0.11-TiDB-v8.5.3-serverless`. The connection URL has no pool parameters. Drizzle creates a mysql2 pool; mysql2 defaults to **10 connections per application process** when no `connectionLimit` is supplied. TiDB Cloud Starter permits **400 concurrent database connections**, increasing to **5,000** when a spending limit is set. [1] | The TiDB account’s actual spending-limit state is not visible here. Therefore the authoritative database ceiling is **400 if no spending limit is set; 5,000 if one is set**. The current global connection counters were not returned by this managed SQL interface, so live connection usage was not measured. |
| **Database pooling** | This is a real connection pool, not one new connection per request. The application creates and reuses a process-global Drizzle/mysql2 pool. With the current URL and mysql2 defaults, it is capped at **10 connections per process**. | The deployment’s number of live application processes is not exposed. There is no PgBouncer-like separately managed pool visible from the application. |
| **Hosting concurrency** | Manus documents two possible web-app modes: **Autoscale** uses Cloud Run with 1 vCPU and 512 MB per instance, scaling from 0 to 5 instances; **Reserved** uses one persistent 1 vCPU, 512 MB process with no autoscaling. [2] The live site is fronted by Cloudflare and returns a transparent Manus proxy header. | The active project setting was not exposed in the project UI or source, so I cannot truthfully state which mode is enabled or an exact request-concurrency ceiling. If Autoscale is selected, Manus documents a maximum of **5 instances**, but not a per-instance HTTP concurrency setting. If Reserved is selected, it is one process and can queue under a spike. |
| **Query efficiency** | The dashboard makes seven independent, bounded queries concurrently. It limits check-ins to 7, active habits to 5, journals to 3, unread Oracle insights to 3, active pathways to 3, and survey history to 50. I added indexes on `(userId, createdAt)` for check-ins, journals, and survey results; `(userId, isActive)` for habits; `(userId, completedAt)` for logs; `(userId, isRead, createdAt)` for Oracle insights; and `(userId, status)` for pathways. TiDB `EXPLAIN` now selects the new composite indexes, with ordered index scans for check-ins, journals, and Oracle insights. | No real user-scale dataset exists yet: the hot tables currently contain 0–3 rows. Therefore there is no measured slowest query. The source’s likely busiest read is `profile.dashboard`, because one page load fans out to seven queries. The source’s most expensive request class is AI generation, not a database list query. |
| **N+1 queries** | The dashboard itself does not show an N+1 pattern: it issues a fixed seven-query `Promise.all`. The goals list fetches all milestones for a user in one extra query and groups them in memory, not one query per goal. | This was a source review, not a production trace across all screens. No database query telemetry or distributed tracing is configured in the repository. |
| **Rate limiting and abuse** | `/api/oauth` and `/api/auth` are limited to **5 requests per IP per 15 minutes**. `/api/trpc`, transcription, and PayPal endpoints are limited to **200 requests per IP per minute**. The app detects `REDIS_URL` and uses Redis for shared HTTP limits when the connection succeeds; otherwise limits are per-process memory only. User-facing Weave AI requests have a per-user **10 calls per minute** in-memory limiter. All rich LLM calls go through the metered ledger with a default **4 rich calls per user per local day**, bounded model/output tiers, and recorded usage. | Provider-side account-creation, bot detection, WAF, and CAPTCHA controls are not visible from this application. The 10/min LLM limiter is not shared across replicas. A distributed botnet can evade IP limits, and public survey-claim creation is governed by the general API IP limit rather than a dedicated stricter limiter. |
| **Tested load** | **None found.** The repository contains no k6, Artillery, autocannon, benchmark, concurrency, or documented load-test result. The validation artifacts are build, regression, browser, Lighthouse, and endpoint checks, not load tests. | The highest proven concurrent-user count and requests-per-second value are **unknown**. No component has been pushed until failure, so what breaks first is also **unknown**. |

## Query change applied now

The database initially used single-column `userId` indexes for the dashboard’s ordered and filtered reads. TiDB planned the query as a `userId` range scan followed by filtering and/or a `TopN` sort. The following additive migration was generated and applied to the connected database:

| Table | Applied index | Dashboard access pattern |
|---|---|---|
| `check_ins` | `(userId, createdAt)` | Recent check-ins, newest first |
| `journal_entries` | `(userId, createdAt)` | Recent journal entries, newest first |
| `habits` | `(userId, isActive)` | Active habits |
| `habit_logs` | `(userId, completedAt)` | Today’s habit activity |
| `oracle_insights` | `(userId, isRead, createdAt)` | Latest unread Oracle insights |
| `user_pathways` | `(userId, status)` | Active pathways |
| `audit_results` | `(userId, createdAt)` | Survey history, newest first |

After the migration, `EXPLAIN` selected the relevant composites. The ordered queries use `keep order:true, desc`, which removes the prior sort step. I also made the unread Oracle query explicitly sort by newest before applying its limit, preventing an arbitrary three-row slice.

The scale review also found four legacy direct model calls in the journal and Oracle routes. They were converted to `invokeMeteredLLM`, joining the existing centralized model boundary. Identity sentence generation was converted as well. Every application-facing model call now has a named feature, a bounded economical or rich tier, and usage-ledger recording; rich calls share the server-enforced daily cap.

> **Migration note:** This project has historically applied schema migrations through the platform SQL executor. The additive index SQL was applied through that same path and its index presence was verified directly in TiDB. The existing Drizzle migration ledger records only the initial baseline even though later schema migrations are already present, so this report does not treat the ledger as an authoritative deployment-history source.

## Launch implications

The immediate database posture is adequate for a small spike because data volume is currently tiny, reads are tenant-scoped and bounded, and the dashboard’s confirmed index gaps have been removed. The connection pool also prevents one connection per request. This should **not** be interpreted as a concurrency guarantee.

The most important pre-spike operations are to confirm the active Manus hosting mode, confirm whether the TiDB Starter instance has a spending limit, confirm that Redis is healthy in the deployed runtime, and run a staged load test against a non-payment authenticated path before directing paid traffic. A realistic first test should include a cold-start sample, authenticated dashboard traffic, a representative check-in write, and separately rate-limited Oracle traffic. It must avoid live payment submission and avoid using real customer records.

## Validation

The new index migration contains only additive `CREATE INDEX` statements. The connected database reports all seven indexes present. Focused scale-readiness regression coverage passed, TypeScript passed, the complete Vitest suite passed, the production build passed, the production dependency audit found no high-severity production issues, and `git diff --check` passed. The build still emits an existing large-chunk warning for the 2.84 MB main client bundle; this is a performance consideration, not a test failure.

## References

[1]: https://docs.pingcap.com/tidbcloud/serverless-limitations/ "Limitations and Quotas of TiDB Cloud Starter and Essential"
[2]: https://manus.im/docs/website-builder/publishing "Publishing"
