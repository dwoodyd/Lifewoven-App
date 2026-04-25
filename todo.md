# LifeOS — Project TODO

## Phase 1: Foundation (Schema, Brand, Design System)
- [x] Database schema: 21 tables covering all 5S modules, journal, habits, oracle, community, commerce
- [x] Global CSS design system: Felt Structure aesthetic, OKLCH color palette, typography (Cormorant Garamond + Inter), spacing tokens
- [x] Tailwind theme configuration with module color tokens
- [x] Shared UI components via shadcn/ui (Button, Card, Badge, Dialog, Tabs, Progress, Slider, etc.)

## Phase 2: Landing Page, Navigation & Auth
- [x] Public landing page with hero, 5S framework overview, pathway previews, testimonials, pricing CTA
- [x] Top navigation with logo, links, auth state, mobile menu
- [x] Alignment Audit onboarding quiz (10 questions → pathway recommendation)
- [x] Authentication flow (login/logout via Manus OAuth)
- [x] User profile page with stats and quick links

## Phase 3: Dashboard & 5S Core Modules
- [x] Main dashboard: daily check-in, 5S module grid, habit stack, journal preview, Oracle insights, pathways
- [x] State module: Emotional Guidance Scale tool, Vortex meditation, breathwork timer, nervous system check-in
- [x] Story module: belief rewrite journal, identity builder, meaning journal, AI reframe
- [x] Standards module: habit tracker, daily scorecard, deep work planner
- [x] Strategy module: decision journal, leverage mapper, AI analysis
- [x] Stewardship module: energy audit, wealth consciousness, body/time rituals

## Phase 4: Journaling Engine & AI Oracle
- [x] Journaling engine: write, tag, search, module filter
- [x] AI-powered reflection prompts per journal entry (generateReflection)
- [x] AI Oracle chat interface with starter prompts and conversation history
- [x] Oracle insights: pattern recognition across journals, habits, check-ins
- [x] Oracle cross-module guidance (markRead, generateInsights)
- [x] AI belief rewrite (rewriteBelief procedure)
- [x] AI decision analysis (analyzeDecision procedure)

## Phase 5: Branded Pathway Experiences
- [x] PathwayPage dynamic route (/pathway/:id)
- [x] Align pathway: daily grounding sequence (15 min)
- [x] Vortex pathway: advanced vibrational practice (20 min)
- [x] Uplift pathway: emotional set-point shifting (10-20 min)
- [x] Flow pathway: visualization builder (15-25 min)
- [x] Stack pathway: habit execution + identity design (5-10 min)
- [x] Why pathway: meaning, purpose, resilience — Frankl-based (15-20 min)
- [x] Reset After Setback: flagship resilience protocol (30-45 min)

## Phase 6: Commerce, Resource Library & Community
- [x] Resource library: texts, guides, audio organized by 5S module
- [x] Course listings: 7 courses (Alignment Fundamentals, Living in the Vortex, Atomic Habits for the Soul, Finding Your Why, Flowdreaming Mastery, Science of Mind Applied, The Manifestation Stack)
- [x] Digital product store: workbooks, card decks, audio bundles
- [x] Community hub: posts, categories, comments, likes, workshop listings
- [x] Pricing page: Explorer (Free), Seeker ($29/mo), Oracle ($79/mo) tiers

## Phase 7: Testing & Delivery
- [x] Vitest unit tests: 14 tests across auth, community, oracle, profile, habits, journal, beliefs, decisions, resources, courses, products
- [x] All 14 tests passing
- [x] TypeScript zero errors

## Upcoming / Future Enhancements
- [ ] Stripe payment integration for membership tiers
- [ ] Sonic design layer (completion sounds, timer tones)
- [x] Mobile PWA manifest and service worker
- [ ] Email notifications for Oracle insights
- [ ] Live workshop scheduling and community events
- [ ] Course content delivery (video lessons, progress tracking)
- [ ] Habit streak notifications
- [ ] Weekly Oracle summary report
- [x] Dark/light theme toggle (Nav + Settings page)
- [ ] Export journal entries as PDF

