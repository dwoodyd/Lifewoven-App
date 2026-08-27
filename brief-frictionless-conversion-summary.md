# Lifewoven Frictionless Access and Conversion Timing — Implementation Record

The August 2026 build briefs require a no-code, app-first free-beta entry experience and a conversion journey based on demonstrated value rather than repeated pre-activation prompts. The current Lifewoven implementation uses the existing PayPal subscription architecture; no Paddle integration was introduced.

## Access policy

- A new Explorer receives one 30-day free beta entitlement on first authenticated access. The entitlement is stored in `beta_access`, is protected by the unique `userId` constraint from migration `0038_nebulous_arclight.sql`, and has an explicit `free_beta` acquisition source from migration `0039_wealthy_phil_sheldon.sql`.
- The free window is never silently renewed after expiry. Expired access may be extended only through the intentional beta-code, referral, invitation, or paid membership paths.
- Direct access to a protected beta feature uses the same server-side idempotent entitlement check as normal app bootstrap, avoiding a client-side loading race.
- Active beta is treated as library access in Store, Oracle, The Ground, the resource library, courses, and paid product surfaces. Existing beta codes, referral redemption, founding invitations, and PayPal access remain intact.

## Conversion policy

- Explorer sign-up returns to `/dashboard`; explicit Seeker and Oracle pricing selections retain their existing protected tier-aware return paths.
- Reflective completion and content consumption are tracked as trusted server events. The single post-activation Seeker invitation requires both events and is suppressed for active beta, Seeker, and Oracle users. It can be dismissed locally and is not shown before activation.
- PWA installation prompts are never automatic on first use. They may appear after survey completion, on a second session, or after an intentional Settings action.
- Paid gates use warm, specific “next layer” language, include a clear “Not now” choice, preserve free tools and saved work, and use a tier-specific pricing route.
- The expiry modal is now a dismissible “Keep Going With Your Practice” invitation rather than a hard conversion wall.

## Verification record

- Migrations `0038_nebulous_arclight.sql` and `0039_wealthy_phil_sheldon.sql` were reviewed and applied.
- TypeScript validation, the complete 30-file test suite (233 tests), and the production build passed before the checkpoint for this work.
