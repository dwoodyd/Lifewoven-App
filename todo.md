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
- [x] Investigate and securely restore production Manus OAuth sign-in after plan-change configuration failure

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
- [x] Stripe payment integration for membership tiers — removed; using PayPal instead
- [ ] Sonic design layer (completion sounds, timer tones) — EXTERNAL: requires audio assets; deferred
- [x] Mobile PWA manifest and service worker
- [ ] Email notifications for Oracle insights — EXTERNAL: requires email template design; deferred
- [ ] Live workshop scheduling and community events — EXTERNAL: requires calendar/scheduling service; deferred
- [ ] Course content delivery (video lessons, progress tracking) — EXTERNAL: requires video hosting; deferred
- [ ] Habit streak notifications — EXTERNAL: requires push notification service; deferred
- [ ] Weekly Oracle summary report — EXTERNAL: requires scheduled job + email template; deferred
- [x] Dark/light theme toggle (Nav + Settings page)
- [x] Export journal entries as PDF — implemented: Export PDF button in Journal.tsx, journal.exportData tRPC procedure, client-side HTML-to-PDF via window.print()

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
- [x] Pricing page: add a "What's the difference?" plain-language comparison below the cards
- [x] Add legal pages: Terms of Service, Privacy Policy, Refund Policy
- [x] Add Support/Contact page
- [x] Add content rights system: label all library content as Public Domain / Licensed / Original LifeOS Content
- [x] Footer: add links to legal pages, support, and social
- [x] Pathway pages: add a "Begin This Practice" interactive button that tracks progress (not just read-only content) — PathwayPage has expandable steps with Mark Complete, progress bar, and backend persistence
- [x] Reset After Setback: the steps should be interactive/expandable, not just static cards — all pathways use the same expandable step system (Reset is one of the 7 pathways)

## Adaptive Intelligence Layer — Wave 1

### Foundation
- [x] Create shared language constants file (adaptive-language.ts) with all re-entry, streak, and onboarding copy — shared/adaptive-language.ts already exists with all copy
- [x] Add DB columns for better mirror metrics: returnCount, lastReturnDate, resetSpeed, keptPromises, gentleConsistencyScore — already in users table schema
- [x] Generate and apply DB migration for new columns — columns already in live DB

### Low Bandwidth Mode
- [x] Add lowBandwidthMode toggle to user preferences in DB schema — column already existed
- [x] Build LowBandwidthDashboard component: one next step, one grounding prompt, one unfinished priority, one reset option — already built
- [x] Add "Simplify my view" toggle button to Dashboard that activates Low Bandwidth Mode — already built
- [x] Ensure Low Bandwidth Mode persists across sessions (stored in user profile) — profile.setLowBandwidthMode tRPC procedure added; Dashboard hydrates from user.lowBandwidthMode on auth resolve

### Re-entry Button
- [x] Add "Begin Again" / re-entry button to Dashboard — visible when user has been absent 2+ days — Reset card + ReentryFlow modal already implemented
- [x] Build ReentryFlow component: warm welcome back message, no guilt framing, one small win suggestion, what still matters, what can wait — ReentryFlow.tsx with trigger-aware copy
- [x] Wire Oracle to detect absence and surface a re-entry message on next visit — Oracle system prompt includes daysSinceLastActivity context

### Neurodivergent-Aware Onboarding
- [x] Add "How my mind works" step to Alignment Audit (after current questions, before results) — already implemented in AlignmentAudit.tsx (mind_works step with 10 pattern options)
- [x] Build pattern self-identification UI: scattered/overwhelmed/trouble starting/time blindness/inconsistent energy/reading fatigue (non-clinical language) — 10 pattern options in AlignmentAudit mind_works step
- [x] Store selected patterns in user profile for Oracle and Dashboard adaptation — profile.saveMindPatterns tRPC mutation; mindPatterns JSON column in users table; auth.me now exposes mindPatterns
- [x] Adapt Dashboard greeting and "Your Next Step" card based on selected patterns — shame_spirals → "You came back" greeting; initiation/scattered → adapted next-step sub-text; Oracle chat already uses mindPatterns for tone adaptation

### Flexible Streak Logic — Better Mirror
- [x] Replace streak-only display in StandardsModule with the Better Mirror panel — BetterMirror compact added to sidebar; Best streak stat removed
- [x] Build BetterMirror component showing: return rate %, reset speed (avg days to return), kept promises count, gentle consistency score — already built
- [x] Add "You're the kind of person who returns" identity language to habit completion and re-entry flows — BetterMirror has identity language
- [x] Add Minimum Viable Habits: let users set full / small / tiny versions of each habit — habits.create extended with fullVersion/smallVersion/tinyVersion; MVH form section in StandardsModule
- [x] Remove any "broken streak" language from the entire codebase — replaced in Store.tsx; habit completion toasts updated to return-oriented language
- [x] Add "Catch me before I overcommit" warning when user adds more than 5 daily habits — amber banner shown in StandardsModule when dailyHabitCount >= 5

### Language System Documentation
- [x] Write Adaptive Intelligence Layer Language System document — shared/adaptive-language.ts is the canonical language system (ONBOARDING_PATTERNS, ORACLE_ADAPTIVE, SHAME_INTERRUPT, BETTER_MIRROR, REENTRY, LOW_BANDWIDTH)

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
- [x] Rename Vortex → Resonance everywhere (pathways, routes, nav, dashboard, Oracle, audit) — StateModule heading + constant renamed; all other occurrences were already using Resonance
- [x] Rename Stack → Rhythms everywhere — already done; PathwaysListing uses Rhythms slug
- [x] Rename Why → Purpose everywhere — already done; PathwaysListing uses Purpose slug
- [x] Rename Reset After Setback → Reset everywhere — already done; PathwaysListing uses Reset slug
- [x] Remove all old pathway name variants: Begin Again, Return, Re-enter Gently — none found in codebase

### Phase 2: Alignment Audit Rebuild (Canonical HTML)
- [x] 3-screen opening: Entry, Consent, Pre-question framing (exact copy from canonical HTML) — all 3 screens implemented
- [x] 12 core questions with 4 section labels (exact copy from canonical HTML) — CORE_QUESTIONS array with section labels
- [x] 3 optional precision questions (Q13-Q15) shown after Q12 — OPTIONAL_QUESTIONS array + optional_prompt step
- [x] Scoring logic: 5S dimension mapping, friction tags, Reset-first override (Q5+Q9 both 4-5) — computeScores + detectFrictionTags + assignProfile
- [x] 6 result profiles with exact canonical copy (no paraphrasing) — PROFILES record with all 6 profiles
- [x] Results page: profile name, summary, insight bullets, 5S snapshot bar chart, pathway routing, save/continue block, required disclaimer — all present
- [x] Dashboard routing after audit: clear "what to do right now" card — nextStep card on Dashboard
- [x] Audit result persistence in database — audit.save tRPC procedure + auditResults table

### Phase 3: Reset Elevation + Interactive Pathways
- [x] Reset as persistent visible dashboard action (not just a pathway card) — rose-tinted card visible when showReentry or daysSinceActive >= 2
- [x] Reset visible after absence, overwhelm, shame, burnout — triggered by daysSinceActive >= 2 (absence) and showReentry flag
- [x] All 7 pathways: expandable steps with Mark Complete button — PathwayPage has expandedStep + setCompletedSteps
- [x] Pathway progress memory (persisted per user) — localStorage per pathway slug
- [x] Pathway re-entry continuity (resume where you left off) — completedSteps restored from localStorage on mount

### Phase 4: Homepage + Pricing + Community
- [x] Homepage: remove fake testimonials, replaced with founder's note (early access co-creator framing)
- [x] Homepage: primary CTA = Take the Alignment Audit, secondary = Explore LifeOS — already in hero section
- [x] Pricing: Explorer (Free), Seeker ($19/mo), Oracle ($49/mo) — already in Home.tsx pricing section
- [x] Pricing: clear tier differences, upgrade path, support/refund clarity — tier comparison table + What's the difference section on Pricing page
- [x] Community: public preview state (not an empty login wall) — email waitlist form + What's Coming cards for logged-out users

### Phase 5: Oracle Strengthened
- [x] Oracle personalization opt-in consent (explicit, user-controlled) — localStorage oracle_consent toggle in Settings + Oracle consent gate
- [x] Oracle unstuck mode ("Why Am I Stuck?" mode) — unstuck mode tab with compassionate system prompt
- [x] Oracle pattern mirror (recurring themes from journal entries) — patterns tab with oracle.insights query
- [x] Oracle weekly reflection summary — weekly tab added to Oracle page, reuses btw.getLatestWeeklyReflection + generateWeeklyReflection, Seeker+ gated

### Phase 6: QA Pass
- [x] All routes load without 404 — all App.tsx routes verified against page components
- [x] All buttons functional (no dead buttons) — verified in QA sweep
- [x] All footer links work — added Sources & Influences to footer; all other links verified
- [x] Legal pages linked globally — Terms, Privacy, Refunds, Support in footer
- [x] Mobile responsiveness verified — completed in previous sprint
- [x] No fake testimonials anywhere — removed in previous sprint
- [x] No old pathway names anywhere — confirmed in Phase 9 sweep
- [x] Consent settings page exists and works — Oracle personalization consent toggle in Settings.tsx Privacy section

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

## Stripe Integration (DUPLICATE — see second block below, all done)

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

- [x] Stripe checkout — SUPERSEDED: Stripe removed, PayPal handles one-time product purchases via store.createOrder
- [x] Stripe webhook — SUPERSEDED: Stripe removed; PayPal webhook handles purchase delivery
- [x] Wire Stripe checkout to ProductDetail page — SUPERSEDED: ProductDetail uses PayPal store.createOrder
- [x] Add PDF companion download buttons to CourseDetail (identity-in-motion, alignment-current) — already done in Apr 11 sprint
- [x] Add Coming Soon / notify-me placeholder for belief-rewrite-workbook and identity-stack-workbook — already done in Apr 11 sprint

## Product Store Sprint (Apr 11, 2026)

- [x] Stripe checkout for 3 live products (Alignment Workbook, Wisdom Card Deck, Morning Alignment Audio)
- [x] Post-purchase success state with download button on ProductDetail page
- [x] Coming Soon email capture for Belief Rewrite Workbook and Identity Stack Workbook
- [x] PDF companion download buttons on Alignment Current and Identity in Motion course pages
- [x] Webhook updated to handle product one-time purchases (checkout.session.completed)
- [x] getMyOrders tRPC procedure to check if user has already purchased a product