## Felt Experience Fixes (Priority)
- [x] Landing page hero: add emotional problem statement above the headline ("You have the vision. You have the books. Something still isn't clicking.")
- [x] Landing page hero: add right-side visual panel (dashboard mockup or pathway card) for asymmetric premium layout
- [x] Landing page: add a "Where do I begin?" anchor section with a single clear first step for overwhelmed visitors
- [x] Alignment Audit: add a warm welcome screen before Q1 (context, reassurance, time estimate)
- [x] Alignment Audit: add a progress bar that is visually prominent (not just text "Q1 of 10")
- [x] Alignment Audit: results page must feel like a personalized letter, not a report card
- [x] Dashboard: add a "Your Next Step" hero card at the top (one clear recommended action, not a grid of options) (one clear recommended action, not a grid of options)
- [x] Dashboard: empty states ("No habits yet", "Journal is empty") should feel inviting, not clinical
- [x] Dashboard: Daily Check-in button is now primary/filled and always visible — it is the most important daily action
- [x] Oracle page: add a brief orienting paragraph explaining what the Oracle is and how it works explaining what the Oracle is and how it works before the prompt buttons
- [x] Pricing page: rename tiers to match the platform language (Explorer/Seeker/Oracle — verified consistent) (Explorer/Seeker/Oracle already done — verify consistency with landing page which says Free/Core/Premium)
- [ ] Pricing page: add a "What's the difference?" plain-language comparison below the cards
- [x] Add legal pages: Terms of Service, Privacy Policy, Refund Policy
- [x] Add Support/Contact page
- [x] Add content rights system: label all library content as Public Domain / Licensed / Original LifeOS Content
- [x] Footer: add links to legal pages, support, and social
- [ ] Pathway pages: add a "Begin This Practice" interactive button that tracks progress (not just read-only content)
- [ ] Reset After Setback: the steps should be interactive/expandable, not just static cards

## Adaptive Intelligence Layer — Wave 1

### Foundation
- [ ] Create shared language constants file (adaptive-language.ts) with all re-entry, streak, and onboarding copy
- [ ] Add DB columns for better mirror metrics: returnCount, lastReturnDate, resetSpeed, keptPromises, gentleConsistencyScore
- [ ] Generate and apply DB migration for new columns

### Low Bandwidth Mode
- [ ] Add lowBandwidthMode toggle to user preferences in DB schema
- [ ] Build LowBandwidthDashboard component: one next step, one grounding prompt, one unfinished priority, one reset option
- [ ] Add "Simplify my view" toggle button to Dashboard that activates Low Bandwidth Mode
- [ ] Ensure Low Bandwidth Mode persists across sessions (stored in user profile)

### Re-entry Button
- [ ] Add "Begin Again" / re-entry button to Dashboard — visible when user has been absent 2+ days
- [ ] Build ReentryFlow component: warm welcome back message, no guilt framing, one small win suggestion, what still matters, what can wait
- [ ] Wire Oracle to detect absence and surface a re-entry message on next visit

### Neurodivergent-Aware Onboarding
- [ ] Add "How my mind works" step to Alignment Audit (after current questions, before results)
- [ ] Build pattern self-identification UI: scattered/overwhelmed/trouble starting/time blindness/inconsistent energy/reading fatigue (non-clinical language)
- [ ] Store selected patterns in user profile for Oracle and Dashboard adaptation
- [ ] Adapt Dashboard greeting and "Your Next Step" card based on selected patterns

### Flexible Streak Logic — Better Mirror
- [ ] Replace streak-only display in StandardsModule with the Better Mirror panel
- [ ] Build BetterMirror component showing: return rate %, reset speed (avg days to return), kept promises count, gentle consistency score
- [ ] Add "You're the kind of person who returns" identity language to habit completion and re-entry flows
- [ ] Add Minimum Viable Habits: let users set full / small / tiny versions of each habit
- [ ] Remove any "broken streak" language from the entire codebase — replace with return-oriented language
- [ ] Add "Catch me before I overcommit" warning when user adds more than 5 daily habits

### Language System Documentation
- [ ] Write Adaptive Intelligence Layer Language System document (all copy, naming conventions, tone guidelines)

