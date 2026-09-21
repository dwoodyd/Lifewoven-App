# LifeWoven Security Checklist — Builder Response and Remediation

**Date:** 2026-09-21  
**Application:** Lifewoven (`app.lifewoven.click`)  
**Scope:** Source review and local validation of the LifeWoven application only.

## Conclusion

The attached black-box checklist correctly established that LifeWoven did not expose obvious browser-delivered secrets, served configuration files, debug details, or permissive `Access-Control-Allow-Origin: *` responses. The source review found that the application has a sound baseline of authenticated tRPC procedures, server-derived user IDs, Drizzle query construction, production Helmet headers, body limits, and rate limits. It also found three cross-tenant authorization defects that black-box testing with one account could not prove or disprove.

Those defects have been remediated in the saved security checkpoint. A Library chat request can no longer read or write a session unless the session belongs to the authenticated user and the selected resource. An Oracle conversation ID is now verified against the authenticated user before model work or a database update. The storage proxy now fails closed for unrecognized nested keys, including private product paths, while retaining explicit access for top-level public media and authenticated owner-scoped media.

This report does **not** claim that every production database, storage, or identity setting has been independently tested. It distinguishes source-backed facts from controls that require an owner or a deployed two-account test.

## Builder answers to the five checklist questions

| Question | Source-backed answer | Remaining boundary |
| --- | --- | --- |
| **1. Is database RLS enabled for every user-data table?** | **No database RLS can be claimed.** LifeWoven uses MySQL/TiDB through Drizzle and `mysqlTable`, not a database with PostgreSQL-style row-level security policies. The versioned migrations do not contain RLS policies, grants, or revokes. User isolation is currently enforced by application procedures that derive `userId` from the authenticated session and add owner predicates. | The production database account, network access, grants, and any infrastructure-level restrictions were not available for inspection. The application account should have least privilege, and direct database access must remain restricted. |
| **2. Were secrets ever committed to Git history?** | A non-disclosing detector scan found potential secret-pattern matches in the current reachable tree and historical reachable revisions. Detector matches do not establish that each value is a live secret, but the finding must be treated as a rotation and secure-triage task. The credential-bearing GitHub remote URL was replaced with a credential-free HTTPS URL, and common private key/certificate patterns are now ignored. | The detected values were deliberately not printed, recovered, or validated. An authorized owner must securely identify any live credential, rotate it, and decide whether a coordinated history rewrite is warranted. Removing a value from HEAD alone would not remove it from history. |
| **3. Is CORS restricted to app domains?** | **Yes, in the updated source.** Credentialed production CORS now allows only the three explicit Lifewoven application origins: `app.lifewoven.click`, `lifewovenapp.manus.space`, and `lifeosplatform-krrwopfb.manus.space`. Localhost and the project preview pattern are development-only. An untrusted origin receives no CORS allow-origin or credentials header. | Production deployment still needs its normal post-publish header check. Any newly introduced public application origin must be deliberately added to the allowlist rather than matching a wildcard domain pattern. |
| **4. Are queries parameterized and is user content safely rendered?** | The reviewed database access uses Drizzle query builders and tagged SQL values; no string-built SQL or `sql.raw` use was found in the reviewed server paths. Ordinary React text rendering escapes user content, and the reviewed explicit HTML product sink is sanitized with DOMPurify. | This is not a proof for every future endpoint. Streamdown is used for model-derived text and should later be configured with an explicit no-raw-HTML or strict allowlist policy. The Journal print template should escape `userName` before interpolating it into a `document.write` HTML string. |
| **5. Is every write endpoint schema-validated?** | Zod validation is broadly used across tRPC mutations. The raw Express PayPal create/capture order endpoints were additionally changed to use strict Zod schemas; client identity fields were removed from their request bodies. Checkout return origins are now server-allowlisted. | Not every historical write route has been exhaustively proven through database-backed integration tests. A follow-up should bound remaining long text/array inputs, validate library upload keys and URLs server-side, and add two-user integration tests to CI. |

## Remediated security defects

### Cross-tenant Library chat isolation