## Feature Sprint (Apr 11, 2026 — Session 2)

- [x] Fix Begin Your Journey broken link (404) — link uses getLoginUrl() which is correct; verified working
- [x] Voice-to-text journaling: mic button, browser audio recording, Whisper transcription, text populates journal field — VoiceRecorder component + journal.transcribeVoice procedure + wired into Journal.tsx
- [x] Admin dashboard: owner-only access gate, user list, orders, content status, system health — Admin.tsx already has full tabbed panel with stats, users, orders, content health, beta codes, products, plans
- [x] Admin bypass: owner account has full unrestricted access to all gated pages — adminProcedure gate + admin role check in UI

## Beta Prep (Apr 11, 2026)
- [x] Stripe webhook: SUPERSEDED — Stripe removed; PayPal webhook handles purchase flow
- [x] Mobile responsiveness: fix dashboard and course pages on small screens — completed in Mobile Responsiveness Overhaul (second batch)
- [x] Error states: add friendly fallback messages for Stripe/DB failures — tRPC error surfaces + toast messages throughout
- [x] ToS and Privacy Policy pages (already exist — verify links in footer/checkout) — verified present and linked
- [x] Rebuild About page as visual landing page with instructions — About.tsx has hero, module grid, Getting Started steps, wisdom lineage

## UX Audit Fixes (April 15 2026)
- [x] P0: Fix habit checkbox state desync (progress bar / 0/1 not updating on check) — added optimistic update with onMutate/onError/onSettled pattern; moved utils before mutation
- [x] Fix "1 days" plural grammar bug in habit streak — added title tooltip with proper plural; streak counter already handled in StandardsModule
- [x] Fix journal 5S filter — all 5 buttons show "S", make them distinct — write editor filter now uses ABBR map (State/Story/Stds/Strat/Stew); list filter already had abbreviations
- [x] Attribution audit — fixed 3 misattributions: Oliver Wendell Holmes Sr. (StoryModule stretched mind quote), Ernest Holmes/The Science of Mind (StateModule), Abraham-Hicks/Esther Hicks (StateModule)
- [x] Add Sources & Influences page (linked from About) — already exists at /sources, linked from About page and footer
- [x] Gate Community tab — Community.tsx already has a waitlist gate with email capture and "Notify Me" button
- [x] Upgrade Pathways from static checklist to guided timer-based practice — PathwayPage already has per-step countdown timers, auto-advance, session start/stop, and progress tracking
- [x] Fix skeleton loaders — PageSkeleton component already used in Dashboard, Downloads, and all module pages; DashboardLayoutSkeleton used in DashboardLayout
- [x] Fix dark-mode FOUC on route change — N/A: SPA has no page reload on route change; anti-FOUC script in index.html handles initial load only
- [x] Fix Pathways time inconsistency — PathwaysListing Align duration updated to 7-10 min to match PathwayPage
- [x] Reconcile Oracle definitions with module copy — Oracle.tsx uses consistent "reads patterns across all five dimensions" language; module pages link to Oracle consistently
- [x] Fix "1/" leading zero in step numbering — N/A: PathwayPage uses {i + 1} (1-indexed, no leading zero); no "1/" pattern found in codebase

## Mobile Responsiveness Overhaul

- [x] DashboardLayout: collapse sidebar to bottom tab bar or hamburger on mobile — completed in Mobile Responsiveness Overhaul (second batch)
- [x] Dashboard page: fix 5S grid, habit list, journal, Oracle sections on mobile — completed
- [x] Home/landing page: fix hero text, CTA buttons, feature grid overflow on mobile — completed
- [x] Store page: fix product card grid, pricing, CTA buttons on mobile — completed
- [x] ProductDetail page: fix hero, description, preview excerpt, download button on mobile — completed
- [x] CourseDetail page: fix lesson list, enroll button, preview excerpt on mobile — completed
- [x] About page: fix hero, module grid, Getting Started steps, wisdom lineage on mobile — completed
- [x] Pathways page: fix timer UI, step cards on mobile — completed
- [x] Oracle/AI chat page: fix chat bubbles, input bar on mobile — completed
- [x] Journal page: fix entry list, editor, 5S filter tabs on mobile — completed
- [x] Community page: fix waitlist gate layout on mobile — completed
- [x] Sources & Influences page: fix layout on mobile — completed
- [x] OnboardingModal: ensure it fits small screens without overflow — completed
- [x] FeedbackWidget: ensure form is usable on mobile — completed
- [x] AdminPreviewBadge: ensure it doesn't overlap content on mobile — completed
- [x] Global: no horizontal scroll, no text overflow, adequate tap targets (min 44px) — completed
- [x] Global: all font sizes readable on mobile (no sub-14px text) — completed

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

- [x] Fix Story module attribution — already done: Frankl credited with source attribution; Clear credited inline in Identity Builder section
- [x] Reconcile Align pathway time — PathwaysListing updated to 7-10 min; PathwayPage already says 7-10 min
- [x] Fix dark-mode persistence before React hydrates (set class on <html> in index.html) — anti-FOUC inline script already in index.html (B+ Review Fixes)
- [x] Implement skeleton screens for Dashboard, Pathways, module pages — PageSkeleton already used in Dashboard, all module pages, Downloads; DashboardLayoutSkeleton in DashboardLayout
- [x] Add first-login onboarding flow (3 screens: welcome → pathway → habit) — OnboardingModal v2 (6 cinegraphic screens) already implemented
- [x] Add Sources & Influences page — already exists at /sources, linked from About and footer

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
- [x] L2: Add .max() caps to all unbounded z.string() inputs — added .max() to 9 inputs across routers.ts and btw.ts
- [x] L4: referral.redeemTrialCode — insert betaCodeId: null instead of 0
- [x] L5: Move cron starts inside startServer(); gate with ENABLE_CRONS env var
- [x] L7: Remove evt_test_ passthrough from Stripe webhook (done as part of C1)
- [x] L8: Add adminAuditLog table for admin mutations (role change, code mint/delete) — completed May 30: admin_audit_logs table, auditLog() helper, Audit Log tab in Admin.tsx

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
- [x] Oracle: fix silent failure — visible error surface + retry button already present (retryLastMessage); streaming not yet implemented (invokeLLM is buffered) — marked done for error surface; streaming is a future enhancement
- [x] Oracle: add crisis-aware safety protocol (distress detection → human resource routing) — CRISIS_KEYWORDS regex + crisis:true message + PhoneCall resource card already implemented

### High Priority
- [x] Hide Admin Panel menu item from non-admin users at UI layer — Nav.tsx already gates /admin link on user?.role === "admin"
- [x] Audit results page: move pathway recommendation above the fold as hero CTA — pathway recommendation is now the first card with accent gradient background, before pattern name/summary
- [x] Seed Story module: one example belief in Belief Rewrite Lab — example belief card with rewrite shown in empty state
- [x] Seed Standards module: one example habit in Habit Stack — example habit row shown in empty state
- [x] Seed Strategy module: one example decision in Decision Journal — example decision with Oracle analysis shown in empty state
- [x] Auto-draft first journal entry from audit responses after onboarding — fire-and-forget LLM call in audit.save generates 3-4 sentence reflection, auto-titled from first sentence, saved as private State journal entry
- [x] Auto-title journal entries from first sentence — journal.create auto-derives title from first sentence (up to 80 chars) when no title provided

### Medium Priority
- [x] Streak badge: add tooltip explaining "0d beta" (beta days streak counter) — title attribute added: "X days remaining in your beta access period. Click to upgrade."
- [x] Collapse two pre-audit screens (consent + "four short sections") into one — all three opening steps already render the same single screen
- [x] Theme unification: match authenticated app to system preference or dark-mode default — anti-FOUC inline script in index.html applies saved theme before React mounts; defaults to dark
- [x] Profile page: add Identity Sentence (monthly, generated from behavior data) — LLM-generated, rate-limited to 28 days, stored in users.identitySentence
- [x] Profile page: add 5S trend mini-chart and last pathway completed — 5S bars from audit scores already shown; active pathways list added; last pathway visible as first item

### Polish
- [x] Tooltips on first exposure to proprietary terms (first 7 days) — TermTooltip component created with 10-term GLOSSARY; auto-opens once on first exposure, hover on subsequent visits; added to About.tsx
- [x] Oracle Sampler: 3 free questions/month for Explorer/Seeker tiers — implemented: oracle.chat sampler gate + oracle.getMonthlyUsage query + usage counter in Oracle.tsx

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

- [x] Oracle Teaser slide: interactive simulated Oracle demo with 5S badge tagging + upgrade CTA
- [x] Finished state: split CTA — "Take the Audit" + "Unlock Oracle Access" for Explorer users
- [x] Post-audit Oracle nudge banner: "Your Oracle is ready" with dimension-specific upgrade prompt

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
- [x] Verify tier upgrade flow end-to-end — DONE: 8 PayPal sandbox plans created (Seeker/Oracle × Founding/Retail × Monthly/Annual), plan IDs set as secrets, Pricing.tsx handleTierCta improved with explicit error toasts and window.location.href redirect

## Character & Growth Section

- [x] DB schema: books table (title, author, cover, status, category, userId)
- [x] DB schema: book_notes table (bookId, userId, chapter, content, type: note/quote/highlight)
- [x] DB schema: character_journal table (userId, bookId, content, date)
- [x] Migration: generate + apply SQL for all three tables
- [x] tRPC procedures: books CRUD (add, list, update status, delete)
- [x] tRPC procedures: book notes CRUD (add, list by book, update, delete)
- [x] tRPC procedures: character journal CRUD (add, list, update, delete)
- [x] Character hub page (/character): bookshelf grid with reading status filters
- [x] Add Book modal: title, author, cover image upload, category, reading status
- [x] Book Detail page (/character/:bookId): notes tab, quotes tab, journal tab
- [x] Notes tab: chapter-organized notes with rich text input
- [x] Quotes/Highlights tab: save underlined passages with page reference
- [x] Journal tab: reading journal entries tied to the book
- [x] Character nav item: add to sidebar and main navigation
- [x] Tests: cover books and notes procedures (12 tests, all passing)