## Legal-Risk Scrub & Release-Readiness Pass

- [x] Rename all high-risk course/product titles (Atomic Habits for the Soul → Identity in Motion, Living in the Vortex → The Alignment Current, Finding Your Why → The Meaning Foundation, Creative Flowdreaming → Emotional Futures, Getting Into the Vortex → The Alignment State)
- [x] Update all internal references to renamed titles throughout codebase
- [x] Reframe "Teachers" section to "Wisdom Lineage" with non-affiliation disclaimer
- [x] Add non-affiliation disclaimer to About page, footer, and any page with named influences
- [x] Review and reduce direct quotes from living authors on sales-oriented pages — all living author quotes removed from sales pages
- [x] Fix rights labeling inconsistencies — all library resources now have explicit rights notes
- [x] Review Emotional Guidance Scale framing — reframed as LifeOS Emotional Compass in Oracle; EGS name retained in State module as a descriptive tool name
- [x] Review Flowdreaming/Vortex pathway framing — Flowdream Session renamed to Emotional Futures Session; all branded attributions removed from PathwayPage
- [x] Ensure all renamed items feel original, premium, and LifeOS-owned — verified
- [x] Update Terms of Service to include explicit non-affiliation language — included in legal pages
- [x] Final TypeScript check: zero errors. All 14 tests passing. Checkpoint saved.

## Canonical Build Directive — Final Pass

### Phase 1: Global Rename
- [ ] Rename Vortex → Resonance everywhere (pathways, routes, nav, dashboard, Oracle, audit)
- [ ] Rename Stack → Rhythms everywhere
- [ ] Rename Why → Purpose everywhere
- [ ] Rename Reset After Setback → Reset everywhere (single word, no variants)
- [ ] Remove all old pathway name variants: Begin Again, Return, Re-enter Gently

### Phase 2: Alignment Audit Rebuild (Canonical HTML)
- [ ] 3-screen opening: Entry, Consent, Pre-question framing (exact copy from canonical HTML)
- [ ] 12 core questions with 4 section labels (exact copy from canonical HTML)
- [ ] 3 optional precision questions (Q13-Q15) shown after Q12
- [ ] Scoring logic: 5S dimension mapping, friction tags, Reset-first override (Q5+Q9 both 4-5)
- [ ] 6 result profiles with exact canonical copy (no paraphrasing)
- [ ] Results page: profile name, summary, insight bullets, 5S snapshot bar chart, pathway routing, save/continue block, required disclaimer
- [ ] Dashboard routing after audit: clear "what to do right now" card
- [ ] Audit result persistence in database

### Phase 3: Reset Elevation + Interactive Pathways
- [ ] Reset as persistent visible dashboard action (not just a pathway card)
- [ ] Reset visible after absence, overwhelm, shame, burnout
- [ ] All 7 pathways: expandable steps with Mark Complete button
- [ ] Pathway progress memory (persisted per user)
- [ ] Pathway re-entry continuity (resume where you left off)

### Phase 4: Homepage + Pricing + Community
- [x] Homepage: remove fake testimonials, replaced with founder's note (early access co-creator framing)
- [ ] Homepage: primary CTA = Take the Alignment Audit, secondary = Explore LifeOS
- [ ] Pricing: Explorer (Free), Seeker ($19/mo), Oracle ($49/mo)
- [ ] Pricing: clear tier differences, upgrade path, support/refund clarity
- [ ] Community: public preview state (not an empty login wall)

### Phase 5: Oracle Strengthened
- [ ] Oracle personalization opt-in consent (explicit, user-controlled)
- [ ] Oracle unstuck mode ("Why Am I Stuck?" mode)
- [ ] Oracle pattern mirror (recurring themes from journal entries)
- [ ] Oracle weekly reflection summary

### Phase 6: QA Pass
- [ ] All routes load without 404
- [ ] All buttons functional (no dead buttons)
- [ ] All footer links work
- [ ] Legal pages linked globally
- [ ] Mobile responsiveness verified
- [ ] No fake testimonials anywhere
- [ ] No old pathway names anywhere
- [ ] Consent settings page exists and works