`library.chat` previously verified that the selected resource belonged to the caller but did not verify that the submitted `sessionId` belonged to that caller and resource. It then loaded history by session ID alone. The update now loads the session by the conjunction of session ID, authenticated user ID, and selected resource ID before any history is read, any model call is made, or any message is inserted. History, inserts, and session updates all use the verified session and owner/resource predicates.

`library.addHighlight` now also verifies that the parent resource belongs to the caller before creating a highlight.

### Cross-tenant Oracle conversation integrity

A supplied Oracle conversation ID is now resolved by both conversation ID and authenticated user ID before model work begins. If no owned record exists, the request returns `NOT_FOUND`. The final update uses the same paired predicate. This prevents a caller from overwriting another user’s conversation with an arbitrary ID.

### Parent-child record ownership

Character book notes, book-linked journal entries, and book attachments now verify that a referenced book belongs to the authenticated user before creating dependent records. This prevents foreign-parent association pollution even where later reads were already user-scoped.

### Storage presigning policy

The `/manus-storage/*` proxy now uses explicit access classification. A single top-level media key is public. Owner-scoped paths such as `voice/<numeric-user-id>/...` require a matching authenticated user. All other nested keys are denied by default. This blocks accidental presigning of `private/products/...` and similar unrecognized paths through a route intended for public media and owner uploads.

### CORS and checkout request hardening

Credentialed CORS was narrowed from broad Manus/Lifewoven wildcard patterns to an exact production-origin set. The PayPal raw Express endpoints now parse strict request bodies with Zod, and the PayPal button no longer sends a client `userId`. The product checkout router now accepts return/cancel origins only from an explicit Lifewoven allowlist or documented development origins.

## Validation completed

The focused authorization, payment, and storage regression set passed with **49 tests across 5 files**. The complete application suite passed with **37 test files and 274 tests**. TypeScript passed, the production PWA build completed, the production dependency audit reported no known vulnerabilities, and `git diff --check` passed.

Local HTTP checks confirmed that an allowed application origin receives exact credentialed CORS headers, an untrusted origin receives neither allow-origin nor credentials headers, an unauthenticated owner-media request returns `401`, and an unrecognized private-product storage path returns `404`. The missing JavaScript asset guard remains an explicit `404 text/plain` response.

> These checks validate the source and local development server. They do not substitute for a post-deploy two-account authorization exercise or an owner review of production database and storage-provider controls.

## Required production and owner follow-up

A real **two-account** production test remains necessary. It should use an account A resource/session/conversation ID in account B’s Library and Oracle requests, and confirm that account B receives no history, no response derived from A’s data, and no mutation of A’s record. This must be run only in an authorized test environment with disposable data.

The production database should be reviewed for least-privilege application credentials, restricted network access, backups, and direct-access controls. Because MySQL/TiDB RLS is not demonstrated here, the practical tenancy boundary remains the application’s authenticated owner predicates plus deployment access restrictions.

Potential Git secret-pattern matches require an authorized secure triage outside this report. Any live key must be rotated before any history rewrite is considered. CI should add a secret scanner and reject credential-bearing remote URLs.

Two P2 rendering items remain: configure Streamdown explicitly for untrusted/model-derived content without raw HTML or unrestricted external resources, and escape every dynamic value inserted into Journal or article print HTML. Upload handling should later validate actual file bytes and a closed MIME allowlist rather than relying only on client-declared MIME types.

## Scope note for the three-app checklist

Only the LifeWoven repository and project workspace were available in this execution environment. No Continuary or Inner Wake source workspace was present, so this report makes no builder confirmation for those applications. Their black-box findings should be remediated in their own repositories or hosting configurations.

## References

[1]: /home/ubuntu/upload/SecurityChecklist—Three-AppTest.md "Security Checklist — Three-App Test"
[2]: /home/ubuntu/lifeos/server/routers/library.ts "LifeWoven Library router"
[3]: /home/ubuntu/lifeos/server/routers.ts "LifeWoven application routers"
[4]: /home/ubuntu/lifeos/server/_core/storageProxy.ts "LifeWoven storage proxy"
[5]: /home/ubuntu/lifeos/server/_core/index.ts "LifeWoven server entrypoint and CORS policy"
[6]: /home/ubuntu/lifeos/server/tenant-isolation.security.test.ts "Tenant isolation security regressions"