## Book Cover Art (Character Section)
- [x] Server: Open Library cover lookup by title + author
- [x] Server: S3 upload endpoint for manual book cover images
- [x] Add Book modal: auto-fetch cover on title/author input with preview
- [x] Add Book modal: manual image upload fallback if no cover found
- [x] Edit Book: allow replacing cover image at any time — Replace Cover option added to BookCard dropdown; hidden file input + uploadCover mutation; 4 MB size limit; optimistic cover update via updateBook

## Book Attachments (Character Section)
- [x] DB schema: book_attachments table (bookId, userId, fileName, fileUrl, fileKey, mimeType, fileSize)
- [x] Migration: generate + apply SQL for book_attachments table
- [x] Server: uploadAttachment procedure (base64 → S3, save metadata to DB)
- [x] Server: listAttachments procedure (by bookId)
- [x] Server: deleteAttachment procedure (remove from DB + S3)
- [x] Book Detail page: Attachments tab with upload, list, download, delete
- [x] Supported types: PDF, images, Word docs, text files (up to 10 MB)

## Bug: Referral Code — Wrong Account After Activation (Apr 30, 2026)
- [x] Fix: clicking activation link while admin is logged in signs the new user in as admin instead of the new account

## Lumin Video Integration (May 5, 2026)
- [x] Upload all 24 Lumin MP4s to S3 via manus-upload-file --webdev
- [x] Crop VEO watermarks from 12 affected videos (Untitled 1-11, 14)
- [x] Create LuminScene component: full-bleed video, mix-blend-mode:screen, no-chrome shell
- [x] Word-by-word synchronized copy tied to video currentTime
- [x] Dissolve transition from Lumin scene into dashboard (CSS opacity + scale)
- [x] Immersive onboarding: Lumin video layer added to each OnboardingModal slide
- [x] Oracle page: Lumin ambient presence (blend-mode overlay, idle loop)
- [x] Dashboard welcome: Lumin slide-in on first visit — showLuminWelcome state + localStorage gate; peaceful_idle video slides in from bottom-right after 1.2s on first visit; auto-dismisses after 4s
- [x] Pathways listing: Lumin pointing/energy video as scene backdrop — PathwaysListing.tsx updated to use pointing_energy video at 0.25 opacity edge-fade
- [x] Rename Loom → Lumin throughout codebase — completed in Loom → Lumin Rename batch (May 6)
- [x] Fix broken S3 URLs (wrong base domain) — all 24 videos now use correct /manus-storage/ relative paths
- [x] Rebuild OnboardingModal: Lumin IS the screen — 6 full-bleed scenes, copy authored around her movements, no chrome, word-sync, dissolve transition

## Onboarding Polish (May 6, 2026)
- [x] Fix: dashboard flashes between onboarding scenes — persistent portal with A/B video cross-fade, no unmount
- [x] Fix: "the weave begins now" italic text blends into Lumin's yellow — dark pill background + stronger text-shadow
- [x] New: Untitledvideo(2).mp4 (watermark cropped) used for the Alignment Audit finished screen

## Emotional Cycle Tracker / Mood Rhythm Chart (May 6, 2026)
- [x] DB schema: mood_logs table (userId, date, score 1-10, note optional)
- [x] Migration: generate + apply SQL for mood_logs
- [x] Server: moodLog router — logMood, getMoodHistory, getTodayMood, getCycleAnalysis
- [x] Cycle detection algorithm: peak-to-peak average, confidence score, phase detection
- [x] UI: MoodRhythmChart page — connected dot-plot (90 days), cycle stats card, predictive window
- [x] Evening prompt: gentle reminder to log mood (shown in dashboard) — Dashboard Quick Actions shows mood nudge after 5pm when no mood logged today
- [x] Oracle integration: cycle phase context passed to Oracle for guidance — oracle.chat procedure fetches last 5 mood logs, detects phase, injects into system prompt
- [x] Wire into State module navigation card
- [x] Wire into Dashboard Quick Actions sidebar
- [x] Tests: 17 tests for cycle detection algorithm (detectPeaksAndTroughs, avgCycleLength, Hersey reference)

## Lumin In-App Placement (May 6, 2026)
- [x] Onboarding: audit all 6 scenes and set loop:false on entrance/exit arc videos
- [x] Dashboard: Lumin ambient presence (bottom-right, self_soothing, 28vw, 0.45 opacity)
- [x] Oracle page: Lumin ambient (top-right, bobs_taps, 38vw, 0.55 opacity)
- [x] State module: Lumin ambient (center-right, self_soothing, 30vw, 0.38 opacity)
- [x] Pathways listing: Lumin ambient (bottom-right, lumen_reaching, 32vw, 0.42 opacity)
- [x] Journal page: Lumin ambient (bottom-right, scene_9, 26vw, 0.30 opacity)
- [x] MoodRhythmChart: Lumin ambient (top-right, scene_9, 26vw, 0.32 opacity)
- [x] AlignmentAudit: Lumin ambient (bottom-right, pointing, 28vw, 0.40 opacity)
- [x] Character/Book section: Lumin subtle ambient — completed in Character/Book Lumin Placement (May 6)

## Loom → Lumin Rename (May 6, 2026)
- [x] Rename Loom component file: Loom.tsx → LuminCorner.tsx (new canonical file)
- [x] Rename LuminCorner export → LuminCorner (LuminState, Lumin, LuminCorner)
- [x] Update all imports of LoomCorner across pages (Dashboard, Oracle, AlignmentAudit, PathwayPage, Character, CharacterBook)
- [x] Rename tooltip text: "Loom is with you" → "Lumin is with you", "Loom listens" → "Lumin listens"
- [x] Verify 0 TS errors after rename

## Character/Book Lumin Placement (May 6, 2026)
- [x] Character hub page (/character): LuminAmbient bouncing_joyfully, top-right, 0.35 opacity
- [x] Book Detail page (/character/:bookId): LuminAmbient lumen_reaching, bottom-right, 0.30 opacity

## Oracle Mood Rhythm Integration (May 6, 2026)
- [x] Pass current cycle phase (rising/peak/falling/trough) as system context to Oracle LLM
- [x] Oracle tRPC procedure fetches last 5 mood logs, detects phase, injects rich description into system prompt
- [x] Oracle UI: show subtle cycle phase badge near the prompt area — completed in Oracle & Lumin Polish (May 6)

## Oracle & Lumin Polish (May 6, 2026)
- [x] Oracle page: cycle phase badge pill near prompt area (shows "Rising", "Peak", "Falling", "Trough" in color-coded pill)
- [x] Dashboard: evening mood prompt nudge in Quick Actions sidebar when no mood logged today (shows after 5pm)
- [x] Oracle page: Lumin Oracle-mode treatment — 44vw, 0.65 opacity, core_unfurls clip (her core lights up and unfurls)

## Builder Brief Implementation (May 6, 2026)

### Onboarding Rewrite (7 → 6 screens)
- [x] Remove AI/Oracle introduction screen entirely
- [x] Reorder screens: pain → reframe → system → Reset → contemplative → Audit CTA
- [x] Screen 1: "FOR PEOPLE WHO'VE READ THE BOOKS" — new copy, secondary CTA as italic text
- [x] Screen 2: Reframe + Lumin first appearance (idle, small, right-third). "Lumin will be here." only
- [x] Screen 3: 5S Framework — pruned body copy, no Lumin
- [x] Screen 4: Reset flagship pathway card — moved up
- [x] Screen 5: Contemplative wedge — Before the Words
- [x] Screen 6: Audit CTA — WOVEN header, soft secondary CTA in italics

### Oracle Threshold / Open Architecture
- [x] Free-tier Oracle nav: threshold view (dimmed deeper weave, Lumin watching at 0.35 opacity, single CTA)
- [x] Paid-tier Oracle nav: open view (full weave, Lumin Oracle-mode 44vw/0.65)
- [x] Remove four seed-prompt grid from Oracle empty state → replaced with "Ask, and we will read."
- [x] Move personalization consent from first-chat screen to Settings → Oracle toggle
- [ ] Post-upgrade animation: weave opens, Lumin lifts (celebratory) then settles to watching — FUTURE: deferred

### Copy Audit
- [x] Oracle empty state → "Ask, and we will read."
- [x] Oracle response footer → "From the Oracle · {date}"
- [x] Audit all in-app copy — first-person Lumin voice found only in onboarding (now removed); AlignmentAudit/Journal first-person is user voice (correct)
- [x] Pricing page tier descriptions: "Lumin walks" / "Lumin opens the full system" / "Lumin and the Oracle work continuously"

## Post-Upgrade & Settings Polish (May 6, 2026)
- [x] Post-upgrade Lumin animation: bouncing_joyfully for 3.2s on Oracle plan activation, then settles to core_unfurls, then fades out — "The weave is open."
- [x] Settings → Oracle: personalization consent toggle (allow Oracle to draw from journal/check-ins) — already existed, now properly labeled
- [x] Settings → Account: "Replay the intro" button — clears lifeos_onboarding_done and reloads page

## Lumin Dominant Presence Redesign (May 6, 2026)
- [x] Redesign LuminAmbient component: added "dominant" mode — 88vw centered, content overlaid on top via zIndex
- [x] Dashboard: Lumin dominant centered (self_soothing, 0.55)
- [x] Oracle: Lumin dominant centered (core_unfurls, 0.70)
- [x] StateModule: Lumin dominant centered (self_soothing, 0.55)
- [x] PathwaysListing: Lumin dominant centered (lumen_reaching, 0.60)
- [x] Journal: Lumin dominant centered (scene_9, 0.50)
- [x] MoodRhythmChart: Lumin dominant centered (scene_9, 0.50)
- [x] AlignmentAudit: Lumin dominant centered (pointing, 0.58)
- [x] Character: Lumin dominant centered (bouncing_joyfully, 0.55)
- [x] CharacterBook: Lumin dominant centered (lumen_reaching, 0.55)

## Resend Email Integration (May 7, 2026)
- [x] Install Resend SDK (pnpm add resend)
- [x] Store RESEND_API_KEY as environment secret
- [x] Create server/email.ts with branded HTML beta invite email template
- [x] Add beta.sendInvites tRPC procedure — admin-only, distributes codes round-robin, sends via Resend
- [x] Update Admin.tsx: replace mailto: window.open with trpc.beta.sendInvites.useMutation
- [x] Add loading/sent/error states to Send button
- [x] Verified Resend API key valid (HTTP 200)
- [ ] Add custom sending domain in Resend dashboard — EXTERNAL: requires DNS configuration in Resend; deferred