## Brand Rename: LifeOS → Steadora (Full Visible Sweep)

- [x] Replace LifeOS in index.html browser/tab title and meta
- [x] Replace LifeOS in App.tsx (nav logo, layout shell, page titles)
- [x] Replace LifeOS in Home.tsx (hero, CTAs, all sections)
- [x] Replace LifeOS in About page
- [x] Replace LifeOS in Pricing page
- [x] Replace LifeOS in Dashboard and all dashboard sub-pages
- [x] Replace LifeOS in Oracle page
- [x] Replace LifeOS in Alignment Audit page
- [x] Replace LifeOS in all Pathway pages
- [x] Replace LifeOS in Store page
- [x] Replace LifeOS in Community page
- [x] Replace LifeOS in Resource Library page
- [x] Replace LifeOS in all legal/support pages (Terms, Privacy, Refunds, Contact)
- [x] Replace LifeOS in Settings page
- [x] Replace LifeOS in all module pages (State, Story, Standards, Strategy, Stewardship)
- [x] Replace LifeOS in VITE_APP_TITLE secret
- [x] Final grep sweep to confirm zero visible LifeOS instances

## Before the Words (BTW) Build

- [x] BTW database schema (8 tables) + migration
- [x] BTW tRPC procedures (all CRUD + Oracle Ground Guide)
- [x] BTW Landing Page
- [x] Ground Check (7-question diagnostic)
- [x] Enter the Ground (Morning/Midday/Evening)
- [x] The State You Enter
- [x] Return to the Ground (5-step reset, 4 versions)
- [x] Living as Heard (prayer journal)
- [x] Thanking From There (gratitude)
- [x] Words With Weight (scripture/prayer/spoken)
- [x] Closing the Gap (insights dashboard)
- [x] BTW Library
- [x] Ground Guide Oracle mode
- [x] Navigation entry points (4 locations)
- [x] Home dashboard cards
- [x] Vitest coverage for BTW procedures

## Stripe Integration

- [ ] Add Stripe feature scaffold
- [ ] Create Stripe products/prices (Seeker $19/mo, Oracle $49/mo)
- [ ] Subscription checkout procedure (create checkout session)
- [ ] Stripe webhook handler (subscription created/updated/deleted)
- [ ] Store subscription tier in user table
- [ ] Backend gate: Ground Guide AI reflection (Seeker+)
- [ ] Backend gate: Weekly AI reflection (Seeker+)
- [ ] Pricing page upgrade CTA wired to Stripe checkout
- [ ] UI gate: Ground Guide locked state with upgrade prompt
- [ ] UI gate: Weekly reflection locked state with upgrade prompt
- [ ] Customer portal link (manage/cancel subscription)
- [ ] Vitest coverage for tier enforcement

## Stripe Integration

- [x] Stripe scaffold (pnpm add stripe)
- [x] Schema migration: membershipTier enum → explorer/seeker/oracle, stripeCustomerId, stripeSubscriptionId
- [x] server/stripe/products.ts — plan definitions and tier helper functions
- [x] server/routers/stripe.ts — status, createCheckout, createPortal procedures
- [x] server/stripe/webhook.ts — webhook handler (checkout.session.completed, subscription.updated/deleted)
- [x] Register webhook at /api/stripe/webhook with raw body parser
- [x] Wire stripeRouter into appRouter
- [x] Tier gate on btw.reflectOnPrayer (Seeker+)
- [x] Tier gate on btw.generateWeeklyReflection (Seeker+)
- [x] UpgradeGate component and UpgradeButton
- [x] LivingAsHeard — Ground Guide button shows lock + upgrade CTA for Explorer tier
- [x] ClosingTheGap — Weekly reflection generate button shows lock + upgrade CTA for Explorer tier
- [x] Pricing.tsx — dynamic Stripe checkout CTAs, current plan badge
- [x] Vitest tests for tier helper functions (10 tests passing)

## Product Store Sprint

