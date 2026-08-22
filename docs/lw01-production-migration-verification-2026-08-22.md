# LW-01 Production Migration and Claim-Flow Verification

**Date:** August 22, 2026

## Applied migration

Applied `drizzle/0036_silent_frog_thor.sql` to the Lifewoven production database. The migration created `audit_claims` with the UUID primary key, immutable survey payload fields, expiry timestamp, redemption ownership fields, and `idx_audit_claims_expiresAt`.

## Production checks

| Check | Outcome | Evidence |
|---|---|---|
| Schema migration | Passed | `audit_claims` exists with the expected columns and primary key. |
| Expiry index | Passed | `idx_audit_claims_expiresAt` is present on `expiresAt`. |
| Anonymous claim minting | Passed | Production `audit.mintClaim` returned claim `9935e3b8-2df1-474c-8aa5-6b7170a7e1e4` with a 24-hour expiry. |
| OAuth return route | Passed | The production sign-in state preserved `/audit?audit_claim=9935e3b8-2df1-474c-8aa5-6b7170a7e1e4`. |
| Authenticated redemption | Passed | The claim was redeemed by production user ID `1` at `2026-08-22 21:11:58` UTC. |
| Survey persistence | Passed | Exactly one matching `audit_results` record was created for the redeemed claim. |
| Onboarding and pathway | Passed | User ID `1` has `onboardingCompleted=1` and `primaryPathway=reset`. |
| Same-user repeat safety | Passed | Repeating the claim URL left the result count at one and the claim owner unchanged. |
| Other-account protection | Code-path verified | `audit.redeemClaim` returns a conflict when a redeemed claim belongs to another user. A live cross-account attempt was not run to avoid writing or switching a second production identity. |

## Browser-session note

The connected sandbox browser continued to render guest navigation after direct navigation, so its visual state could not be used as the authority for the protected return route. Production database state confirms successful authenticated redemption and completion. The current client code redirects successful redemption to `/dashboard` and invalidates profile/auth queries before navigating.