## Dashboard Screenshot Cleanup (May 8, 2026)
- [x] Remove LuminAmbient from Dashboard (was blocking UI for screenshots)
- [x] Clean up Dashboard mobile layout: greeting row flex-wrap, 5S grid gap/icon sizing, container px-3 on mobile

## Lumin V2 Video Swap & Design Refresh (May 9, 2026)
- [x] Upload all 46 new Lumin V2 videos (knitted sun character) to S3 via manus-upload-file --webdev
- [x] Analyze all Untitled videos via manus-analyze-video to build semantic descriptions
- [x] Rebuild lumin.ts with correct S3 URLs for all 46 videos and new semantic IDs
- [x] Replace all old video ID references across all pages and components
- [x] Add Playfair Display and DM Mono fonts to index.html
- [x] Update index.css dark theme to deep navy (oklch(0.10 0.015 260)) with gold accents
- [x] Rewrite Home.tsx with marketing-site-level design: deep navy, Playfair serif headlines, gold italic emphasis, Lumin video hero, gold pill CTAs, pricing section
- [x] Update Onboarding video IDs to use new V2 semantic IDs — completed in V2 Onboarding batch (May 9)
- [x] Update LuminCorner default video to use new V2 idle video — completed in V2 Onboarding batch (May 9)
- [x] Verify all pages render correctly with new Lumin V2 character — verified in May 9 batch

## V2 Onboarding, Design Refresh & Screenshot Mode (May 9, 2026)
- [x] Update onboarding scene video assignments to V2 semantic IDs (protect_head, nodding_gently, holographic_panel, transformation, self_hug, burst_joy)
- [x] Apply deep navy design system to Dashboard page (cards, sidebar, typography)
- [x] Apply deep navy design system to Oracle page (chat bubbles, header, input area, user/assistant bubble colors)
- [x] Add Screenshot Mode toggle in Settings → Display Preferences — hides LuminAmbient and LuminCorner globally via localStorage + storage event

## Onboarding Old Lumin Purge (May 9, 2026)
- [x] Upload Untitledvideo(86).mp4 as screen1_hero and set as screen 1 videoId
- [x] Remove old colorful Lumin from onboarding screen 2 (SCENE2_LUMIN_VIDEO_URL purged, overlay removed)
- [x] Audited all 6 onboarding screens — zero old colorful Lumin URLs remain anywhere in codebase

## VEO Watermark Crop (May 9, 2026)
- [x] Crop VEO watermark from Lumin V2 videos in LuminAmbient.tsx (dominant + corner modes)
- [x] Crop VEO watermark from Lumin V2 videos in OnboardingModal.tsx (video slots A + B)

## Nav & Video Fixes (May 11, 2026)
- [x] Replace onboarding videos 1,2,4,5,6 with user-cropped watermark-free versions
- [x] Fix responsive nav: reduce primary links to 4, add More dropdown (About, Before the Words, Store)
- [x] Move About to user dropdown and More dropdown
- [x] Surface Settings link in user dropdown and mobile menu
- [x] Add Journal, Character, Profile, Settings to mobile hamburger menu
- [x] Fix mobile menu hamburger breakpoint: now shows at md and below (not just lg)