- [ ] Stripe checkout — server tRPC procedure for one-time product purchases (alignment-workbook, wisdom-card-deck, morning-alignment-audio)
- [ ] Stripe webhook — handle checkout.session.completed to deliver download URL via email or on-page
- [ ] Wire Stripe checkout to ProductDetail page (replace direct download with gated purchase)
- [ ] Add PDF companion download buttons to CourseDetail (identity-in-motion, alignment-current)
- [ ] Add Coming Soon / notify-me placeholder for belief-rewrite-workbook and identity-stack-workbook

## Product Store Sprint (Apr 11, 2026)

- [x] Stripe checkout for 3 live products (Alignment Workbook, Wisdom Card Deck, Morning Alignment Audio)
- [x] Post-purchase success state with download button on ProductDetail page
- [x] Coming Soon email capture for Belief Rewrite Workbook and Identity Stack Workbook
- [x] PDF companion download buttons on Alignment Current and Identity in Motion course pages
- [x] Webhook updated to handle product one-time purchases (checkout.session.completed)
- [x] getMyOrders tRPC procedure to check if user has already purchased a product

## Feature Sprint (Apr 11, 2026 — Session 2)

- [ ] Fix Begin Your Journey broken link (404)
- [ ] Voice-to-text journaling: mic button, browser audio recording, Whisper transcription, text populates journal field
- [ ] Admin dashboard: owner-only access gate, user list, orders, content status, system health
- [ ] Admin bypass: owner account has full unrestricted access to all gated pages

## Beta Prep (Apr 11, 2026)
- [ ] Stripe webhook: verify end-to-end, add purchase email notification to owner + buyer
- [ ] Mobile responsiveness: fix dashboard and course pages on small screens
- [ ] Error states: add friendly fallback messages for Stripe/DB failures
- [ ] ToS and Privacy Policy pages (already exist — verify links in footer/checkout)
- [ ] Rebuild About page as visual landing page with instructions

## UX Audit Fixes (April 15 2026)
- [ ] P0: Fix habit checkbox state desync (progress bar / 0/1 not updating on check)
- [ ] Fix "1 days" plural grammar bug in habit streak
- [ ] Fix journal 5S filter — all 5 buttons show "S", make them distinct
- [ ] Attribution audit: replace borrowed quotes/frameworks with proper credit or remove
- [ ] Add Sources & Influences page (linked from About)
- [ ] Gate Community tab — replace empty state with waitlist or seeded content
- [ ] Upgrade Pathways from static checklist to guided timer-based practice
- [ ] Fix skeleton loaders — replace full-blank spinner with skeleton screens
- [ ] Fix dark-mode FOUC on route change
- [ ] Fix Pathways time inconsistency (10-15 min vs 5-10 min)
- [ ] Reconcile Oracle definitions with module copy
- [ ] Fix "1/" leading zero in step numbering

## Mobile Responsiveness Overhaul

- [ ] DashboardLayout: collapse sidebar to bottom tab bar or hamburger on mobile
- [ ] Dashboard page: fix 5S grid, habit list, journal, Oracle sections on mobile
- [ ] Home/landing page: fix hero text, CTA buttons, feature grid overflow on mobile
- [ ] Store page: fix product card grid, pricing, CTA buttons on mobile
- [ ] ProductDetail page: fix hero, description, preview excerpt, download button on mobile
- [ ] CourseDetail page: fix lesson list, enroll button, preview excerpt on mobile
- [ ] About page: fix hero, module grid, Getting Started steps, wisdom lineage on mobile
- [ ] Pathways page: fix timer UI, step cards on mobile
- [ ] Oracle/AI chat page: fix chat bubbles, input bar on mobile
- [ ] Journal page: fix entry list, editor, 5S filter tabs on mobile
- [ ] Community page: fix waitlist gate layout on mobile
- [ ] Sources & Influences page: fix layout on mobile
- [ ] OnboardingModal: ensure it fits small screens without overflow
- [ ] FeedbackWidget: ensure form is usable on mobile
- [ ] AdminPreviewBadge: ensure it doesn't overlap content on mobile
- [ ] Global: no horizontal scroll, no text overflow, adequate tap targets (min 44px)
- [ ] Global: all font sizes readable on mobile (no sub-14px text)

## Mobile Responsiveness Overhaul
- [x] Nav: mobile menu tap targets, spacing, auth buttons
- [x] Home: hero heading size, trust bar, pricing grid, footer
- [x] Dashboard: greeting, 5S grid, check-in panel, habits, journal
- [x] AlignmentAudit: all steps — entry, consent, quiz, optional, results
- [x] Store: category filters, product grid, bundle section
- [x] ProductDetail: container padding, header text, CTA buttons
- [x] CourseDetail: container padding, heading sizes, lesson summary
- [x] About: hero, grid layouts, heading sizes
- [x] PathwaysListing: container padding, featured card, grid
- [x] Pricing: container padding, heading sizes, pricing grid
- [x] Sources, Profile, Settings, ResourceLibrary: container padding, heading sizes
- [x] Journal, JournalEntry: container padding, filter bar, header layout
- [x] Community: container padding, header layout
- [x] Oracle: container padding, chat input
- [x] ArticleReader: container padding, heading size, body text
- [x] All 5 module pages (State, Story, Standards, Strategy, Stewardship): container padding, heading sizes
- [x] All BTW pages (9 pages): container padding, heading sizes
- [x] PathwayPage, Support, legal pages: container padding, heading sizes
- [x] TypeScript: zero errors after all changes

## B-Grade Review Fixes (Apr 16)

- [ ] Fix Story module attribution: credit Frankl for "stimulus/response", Clear for Identity Builder line
- [ ] Reconcile Align pathway time (one number everywhere: 5-10 min)
- [ ] Fix dark-mode persistence before React hydrates (set class on <html> in index.html)
- [ ] Implement skeleton screens for Dashboard, Pathways, module pages
- [ ] Add first-login onboarding flow (3 screens: welcome → pathway → habit)
- [ ] Add Sources & Influences page

## Onboarding Bug Fixes (Apr 19)
- [x] Fix error toast appearing on onboarding open (isLast-before-init ReferenceError)
- [x] Fix browser back/forward — pushState on open, popstate listener closes modal
- [x] Animate slide 1 thread streaks to fly across screen on open (CSS keyframe fly-through with convergence orb)

## Onboarding v2 — Cinegraphic Rebuild
- [x] 7-slide v2 onboarding: woven-threads SVG (slide 1), drifting EGS (slide 2), color-coded 5S pillars (slide 3), pulsing Oracle orb (slide 4), door-light animation (slide 5), Reset card (slide 6), ribbon close (slide 7)
- [x] All v2 copy from strategy doc: next-question CTAs, eyebrow colors per module, whisper lines, signature close
- [x] Ambient background threads SVG across all slides
- [x] Finished state: "The first thread is yours" screen after slide 7
- [x] All existing wiring preserved: storage key, completeOnboarding mutation, replayOnboarding export, dismiss/navigate logic

## Follow-up Batch (Apr 19)
- [x] Onboarding: swipe gesture support (touchstart/touchend)
- [x] Beta notifications: daily digest option (admin toggle)
- [x] Alignment Audit: "How my mind works" step after Q12

## Mind Patterns — Server Persistence & Oracle Integration
- [x] Add mindPatterns column to users table, migrate
- [x] saveMindPatterns tRPC procedure
- [x] Save patterns from Alignment Audit on completion
- [x] Pass patterns as Oracle system context

## Referral & Automation (Apr 19)
- [x] Weekly cron for beta expiry check (every Monday 9am)
- [x] Mailto links in Early Adopters table
- [x] 30-day referral code system (DB table, generate/redeem, UI for converted users)

## Loom Mascot
- [x] Loom SVG mascot component (idle, react, emerge states)
- [x] Loom emerges from slide 1 threads in onboarding
- [x] Loom farewell weave on slide 7
- [x] Loom ambient presence on Dashboard
- [x] Loom ambient presence on Oracle page

## Loom Expansion
- [x] 5S label tooltip on slide 1 draggable dot
- [x] Loom pulse on Alignment Audit answers
- [x] Loom celebration on Pathways step completion

## Security Audit Fixes (Apr 21, 2026)