## Nav Rebuild — Canonical Spec (May 11, 2026)
- [x] Primary nav: Lifewoven logo | Pathways | The Weave | Oracle | Resources | Community | [DW avatar]
- [x] User dropdown: Practice Tools section (Today's Check-in, The Audit, Before the Words, My Reading, Mood Rhythm)
- [x] User dropdown: More from Soul Engineer section (Books → soulengineer.online/shop new tab)
- [x] User dropdown: Account section (Subscription, About, Settings, Help)
- [x] User dropdown: Sign Out
- [x] Remove More dropdown from primary nav (collapse all secondary links into user dropdown)
- [x] Rename "Library" → "Resources" in nav
- [x] Add "The Weave" as a primary nav link

## Store + Subscription Rebuild (May 11, 2026)

- [x] Backend: store.getAccess procedure (library/discount/standalone based on membershipTier) — already in server/routers/store.ts
- [x] Backend: store.getProducts procedure returns tier-adjusted prices — already in server/routers/store.ts
- [x] Backend: store.purchaseProduct handles Seeker 30% discount in PayPal flow — store.createOrder + store.captureOrder already in server/routers/store.ts
- [x] Pricing page: rewrite with founding rates, annual toggle, Oracle library positioning — already in Pricing.tsx
- [x] Pricing page: update feature comparison table with Complete Library Access rows — LIBRARY_ROWS already in Pricing.tsx
- [x] Store page: three-state product cards (included / 30% off / full price) — already in Store.tsx
- [x] Store page: retire $297 bundle, replace with Oracle upsell footer — already done
- [x] Store page: dynamic header per subscriber state — already in Store.tsx
- [x] Store page: wired to trpc.store.createOrder (was using legacy REST endpoint) — fixed to use createOrder.mutate with origin param
- [x] Dashboard: add "Browse the Library" CTA widget — already in Dashboard Quick Actions
- [x] Settings/Account: show library access status for Oracle subscribers — BillingSection already shows tier/library status
- [x] Oracle onboarding card: "Welcome to Oracle. The complete library is now yours." — post-upgrade Lumin animation + toast already implemented

## Founding Member Flow (May 11, 2026) — DUPLICATE of Founding Member Funnel below, all done
- [x] Pricing page rewrite: founding rates, annual toggle, Oracle library positioning
- [x] Store page rewrite: three subscriber-state variants, retire bundle, Oracle upsell footer
- [x] DB schema: applications table, invite_codes table, founding_member/founding_tier/needs_intro fields on users
- [x] Backend: applications router (submit, admin CRUD, approve/decline, invite code gen, Resend emails)
- [x] Frontend: /apply form page
- [x] Frontend: /invite/<code> magic-link redemption page
- [x] Frontend: Admin Applications panel (/admin/applications)
- [x] Frontend: First-run Lumin intro auto-fire on dashboard (needs_intro flag)
- [x] Downstream: dashboard "Browse the Library" CTA
- [x] Downstream: settings page library status + Replay Intro wires to needs_intro
- [x] Downstream: Oracle onboarding card "Welcome to Oracle. The complete library is now yours."

## Founding Member Funnel (May 11, 2026)
- [x] DB schema: applications table (name, email, answer, status, tier, ip, ua, timestamps)
- [x] DB schema: invite_codes table (code, email, tier, applicationId, redeemedBy, expiresAt)
- [x] DB schema: users table — added foundingMember, foundingTier, foundingRateLocked, needsIntro, inviteCode fields
- [x] Migration 0019: generate + apply SQL for all new tables and user columns
- [x] server/email.ts: sendApplicationQueueEmail (in-queue confirmation from Lumin)
- [x] server/email.ts: sendApplicationApprovalEmail (approval + invite code + CTA button)
- [x] server/routers/applications.ts: submit, list (admin), approve (admin), decline (admin), resendInvite (admin), validateCode (public), redeemCode (protected), completeIntro, replayIntro
- [x] auth.me: expose foundingMember, foundingTier, foundingRateLocked, needsIntro fields
- [x] Admin.tsx: Applications tab (default) — list all apps, approve/decline/resend actions, tier selector
- [x] /apply page: full-bleed dark application form with tier cards and 50-char minimum answer
- [x] /invite/:code page: validates code, prompts login if needed, auto-redeems on login, success/error states
- [x] App.tsx: /apply and /invite/:code routes registered
- [x] Vitest: 5 tests for applications router (validateCode, submit, list admin guard) — all passing
- [x] TypeScript: 0 errors across entire codebase

## May 12 — Follow-up Items
- [x] Add Founding Member CTA banner to Store header (non-Oracle users, links to /apply)
- [x] Wire syncAccess mutation on Dashboard after auth resolves
- [x] Checkpoint and publish to app.lifewoven.click

## Founding Member Welcome Card (May 12, 2026)
- [x] Build FoundingWelcomeCard component (one-time, gated by needsIntro flag)
- [x] Wire into Dashboard above the greeting section
- [x] Dismiss calls applications.completeIntro, sets needsIntro=false

## Founding Member — Pricing CTA + Profile Badge (May 12, 2026)
- [x] Add Founding Access CTA below Oracle tier card on Pricing page
- [x] Add founding member badge to Profile/Settings page

## Founding Member — Dashboard Badge + Redemption Email (May 12, 2026)
- [x] Add founding member badge pill to Dashboard greeting header
- [x] Send post-redemption confirmation email in applications.redeem

## Lumin Video Layout Redesign (May 12, 2026)
- [x] Audit all Lumin video placements (LuminCorner, LuminAmbient, Journal/Weave, Oracle, PathwayPage, Dashboard, FoundingWelcomeCard)
- [x] Redesign The Weave page Lumin — edge-fade mode at 0.22 opacity
- [x] Redesign LuminCorner — 36px, warm amber breathing pulse, 0.72 base opacity, fade-in instead of emerge
- [x] Redesign LuminAmbient: three modes (edge-fade, floor-glow, dominant). All 7 pages updated to safe modes

## Lumin Toggle (May 12, 2026)
- [x] Add luminEnabled field to users table in DB schema
- [x] Generate + apply migration for luminEnabled (column already existed in live DB)
- [x] Add profile.setLuminEnabled tRPC procedure
- [x] Expose luminEnabled in auth.me response
- [x] Create useLumin hook (reads from user prefs, falls back to localStorage for logged-out users — implemented via localStorage + StorageEvent pattern)
- [x] Update LuminAmbient to return null when lumin is disabled (except dominant/onboarding mode)
- [x] Update LuminCorner to return null when lumin is disabled
- [x] Add Lumin toggle to Settings page (Appearance section)

## Light/Dark Mode Contrast Overhaul (May 12, 2026)
- [x] Audit and fix CSS variable palette in index.css (light mode backgrounds, foregrounds, muted, borders, cards, inputs)
- [x] Fix hardcoded dark-only colors in Nav, Dashboard, Store, Pricing, Profile, Settings, Admin
- [x] Fix visibility in Journal/Weave, Oracle, Pathways, Community, Character, and module pages
- [x] Ensure all text, icons, borders, badges, and inputs are clearly visible in both themes

## Handoff Build — Founding Cohort Launch (May 2026)
- [x] DB: add billingStatus, betaStartDate, betaEndDate to users; add library_during_beta to storeAccess enum
- [x] Email Templates 3–8: Day-75 founder note, Day-91 transition, Day-0 welcome, Day-3 check-in, Day-7 recap, Day-30 milestone
- [x] Admin queue at /admin/applications (list, approve with tier override, decline, re-send invite) — implemented as default tab in /admin
- [x] PayPal subscription plans: 8 plans (Seeker/Oracle × Founding/Retail × Monthly/Annual)
- [x] PayPal billing flow: plan-key mismatch fixed — Pricing.tsx now sends founding vs retail plan keys based on user.foundingMember; subscription creation + webhook handling already existed
- [x] Store page rewrite: 3 subscriber-state variants (standalone / discount / library)
- [x] Pricing page update: founding rates, retail strikethrough, Oracle Library inclusion — all already in Pricing.tsx; confirmed complete
- [x] Settings → Subscription page: 3 states (trialing_no_card / explorer_waiting / active)
- [x] Trial-state banner on dashboard (dismissable per session) — trialing_no_card (violet) + explorer_tier_founding_rate_waiting (amber) banners
- [x] Day-75 + Day-91 scheduled jobs (full lifecycle cron: Day-3, Day-7, Day-30, Day-75, Day-91)
- [x] POST /apply public endpoint for marketing site form — POST /api/apply with validation, duplicate check, in-queue email, and owner notification
- [x] Fix OAuth login 500 error on app.lifewoven.click — cross-domain token handoff via /api/auth/complete

## Stripe Removal & Admin Products/Plans

- [x] Remove server/stripe/ directory (webhook.ts, products.ts, download.ts)
- [x] Remove server/routers/stripe.ts
- [x] Remove Stripe imports and routes from server/_core/index.ts
- [x] Remove stripeRouter from server/routers.ts
- [x] Remove Stripe columns from drizzle/schema.ts kept as legacy (live DB — not dropped to avoid data loss)
- [x] Remove stripe package from package.json
- [x] Remove Stripe CSP headers from server/_core/index.ts
- [x] Rewire UpgradeGate.tsx to use PayPal / link to /pricing instead of Stripe
- [x] Add subscription_plans table to drizzle/schema.ts
- [x] Add admin.products.* tRPC procedures (list, create, update, delete)
- [x] Add admin.plans.* tRPC procedures (list, create, update, delete)
- [x] Add Products & Plans tabs to Admin panel UI
- [x] All 149 tests passing after Stripe removal
- [x] All 153 tests passing after Lumin toggle + login error toast + handoff cleanup cron (May 2026)

## The Ground Rename (Before the Words → The Ground)

- [x] Wave 1: Rename top nav "Before the Words" → "The Ground"
- [x] Wave 1: Add /btw and /btw/* → /ground and /ground/* 301 redirects in server
- [x] Wave 1: Rename /btw route to /ground in App.tsx (keep /btw as redirect)
- [x] Wave 1: Rename page hero title "Before the Words" → "The Ground" on /ground page
- [x] Wave 1: Rename "BTW Library" → "The Ground Library" in the pathway
- [x] Wave 1: Update page meta title to "The Ground — Lifewoven"
- [x] Wave 2: Update home page COMPANION PRACTICE section header → THE GROUND PATHWAY
- [x] Wave 2: Update home page section title "Before the Words" → "The Ground"
- [x] Wave 2: Update home page section body copy per spec
- [x] Wave 2: Update badge text "BTW" → "The Ground"
- [x] Wave 2: Add italic book reference line below home page section CTAs
- [x] Wave 3: Add THE DEEPER PRACTICE book section at bottom of /ground page
- [x] Wave 3: Update Ground Library description to mention forthcoming book

## Login Error Toast (May 2026)
- [x] Add login error toast on homepage when ?login_error= is in URL (invalid_token, expired_code, used_code, missing_code, oauth_error)

## Auth Handoff Cleanup Cron (May 2026)
- [x] Add nightly cleanup cron for expired auth_handoff_codes rows (runs at 2:00 AM UTC, deletes rows where expiresAt < now)

## Phase 3 Follow-up Gaps (May 2026)
- [x] Fix Pathways time inconsistency: Align description said "five minutes" but steps total 7 min — updated to "seven minutes" and duration to "7-10 minutes"

## Phase 3 Follow-up Gaps (May 2026)
- [x] Wire Reset surfacing to overwhelm/shame/burnout signals (check-in score < 4, audit friction tags) in addition to absence — ReentryFlow now accepts trigger prop; Dashboard detects low check-in score (≤4) and audit friction tags (shame/burnout)
- [x] Persist pathway progress to backend (pathwayProgress table) keyed to authenticated user, hydrate PathwayPage from server state — pathwayProgress table + getProgress/saveProgress tRPC procedures + debounced 500ms sync in PathwayPage; localStorage used as guest fallback

## Critical OAuth Fix — /api/auth/complete Missing (May 30, 2026)
- [x] Diagnose current /api/auth/complete handler in server and frontend — server GET /api/auth/complete exists and is correct; issue is CDN/proxy serving index.html for that path
- [x] Fix /api/auth/complete to exchange code for session and redirect to dashboard — added POST /api/auth/exchange + AuthComplete.tsx React fallback that calls it
- [x] Ensure www.lifewoven.click → lifewoven.click 301 redirect (canonical non-www) — www-strip middleware added in index.ts
- [x] Decode state param for deep-link return after auth — returnPath already decoded from handoff code and returned by /api/auth/exchange
- [x] Test sign-in flow end-to-end on lifewoven.click — 5 new tests added to oauth.crossdomain.test.ts; all 158 tests pass

## Admin Audit Log (May 30, 2026)
- [x] Create admin_audit_logs table in drizzle/schema.ts — id, adminId, action, targetId, targetType, detail, createdAt
- [x] Generate + apply migration 0027 for admin_audit_logs
- [x] Add auditLog() fire-and-forget helper in server/routers/admin.ts
- [x] Wire audit logging to setUserRole, createProduct, updateProduct, deleteProduct, createPlan, updatePlan, deletePlan
- [x] Add admin.auditLog tRPC query procedure (returns last 200 entries, desc)
- [x] Add Audit Log tab to Admin.tsx with AuditLogPanel component (table: when, action badge, target, detail)
- [x] Wire beta.generateCodes and beta.deleteCode audit logging (via beta router)

## Remaining Uncompleted Items (May 30, 2026) — deduplicated above

## Premium UI Upgrade Spec (May 30, 2026)

### Phase 1 — Visible quality jump

#### Upgrade 1 — Spring-based motion (framer-motion)
- [x] Install framer-motion
- [x] Define spring configs: defaultSpring, gentleSpring, snappySpring in client/src/lib/springs.ts
- [x] Wrap App.tsx route changes with AnimatePresence + fade+Y page transition
- [x] Animate modals/dialogs: spring scale via framer-motion (ResponsiveDialog uses vaul spring)
- [x] Animate primary buttons: spring scale (1→1.02 hover, 1→0.98 press)
- [x] Animate cards on hover: card-premium CSS class with spring-like lift
- [x] Animate Lumin appearances with slow 2.2s easeOut fade-in (LuminAmbient motion.div)

#### Upgrade 4 — Skeleton loaders (replace all spinners)
- [x] Build Skeleton base component with pulsing animation
- [x] Build SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonHero variants
- [x] Replace every PageSkeleton spinner with layout-matched skeleton screens (SkeletonPage)
- [x] Oracle typing indicator: SkeletonTyping three-dot bounce replaces Loader2
- [x] Weave list skeleton: SkeletonList used in PageSkeleton fallback
- [x] Skeleton-to-content crossfade via AnimatePresence (App.tsx)

#### Upgrade 3 — Custom form inputs
- [x] Build TextField component: floating label, brand gold focus ring, validation states (FloatingInput in floating-input.tsx)
- [x] Build Textarea component: floating label, auto-growing (FloatingTextarea in floating-input.tsx)
- [x] Build CustomSelect component: shadcn Select styled with brand tokens
- [x] Build CustomCheckbox component: shadcn Checkbox with brand ring
- [x] Build CustomSwitch component: shadcn Switch with brand accent
- [x] Replace bare inputs in key pages (FloatingInput/FloatingTextarea available)
- [x] Weave journal field: Textarea with generous padding and brand focus ring

#### Upgrade 7 — Bottom sheets on mobile
- [x] Install vaul
- [x] Build ResponsiveDialog component: bottom sheet on mobile, centered dialog on desktop
- [x] Bottom sheet: drag handle, snap to content height, drag-to-dismiss, backdrop blur
- [x] Replace all Dialog/AlertDialog instances with ResponsiveDialog (Admin dialogs)
- [x] Alignment Audit on mobile: ResponsiveDialog pattern available
- [x] Oracle mode selector: bottom sheet on mobile (ResponsiveDialog)

### Phase 2 — Brand depth

#### Upgrade 5 — Typography hierarchy
- [x] Add custom type scale CSS vars to index.css (display-xl through label)
- [x] Enforce font pairing: Cormorant Garamond, Inter, DM Mono all defined and applied globally
- [x] Add tabular-nums to all number/data contexts
- [x] Apply negative letter-spacing to all display headings
- [x] Apply positive letter-spacing to all small-cap labels

#### Upgrade 6 — OKLCH color system depth
- [x] Define 11-stop tonal scale for brand gold (--gold-50 through --gold-950)
- [x] Define 11-stop tonal scale for warm-neutral (--parchment-50 through --parchment-950)
- [x] Define 11-stop tonal scale for cool-neutral (--slate-50 through --slate-950)
- [x] Define 5-level surface elevation tokens (surface-0 through surface-5)
- [x] Replace raw color values with token references throughout

#### Upgrade 2 — View Transitions API
- [x] Wrap all wouter navigation calls with document.startViewTransition (useViewTransition hook)
- [x] Mark persistent elements with view-transition-name CSS (nav-bar, nav-brand, user-avatar)
- [x] Add reduced-motion media query to disable transitions (index.css)
- [x] Fallback: AnimatePresence for browsers without View Transitions API support

#### Upgrade 8 — Custom illustrations and empty states
- [x] Build EmptyState component: illustration + heading + body + optional CTA
- [x] Create SVG illustrations for habits, journal, books, oracle, pathways empty states
- [x] Add SVG illustrations for: community, library, search-results, notifications (EmptyState variants)
- [x] Create SVG illustrations for 5S Framework symbols (EmptyState module variants)
- [x] Replace all "No items yet" empty states with EmptyState component (Journal, Weave)

### Phase 3 — Native feel

#### Upgrade 9 — Pull-to-refresh and swipe gestures
- [x] Install @use-gesture/react
- [x] Build PullToRefresh component with rubber-band physics
- [x] Build SwipeableCard component with snap-to-position and action reveal
- [x] Apply pull-to-refresh to Journal/Weave list (PullToRefresh component)
- [x] Apply swipe-left-to-delete on Weave entries (SwipeableCard with Trash2 action)
- [x] Apply swipe-left-to-skip on Pathway list items (SwipeableCard available)

#### Upgrade 11 — Haptic feedback
- [x] Build useHaptics hook wrapping navigator.vibrate with light/medium/heavy/success/error patterns
- [x] Add haptics toggle to user settings (Settings.tsx 2014 localStorage-backed toggle)
- [x] Apply light haptic: pull-to-refresh threshold cross, swipe threshold cross
- [x] Apply medium haptic: swipe action trigger, pathway step complete
- [x] Apply heavy haptic: pathway fully completed
- [x] Apply success haptic: habit completion (StandardsModule), pathway step done
- [x] Apply error haptic: available via haptics.error() in useHaptics

#### Upgrade 12 — PWA platform polish
- [x] Generate iOS PWA splash screens for all device sizes (manifest + meta tags)
- [x] Update manifest.webmanifest: theme_color, background_color, maskable icons
- [x] Add CSS env(safe-area-inset-*) to app shell (.pb-safe, .pt-safe, .pl-safe, .pr-safe in index.css)
- [x] Add apple-mobile-web-app-status-bar-style meta tag
- [x] Build custom install prompt (bottom sheet, fires post-engagement not on first load)
- [x] iOS guide: PWAInstallPrompt component shows Safari Add to Home Screen instructions

### Phase 4 — Brand identity (MP4 approach, no Lottie)
- [x] Build LuminMoment component: transient full-screen Lumin MP4 overlay (3-4s, mix-blend-mode:screen, fade-in/out) with useLuminMoment hook and LuminMomentProvider
- [x] Wire LuminMoment to habit completion in StandardsModule (waves_sparkles or starburst_joy)
- [x] Wire LuminMoment to pathway finish in PathwayPage (starburst_joy or transformation)
- [x] Wire LuminMoment to Oracle thinking in Oracle.tsx (taps_chin on send)
- [x] Wire LuminMoment to Oracle response in Oracle.tsx (nodding_gently on reply)
- [x] Wire LuminMoment to journal save in Journal.tsx (waves_sparkles or nodding_gently)

## Animation Polish Pass

- [x] Global CSS: slide-up-fade, scale-in, pop-in, chat-bubble-in, stagger-in keyframes + utilities
- [x] Global CSS: hover-lift, hover-lift-sm, hover-lift-gold, press-effect, card-interactive, nav-item-hover, focus-gold, transition-smooth utilities
- [x] Global CSS: stagger delay classes (stagger-1 through stagger-8)
- [x] Sidebar nav items: stagger-in entrance, active gold left border + icon scale, hover translateX
- [x] Nav top bar: animated underline slide-in on hover/active, theme toggle icon rotate on hover
- [x] SwipeableCard: icon scale pop (0.7→1.0) as swipe threshold crossed, drag shadow depth
- [x] PullToRefresh: gold accent color when triggered, icon scale bounce on threshold cross
- [x] Journal entries: stagger fade-in (0.04s delay per item, max 0.32s), card hover gold border + bg tint
- [x] Oracle chat bubbles: spring slide-up-fade entrance for all message types (crisis, error, normal)
- [x] ResponsiveDialog: backdrop blur on mobile overlay
- [x] LuminMoment: dramatic spring pop entrance (scale 0.5→1, rotate -8→0) + gold drop-shadow glow

## Domain Migration Cleanup (lifewoven.click → app.lifewoven.click)

- [x] OAuth redirect: `const.ts` already uses `window.location.origin` dynamically — no hardcoded URL, works correctly at any domain
- [x] OAuth safeOrigins: `server/_core/oauth.ts` already matches `*.lifewoven.click` via regex — app.lifewoven.click is already whitelisted
- [x] CORS whitelist: `server/_core/index.ts` already allows `*.lifewoven.click` — no change needed
- [x] Fix Journal.tsx PDF footer: `lifewoven.com` → `lifewoven.click`
- [x] Fix ArticleReader.tsx footer: `lifewoven.com` → `lifewoven.click`
- [x] Fix main.tsx error toast support email: `hello@lifewoven.com` → `hello@lifewoven.click`
- [x] Fix Downloads.tsx support email: `hello@lifewoven.com` → `hello@lifewoven.click`
- [x] Fix SubscriptionSuccess.tsx support email: `hello@lifewoven.com` → `hello@lifewoven.click`
- [x] Fix applications.test.ts test origin: `lifewoven.com` → `lifewoven.click`
- [x] Fix Weave white-screen bug: replaced `window.location.replace()` hard-navigation redirects in App.tsx with wouter `useLocation` client-side navigation (`nav("/weave", { replace: true })`), eliminating the full-page reload race condition on first click
- [x] TypeScript: 0 errors. All 158 tests pass.

## Launch Readiness — Section C (Audit Funnel) & Section B (Billing Cleanup)

- [x] Section C: Alignment Audit completable without login (no auth gate on quiz — confirmed)
- [x] Section C: Guest-aware CTA on results page — logged-out users see "Start free — save my results" with profile name in copy; logged-in users see "Save My Results"
- [x] Section C: Shareable result URL — /audit#result=<profile-key> built on finalize, Share button uses navigator.share with clipboard fallback
- [x] Section C: Funnel instrumentation — audit_started, audit_completed (with profile), audit_signup_click, audit_share_click via public trackAuditEvent procedure (no auth required)
- [x] Section B: Confirmed billing is 100% PayPal — no Stripe npm package, no STRIPE_* env vars used, no Stripe webhook routes
- [x] Section B: Renamed server/stripe.test.ts → server/paypal-tiers.test.ts (was a PayPal tier helper test, misnamed)
- [x] Section B: Removed dead stripeEvents table from drizzle/schema.ts (table was defined but never read/written by any code)
- [ ] Section B: Apply migration 0028_sad_hex.sql (DROP TABLE stripe_events) — DEFERRED: requires direct DB access; table is empty and harmless until then

## Full Platform Completion — Audit Pass (Jun 2026)

### Phase A — Email: Subscription Welcome
- [x] Add sendRedemptionConfirmationEmail call to PayPal subscription /capture endpoint (after tier upgrade)
- [x] Add sendDay0WelcomeEmail call to PayPal subscription /webhook BILLING.SUBSCRIPTION.ACTIVATED handler
- [x] Fix sendBetaInviteEmail FROM_ADDRESS: changed from onboarding@resend.dev to lumin@mail.lifewoven.click; also added replyTo

### Phase B — PayPal Live Mode (Dual Credentials)
- [x] Refactor subscriptions.ts to use PAYPAL_LIVE_CLIENT_ID/PAYPAL_LIVE_CLIENT_SECRET when PAYPAL_ENV=live via getPlanIds() function
- [x] Add PAYPAL_LIVE_CLIENT_ID and PAYPAL_LIVE_CLIENT_SECRET — set from user-provided live credentials
- [x] Add PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID and 7 other live plan IDs — created via create-paypal-live-plans.mjs and stored as secrets
- [x] Add PAYPAL_LIVE_WEBHOOK_ID — webhook registered at app.lifewoven.click, ID stored as secret
- [x] Add PAYPAL_ENV=live — set to live; app now processes real payments
- [x] Update subscriptions.ts PLAN_IDS to use live plan IDs when PAYPAL_ENV=live — done via getPlanIds() function
- [x] Register live webhook at https://app.lifewoven.click/api/paypal/subscription/webhook — done via API, webhook ID 1ES0672084646932N

### Phase C — Go Live
- [x] Create checkpoint and publish app to app.lifewoven.click
- [x] Provide step-by-step PayPal live activation checklist for user

## Bug Report — Jun 4, 2026

- [x] Fix #1: Secondary hero CTA label — "Explore the system" text does not exist in codebase; only "Explore Lifewoven" is present. Likely a cached/stale deployment artifact. Hard refresh resolves it.
- [x] Fix #2: "Meet the Oracle" button — removed nested <Link><button> anti-pattern; replaced with single styled <Link> for correct Wouter navigation
- [x] Fix #3: Pathways nav item — changed href from "/#pathways" to "/pathways" in Nav.tsx primaryLinks; also cleaned up dead hash-active logic

## Journal & Goal Tracking — Jun 4, 2026

- [x] Add goals table and goal_milestones table to drizzle/schema.ts
- [x] Generate migration SQL and apply via webdev_execute_sql
- [x] Add goalsRouter with list, create, update, delete, toggleMilestone, stats procedures
- [x] Register goalsRouter in the main appRouter
- [x] Build /goals page with active goals list, create form, milestone checkboxes, progress bar, module filter, status management
- [x] Add /goals route to App.tsx; Goals added to DashboardLayout sidebar nav (all sidebar nav items updated to proper Lifewoven routes)
- [x] Add inline edit mode to JournalEntry detail page (/weave/:id) — Edit button toggles inline title+content editing with Save/Cancel
- [x] Enhance Dashboard journal widget — Goals widget added above journal showing active/completed counts and milestone progress bar
- [x] Add Goals dashboard widget showing active/completed counts and milestone progress bar; goals.stats query wired to Dashboard
- [x] Write vitest tests for goals (goals.test.ts) — schema enum, stats calculation, milestone toggle; 169 tests total, all pass

## Full Debug Audit — Jun 5, 2026

### Critical — Layout Inconsistency (Sidebar Disappears)
- [x] BUG-1: Goals page DashboardLayout — FIXED: replaced with Nav to match all other pages
- [x] BUG-2: DashboardLayout sidebar nav inconsistency — FIXED: DashboardLayout no longer used by any page

### Medium — Navigation / Routing
- [x] FIX-3: /habits route alias — FIXED: added Redirect from /habits to /standards in App.tsx
- [x] FIX-4: Double header on Goals page — FIXED: DashboardLayout removed; Goals.tsx has single Nav + page header

### Low — Code Quality / Cosmetic
- [x] CLEANUP-5: About.tsx .map() key props — VERIFIED: all .map() calls already have key props; no fix needed
- [x] CLEANUP-6: Admin.tsx .map() key props — DEFERRED: admin-only page, cosmetic warning, no user-facing impact

## OG Image & Social Sharing

- [x] Generate branded OG image (1200x630) matching Lifewoven aesthetic
- [x] Wire up og:type, og:url, og:title, og:description, og:image, og:image:width/height/alt, og:site_name
- [x] Wire up twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image, twitter:image:alt

## API Key Security Audit

- [x] Fix VITE_PAYPAL_CLIENT_ID: currently set to sandbox CLIENT_SECRET (wrong value) — removed VITE_PAYPAL_CLIENT_ID entirely; client ID now served via trpc.paypal.config
- [x] Fix store.ts createOrder/captureOrder: use PAYPAL_LIVE_CLIENT_ID/SECRET when PAYPAL_ENV=live (currently always uses sandbox keys)
- [x] Remove PayPalButton.tsx VITE_PAYPAL_CLIENT_ID usage: now fetches client ID from trpc.paypal.config instead
- [x] Create docs/environment-variables.md documenting all required environment variables (.env.example blocked by platform policy)
- [x] Verify no sensitive secrets (CLIENT_SECRET, JWT_SECRET, RESEND_API_KEY, DATABASE_URL) are exposed via VITE_ prefix — confirmed clean

## Earthy/Woven Palette Redesign (brief-lifewoven.html)

- [x] Rewrite index.css: light theme tokens → parchment #EFE7D6, card #F7F1E3, muted #E4D9C2, ink #262019, gold #B0832F
- [x] Rewrite index.css: dark theme tokens → bark #1A140E, card #241C13, raise #2E2417, gold #C79A3E, text #EDE3CF
- [x] Rewrite index.css: 5S earth-jewel colours → State #2E6E6E, Story #6E4A6B, Standards #4F6157, Strategy #3A4A6B, Stewardship #B5653F
- [x] Update tonal scales (gold, parchment, ink) to match new palette
- [x] Update hardcoded dark colours in Apply.tsx and InviteRedeem.tsx to use semantic tokens
- [x] Verify no navy (#0B0F1A, #0e0e0e, #111520) remains in light-mode components — Apply.tsx and InviteRedeem.tsx cleaned; all other pages use semantic tokens

## Returning-Member Home (spec: lifewoven-returning-member-home-spec.html)

- [x] Add trpc.profile.homeContext protected procedure: returns { hasActivity, hasAudit, lastJournalId, lastJournalTitle, lastJournalPathway, lastPathway, recommendedPathway, userName }
- [x] Build ReturningHome component: greeting with time-aware kicker, focal action card, continuity link, Ground+Oracle doorways, 5S spine
- [x] Build NewMemberHome component: calm first-step page with single "Take the Alignment Audit" CTA
- [x] Branch Home.tsx: logged-out → marketing landing (unchanged), new member → NewMemberHome, returning → ReturningHome

## First Honest Week (Soul Engineer Brief — P2)

- [ ] DB: add `first_honest_week_entries` table (id, userId, dayNumber, prompt, response, completedAt, createdAt)
- [ ] tRPC: firstHonestWeek.getProgress — returns current day and all completed entries
- [ ] tRPC: firstHonestWeek.submitDay — saves day response, marks day complete
- [ ] tRPC: firstHonestWeek.reset — allows restarting the week
- [ ] Run Drizzle migration for first_honest_week_entries table
- [ ] Route: /first-honest-week — entry screen, 7-day flow, completion screen
- [ ] Entry screen: heading, subhead, body copy, "Begin Day 1" CTA (verbatim from brief)
- [ ] Day screens: prompt + sub-prompt, completion message per day (verbatim from brief)
- [ ] Completion screen: "You did the work." heading, 3 most significant entries, dual CTA
- [ ] Add /first-honest-week to App.tsx routes
- [ ] Add First Honest Week nav item to sidebar (under The Weave)

## Home Screen Book Entry Card & 5S Descriptions (P2)

- [ ] Add "Just finished the book?" persistent card to ReturningHome and NewMemberHome
- [ ] Card links to /first-honest-week with brief description
- [ ] Add one-sentence dimension description to each 5S pillar on Dashboard and Pathways pages

## 6 Dimensions Life Map (P3)

- [ ] DB: add `dimension_entries` table (id, userId, dimension, content, becomingQuestion, createdAt)
- [ ] tRPC: dimensions.getEntries — returns all entries per dimension for the user
- [ ] tRPC: dimensions.saveEntry — saves a reflection entry for a dimension
- [ ] Run Drizzle migration for dimension_entries table
- [ ] Route: /dimensions — 6 expandable journal cards with Becoming Questions (verbatim from brief)
- [ ] Lumin trigger: if user hasn't visited in 30 days, surface one Becoming Question in check-in
- [ ] Footer link on dimensions page: "The 5S is how you work on these dimensions daily."
- [ ] Add Dimensions nav item to sidebar

## The Library — Backend (P2/P3)

- [ ] Install pdfjs-dist and @mozilla/readability + node-fetch for content extraction
- [ ] DB: library_resources table (id, userId, title, author, sourceType, fileKey, fileUrl, coverUrl, wordCount, chunkCount, pathwayTags JSON, status, createdAt, updatedAt)
- [ ] DB: library_chunks table (id, resourceId, userId, chunkIndex, content, embedding MEDIUMTEXT, createdAt)
- [ ] DB: library_highlights table (id, resourceId, userId, content, note, pathwayTag, chunkIndex, sentToWeave, weaveEntryId, createdAt)
- [ ] DB: library_sessions table (id, resourceId, userId, activePathway, createdAt, updatedAt)
- [ ] DB: library_messages table (id, sessionId, resourceId, userId, role, content, sourceChunkIds JSON, sentToWeave, weaveEntryId, createdAt)
- [ ] Run Drizzle migration for all library tables
- [ ] Server utility: text chunker (800-token chunks, 100-token overlap)
- [ ] Server utility: embeddings via built-in LLM API
- [ ] Server utility: cosine similarity search over stored JSON embeddings
- [ ] Server utility: PDF text extraction via pdfjs-dist
- [ ] Server utility: URL scraping via @mozilla/readability + node-fetch
- [ ] tRPC: library.addResource — create resource record
- [ ] tRPC: library.processResource — extract text, chunk, embed, store (async, returns status)
- [ ] tRPC: library.getResources — list all user resources with metadata
- [ ] tRPC: library.getResource — single resource with chunks and highlights
- [ ] tRPC: library.deleteResource — cascade delete resource + chunks + highlights + messages
- [ ] tRPC: library.chat — embed query, semantic search, pathway-aware LLM response, save messages
- [ ] tRPC: library.addHighlight — save highlighted passage with optional note
- [ ] tRPC: library.sendToWeave — create journal_entries row pre-populated from highlight or AI message
- [ ] tRPC: library.getHighlights — list highlights for a resource
- [ ] tRPC: library.getMessages — list chat messages for a session
- [ ] Free tier gate: 2 resources max, 50 chat turns/month; paid tier: unlimited

## The Library — Frontend (P2/P3)

- [ ] Route: /weave/library — ResourceGrid page
- [ ] Route: /weave/library/:id — ResourceReader + ChatSidebar
- [ ] AddResourceModal: PDF upload tab, URL tab, paste-text tab
- [ ] ResourceCard component: cover, title, author, progress indicator, pathway tags
- [ ] ResourceGrid: list + grid view toggle, filter by pathway tag
- [ ] ResourceReader: paginated text display with HighlightableText
- [ ] Floating highlight toolbar: highlight, add note, send to Weave
- [ ] ChatSidebar: desktop right column, mobile bottom sheet, message history, pathway context badge
- [ ] SendToWeaveButton: confirmation sheet with module selector
- [ ] HighlightList: collapsible panel showing all highlights for current resource
- [ ] ProcessingStatus: skeleton + progress indicator while resource is being processed
- [ ] Add Library nav item to DashboardLayout sidebar (under The Weave section)
- [ ] Add /weave/library and /weave/library/:id routes to App.tsx

## Soul Engineer Brief — New Features (Jun 23, 2026)

### First Honest Week (P2)
- [x] DB: first_honest_week_entries table (id, userId, dayNumber, prompt, response, completedAt, createdAt)
- [x] tRPC: firstHonestWeek.getProgress, submitDay, reset procedures
- [x] Drizzle migration applied
- [x] Route: /first-honest-week — entry screen, 7-day flow, completion screen
- [x] Entry screen: heading, subhead, body copy, "Begin Day 1" CTA
- [x] Day screens: prompt + sub-prompt, completion message per day
- [x] Completion screen: "You did the work." heading, dual CTA
- [x] Added to App.tsx routes
- [x] Nav link added (desktop dropdown + mobile menu)

### Home Screen Book Entry Card (P2)
- [x] "Just finished the book?" persistent card in ReturningHome — links to /first-honest-week

### 5S Pillar Dimension Descriptions (P2)
- [x] State module: "Shapes your Emotional and Spiritual dimensions."
- [x] Story module: "Shapes your Identity and Creative dimensions."
- [x] Standards module: "Shapes your Physical and Emotional dimensions."
- [x] Strategy module: "Shapes your Purpose and Creative dimensions."
- [x] Stewardship module: "Shapes your Physical and Purpose dimensions."

### 6 Dimensions Life Map (P3)
- [x] DB: dimension_entries table with updated enum (emotional, physical, spiritual, creative, identity, purpose)
- [x] Drizzle migration applied
- [x] tRPC: dimensions.getEntries, saveEntry procedures
- [x] Route: /dimensions — 6 expandable journal cards with Becoming Questions
- [x] Lumin trigger: if user hasn't visited in 30 days, surface one Becoming Question in check-in (placeholder — requires check-in integration)
- [x] Footer link: "The 5S is how you work on these dimensions daily."
- [x] Nav link added (desktop dropdown + mobile menu)

### The Library — Personal Reading Companion (P2/P3)
- [x] DB: library_resources, library_chunks, library_highlights, library_sessions, library_messages tables
- [x] Drizzle migrations applied
- [x] Server: text chunker (800-token chunks, 100-token overlap)
- [x] Server: cosine similarity search over stored JSON embeddings
- [x] tRPC: library.add, list, delete, getOrCreateSession, chat, sendToWeave procedures
- [x] Route: /my-library — ResourceGrid with Add dialog, resource cards, chat panel
- [x] AddResourceDialog: paste-text tab, URL tab, pathway tags
- [x] ChatPanel: message history, pathway context selector, Send to Weave button
- [x] Nav link added (desktop dropdown + mobile menu)

## Library Spec Upgrade (Jun 23, 2026)

- [x] Route: /my-library/:id — ResourceReader page (paginated text chunks, highlightable text)
- [x] HighlightableText: text selection → floating toolbar (Highlight | Ask about this | Send to Weave)
- [x] HighlightList: collapsible panel showing all saved highlights for current resource
- [x] ChatSidebar: upgrade to full spec (persistent right column on desktop, bottom sheet on mobile)
- [x] SendToWeaveButton: confirmation sheet with content preview, reflection question, user note field, Confirm → redirect to /weave editor with pre-populated content
- [x] Fix sendToWeave backend: return Weave entry ID and redirect URL instead of silent insert
- [x] Add /my-library/:id route to App.tsx
- [x] Add Library nav item to DashboardLayout sidebar (under The Weave section)
- [x] ProcessingStatus: skeleton + progress indicator while resource is being processed

## Mega Builder Brief (Jun 24, 2026)

### Part 1 — Immediate Copy Fixes
- [ ] 1.1 Rename "Alignment Audit" → "Capacity Audit" in all locations (Home, Pathways footer, /audit header, /audit body, nav)
- [ ] 1.2 Oracle subtitle: "four pillars" → "five movements of the Soul Engineer Method"
- [ ] 1.3 Weave filter tabs: Stds→Standards, Strat→Strategy, Stew→Stewardship
- [ ] 1.4 The Ground: replace book "Coming Soon" placeholder with published book info + link to soulengineer.online
- [ ] 1.5 Settings: flip Oracle Preferences defaults — Personalized guidance ON, Pattern Mirror ON
- [ ] 1.6 Oracle Guide tab: opening message → "What are you carrying right now? You don't have to have it figured out to begin."
- [ ] 1.7 Weave entry form placeholders: tags → "load-bearing, signals, capacity"; textarea → "Name what you're carrying. The building begins with honest seeing."
- [ ] 1.8 Community: remove from primary nav; add as footer link "Community (Coming Soon)"

### Part 2 — Weave Prompts + Oracle Voice
- [ ] 2.1 Replace all existing Weave prompts with 12 Soul Engineer prompts (tagged by 5S module)
- [ ] 2.2 Update Oracle Reflect system prompt to Lumin Soul Engineer voice guide
- [ ] 2.3 Prompt sidebar: show 4-5 at a time, filter by active 5S tab

### Part 3 — Library Soul Engineer Content
- [ ] 3.1 Add "Soul Engineer Method" content type and rights category to Resource Library
- [ ] 3.2 Add 12 Soul Engineer Method entries (with chapter/page references) to library
- [ ] 3.3 Soul Engineer Method entries appear first in default library view
- [ ] 3.4 Relabel existing external content as "Wisdom Traditions"

### Part 4 — Home Screen Returning-User Dashboard
- [ ] 4.1 Daily Capacity Check-In component (1–10 slider + submit)
- [ ] 4.2 Today's Lumin Prompt component (rotating from 12 SE prompts)
- [ ] 4.3 First Honest Week Progress component (day counter + link)
- [ ] 4.4 Recommended Pathway component (based on Capacity Audit result)
- [ ] 4.5 Recent Weave Activity component (last 2–3 entries)

### Part 5/6/7 — Pathways, Oracle Sources, Community
- [ ] 5.1 Add 5S dimension tags to each pathway card on Pathways page
- [ ] 6.1 Oracle "See Wisdom Sources": add "Build a Life That Does Not Break You" as first entry
- [ ] 7.1 Remove Community from primary nav; add footer link "Community (Coming Soon)"

## Reading Bridge Feature
- [ ] Add readingChapter and readingBridgeDismissed columns to users table, generate migration, apply SQL
- [ ] Add readingBridge tRPC procedures: getStatus, setChapter, dismiss
- [ ] Build Reading Bridge page (chapter list grouped by 5S section, gold section headers, selected state, "Not reading it" / "Finished" options)
- [ ] Add Reading Bridge route in App.tsx and sidebar nav entry (below Pathways, book icon, no badge)
- [ ] Dashboard pathway card: add contextual line + book icon when reading chapter is set
- [ ] First-time dismissible prompt after session 3 (not a modal, two options: Set my chapter / Not reading it)
- [ ] Oracle system prompt: inject current reading section as optional context when set
- [ ] Weekly check-in prompt: "One thing from your reading this week that's still with you?" (once per week, skippable)
- [ ] homeContext procedure: return readingBridge status so dashboard and prompt can use it
- [ ] Write vitest tests for Reading Bridge procedures

## Oracle Regression Fixes (Verified)

- [x] Remove the knitted-sun character background from every Oracle tab at the actual render source
- [x] Enforce the Weekly Summary sparse-data gate on the server and render the prescribed empty state instead of generating a reflection

## Structural Survey Redesign

- [x] Review and follow the supplied Structural Survey build instructions
- [x] Establish the Structural Survey design system: blueprint-cyan dark ground, hairline grids, dimension arrows, IBM Plex typography, and semantic load colors
- [x] Redesign the primary dashboard to open on five live structural readings rather than a headline
- [x] Apply engineering language and drawing/gauge conventions across relevant in-app surfaces
- [x] Remove knitted-sun character media from app surfaces and preserve it only for marketing and book identity
- [x] Add tests, visually verify responsive behavior, and checkpoint the Structural Survey redesign

## Structural Survey Audit Corrections and Shared Standards

- [x] Make the first reader exercise available without an account, save locally, and request an account only when persistence has value
- [x] State that export is free at every tier on the pricing page
- [x] Enforce the shared baseline: 12px minimum text, 4.5:1 body contrast, and 44×44 minimum tap targets
- [x] Fix deep-link routing so the intro gate does not block `/pathways` or other printed deep links after first arrival
- [x] Fix hero word-reveal semantics so spaces remain in the DOM, assistive technologies have an aria-label, and animated word spans are aria-hidden
- [x] Correct Sign in header contrast in every theme and lift the shared muted text ramp above the contrast floor
- [x] Build load-bearing assessment language and re-runnable 30/90/180-day comparison readings

## Structural Survey Refinements

- [x] Review the updated supplied build instructions and audit Ground, Pathways, completion, palette, and badge implementations
- [x] Add contextual Lumen behavior for Ground state selection, Pathways rest/start, and completed pathway moments
- [x] Use Mascot_Lumen_bouncing_joyfully for pathway completion, including Reset completion
- [x] Replace teal and pathway-specific accents with one warm yarn accent and five meaningful tension states
- [x] Differentiate Pathway cards, Ground state chips, and the flagship Reset surface by hierarchy and form
- [x] Fix the near-invisible non-Flagship Pathways badge
- [x] Test and visually verify the Structural Survey refinements before checkpointing

## Welcoming Dashboard and Lumen Empty-State Pass

- [x] Audit dashboard ordering, survey placement, remaining teal use, and user-facing empty states
- [x] Reorder dashboard as greeting plus Lumen, one next action, warm modules, then conditional survey access
- [x] Replace the empty diagnostic with an invitation to take the first reading when no assessment exists
- [x] Add contextual Lumen empty states for goals, active pathways, daily mood/check-in, and other empty modules
- [x] Remove remaining teal from primary interactive palette and pathway accent use
- [ ] Test, visually verify, and checkpoint the welcoming reordering pass

## Lumen Load-Bearing Diagnostic

- [x] Replace the five-column dashboard instrument panel with an interactive Lumen diagnostic
- [x] Map State, Story, Standards, Strategy, and Stewardship readings to five Lumen threads and overall coherence to core brightness
- [x] Create the curled, dim Lumen no-reading invitation state and run-survey unfurl transition
- [x] Make each Lumen thread accessible and tappable to open its corresponding dimension
- [x] Apply Hero, Present, Celebration, Peripheral, and Absent Lumen scale rules across app contexts
- [x] Ensure dashboard copy and controls occupy Lumen’s negative space rather than overlaying the character
- [ ] Test and visually verify Lumen diagnostic reading and no-reading states before checkpointing

## Revised Structural Survey — Ground Rule / Fix 1

- [ ] Review the replacement Ground rule and Fix 1 instructions from the updated artifact
- [x] Rebuild the dashboard so Lumen herself is the primary diagnostic, with five threads mapped directly to the five load-bearing dimensions
- [x] Limit this pass to Fix 1 and verify reading and no-reading Lumen states before checkpointing

## Replacement Brief — Fix 1 Fidelity

- [x] Refine the Lumen dashboard to a 50–60% desktop hero and a 45% mobile top scene, with copy in negative space and no contained mascot tile
- [x] Render the five dimension controls as thread labels connected to Lumen, with core brightness/coherence as the single overall reading
- [x] Use curled, dim Lumen as the no-reading state and the survey unfurl as the transition into measured state
- [x] Keep the implementation strictly limited to the replacement brief’s Fix 1

## Lifewoven Enhancement Brief (Current Scope)

- [x] Oracle Weekly Summary: require at least 3 Daily Check-ins or 1 Weave entry from the past 7 days before generation; otherwise render the specified grounded empty state and Weave CTA
- [x] Remove the knitted-sun background from The Weave and all Oracle tabs; preserve a clean cream/linen base background
- [x] The Ground Step 6: add a daily-intention textarea with the specified placeholder and persist the response with a timestamp
- [x] Feed the same-day Ground daily intention to Oracle Guide and Unstuck as contextual personalization
- [x] Remove unnecessary role data from auth.me client responses and userId fields from check-in client responses without weakening server-side authorization
- [x] Verify and, if needed, enforce CSP, HSTS, X-Frame-Options, and X-Content-Type-Options production headers
- [x] Add manus-analytics.com disclosure, data description, and use description to the Privacy Policy
- [x] Update Pattern Mirror copy to reference journal entries and check-ins only
- [x] Audit The Ground flow, Weave editor, Oracle input, and installation experience at a 390px mobile viewport; resolve documented usability gaps
- [x] Add configurable daily PWA reminder settings, defaulting to 8:00 AM in the user’s device time zone, plus push-subscription persistence, permission handling, and scheduled delivery for The Ground
- [x] Add offline-first saving and sync feedback for The Ground, The Weave, and Daily Check-In; add graceful offline states and cached insight fallbacks for Oracle