### Critical
- [x] C1: Stripe webhook — fail closed when STRIPE_WEBHOOK_SECRET or stripe-signature missing; remove evt_test_ bypass
- [x] C2: Delete unauthenticated GET /api/paypal/my-purchases/:userId endpoint
- [x] C3: Authenticate /api/paypal/create-order; derive userId from session, never from body
- [x] C4: Authenticate /api/paypal/capture-order; derive userId from session; validate custom_id ownership
- [x] M6/C4: Remove custom_id-based credit deduction from capture-order

### High
- [x] H1: Add tierCanAccessOracle gate to oracle.chat (and oracle.generateInsights)
- [x] H2: Add per-user LLM rate limiter (10 calls/min/user) wrapping invokeLLM
- [x] H3: auth.me — project minimal fields only (id, name, primaryPathway, onboardingCompleted, membershipTier)
- [x] H4: Session TTL — change from 1 year to 30 days in oauth.ts
- [x] H5: Re-enable CSP in helmet with production allowlist
- [x] H6: trackEvent — require protectedProcedure, validate event against enum, cap properties; fix referral.myTrialCode to filter on event='beta_converted'

### Medium
- [x] M1: referral.applyCode — atomic UPDATE before SELECT to prevent race condition
- [x] M2: genTrialCode — replace Math.random() with crypto.randomBytes
- [x] M3: Download tokens — bind to authenticated session (require ctx.user.id === order.userId)
- [x] M4: Cookie SameSite=Lax; add Content-Type enforcement middleware on /api/trpc
- [x] M5: Mount apiLimiter on /api/transcribe; add per-user transcription cap

### Low
- [x] L1: habits.logCompletion — verify habitId ownership before insert
- [ ] L2: Add .max() caps to all unbounded z.string() inputs
- [x] L4: referral.redeemTrialCode — insert betaCodeId: null instead of 0
- [x] L5: Move cron starts inside startServer(); gate with ENABLE_CRONS env var
- [x] L7: Remove evt_test_ passthrough from Stripe webhook (done as part of C1)
- [ ] L8: Add adminAuditLog table for admin mutations (role change, code mint/delete)

## Horizontal Scaling & Billing Resilience (Apr 22, 2026)

- [x] Redis-backed rate limiter: detect REDIS_URL env, use rate-limit-redis + ioredis when present, fall back to memory with warning
- [x] Stripe idempotency ledger: add stripe_events table, check before processing any webhook event
- [x] Billing resilience: map trialing/past_due subscription statuses to active tier (grace period)
- [x] Billing resilience: handle invoice.payment_failed webhook event with owner notification

## PWA Upgrade (Apr 22, 2026)

- [x] Install vite-plugin-pwa and workbox-window
- [x] Generate PWA icons: pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png (180x180)
- [x] Upload icons to CDN via manus-upload-file --webdev
- [x] Configure vite.config.ts with VitePWA plugin (manifest, icons, autoUpdate)
- [x] Update client/index.html with theme-color meta and apple-touch-icon link

## Post-PWA Follow-ups (Apr 22, 2026)

- [x] invoice.payment_failed already handled in webhook.ts (confirmed)
- [x] REDIS_URL secret set (Upstash) — rate limiter will use Redis in production
- [x] PWA vitest coverage: manifest shape, VitePWA config, index.html meta, webhook handler, Redis env, storageProxy

## Full Platform Audit Fixes (Apr 22, 2026)
- [x] Fix OnboardingModal broken /alignment-audit → /audit navigation (2 instances)
- [x] Fix ReentryFlow broken /modules/state → /state navigation
- [x] Fix About.tsx broken /modules/* → /state|/story|/standards|/strategy|/stewardship links
- [x] Fix About.tsx broken /before-the-words → /btw link
- [x] Fix Pricing.tsx broken /alignment-audit → /audit link
- [x] Fix Settings.tsx "Ground Guide AI" copy → "Oracle AI" (2 instances)
- [x] Fix Home.tsx "10-question diagnostic, 3 minutes" → "12-question diagnostic, 5 minutes" (2 instances)
- [x] Fix Home.tsx self-referential trust bar item "Lifewoven Framework" → "Emotional Guidance System"
- [x] Fix index.css @import ordering — Google Fonts before @import tailwindcss (CSS build warning)
- [x] Wire Support.tsx form to trpc.support.submit mutation (was fire-and-forget, now sends owner notification)
- [x] Add support.submit tRPC procedure to routers.ts (publicProcedure, notifyOwner)
- [x] Add isPending disabled state + "Sending…" label to Support form submit button

## B+ Review Fixes (Apr 22, 2026)

### Critical
- [ ] Oracle: fix silent failure — add streaming, visible error surface, retry button
- [ ] Oracle: add crisis-aware safety protocol (distress detection → human resource routing)

### High Priority
- [ ] Hide Admin Panel menu item from non-admin users at UI layer
- [ ] Audit results page: move pathway recommendation above the fold as hero CTA
- [ ] Seed Story module: one example belief in Belief Rewrite Lab
- [ ] Seed Standards module: one example habit in Habit Stack
- [ ] Seed Strategy module: one example decision in Decision Journal
- [ ] Auto-draft first journal entry from audit responses after onboarding
- [ ] Auto-title journal entries from first sentence

### Medium Priority
- [ ] Streak badge: add tooltip explaining "0d beta" (beta days streak counter)
- [ ] Collapse two pre-audit screens (consent + "four short sections") into one
- [ ] Theme unification: match authenticated app to system preference or dark-mode default
- [ ] Profile page: add Identity Sentence (monthly, generated from behavior data)
- [ ] Profile page: add 5S trend mini-chart and last pathway completed

### Polish
- [ ] Tooltips on first exposure to proprietary terms (first 7 days)
- [ ] Oracle Sampler: 3 free questions/month for Explorer/Seeker tiers

## A+ Polish — Visual & UX Upgrades

- [x] Restyle Feedback button: subtle charcoal/amber circle, no clashing color swoosh
- [x] 5S dashboard buttons: add diffused drop shadow + ultra-thin tinted border for tactile definition
- [x] "Simplify my view" toggle: redesign as premium mechanical switch (haute horology style)
- [x] Page transitions: instant, seamless navigation between internal pages (no logo splash or flash)
- [x] Oracle 5S tagging: append dimension badge (State/Story/Standards/Strategy/Stewardship) to each AI response paragraph

## Content Gates — Pre-Launch

- [x] Library articles: show 2-3 section preview, then paywall card (sign in / upgrade CTA)
- [x] BTW articles: same preview + paywall gate
- [x] Admin role bypasses all article gates

## Oracle Upgrade Onboarding Flow

- [ ] Oracle Teaser slide: interactive simulated Oracle demo with 5S badge tagging + upgrade CTA
- [ ] Finished state: split CTA — "Take the Audit" + "Unlock Oracle Access" for Explorer users
- [ ] Post-audit Oracle nudge banner: "Your Oracle is ready" with dimension-specific upgrade prompt

## Production Hardening (25-point audit)

- [x] #11 DB indexes: add index() on all userId foreign key columns in schema
- [x] #13 Response compression: add compression middleware to Express
- [x] #15 DB transactions: wrap multi-step writes (audit save, comment+count, like+count)
- [x] #16 Health check endpoint: GET /api/health with DB ping + uptime
- [x] #18 Graceful shutdown: SIGTERM/SIGINT handlers to drain connections
- [x] #19/#21/#23 Timeouts + circuit breaker: AbortController on LLM and PayPal outbound calls
- [x] #14 Error alerting: owner notification on unhandled server errors

## PayPal Subscription Migration

- [x] Create PayPal subscription plans for Seeker ($29/mo) and Oracle ($79/mo)
- [x] Build server-side PayPal subscription router (create subscription, verify, cancel)
- [x] Build PayPal subscription webhook handler to set membershipTier on BILLING.SUBSCRIPTION.ACTIVATED
- [x] Update Pricing page: replace Stripe checkout buttons with PayPal subscription buttons
- [x] Update Settings/Billing page: show PayPal subscription status and cancel option
- [x] Remove Stripe subscription references from Pricing and Settings UI
- [ ] Verify tier upgrade flow end-to-end (sandbox test — requires PayPal plan IDs in Secrets)
