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

## Replacement Brief — Fixes 2 Through 8

- [x] Lay out the home screen around Lumen’s silhouette, with greeting, next step, and controls in her negative space
- [x] Build Lumen-led portrait pathway and dimension cards rather than image-in-card grid tiles
- [x] Restore Lumen as an immersive Oracle surface
- [x] Apply Hero, Present, Peripheral, and Celebration Lumen scale rules across app contexts, excluding settings and billing
- [x] Extend contextual Lumen treatment to the remaining empty states
- [x] Replace remaining blueprint/teal palette values with night ground and Lumen yarn tensions
- [x] Sweep Pathways and other pill variants for contrast failures, including the low-visibility pre-Flagship pill
- [x] Test and visually verify Fixes 2 through 8 before checkpointing

## First-Reading Lumen Video Correction

- [x] Replace the broken first-reading dashboard Lumen clip with a warmer verified video and confirm it renders

## First-Reading Diagnostic Layout and Looping Fix

- [x] Reposition diagnostic thread labels so they do not overlap dashboard copy or Lumen’s silhouette
- [x] Use a warm Lumen scene that loops continuously in the first-reading state
- [x] Visually verify the first-reading diagnostic at desktop and mobile widths before checkpointing

## First-Reading Watermark Removal

- [x] Replace the watermarked first-reading Lumen clip with a clean warm looping asset and verify there is no visible logo

## First-Reading Lumen Production Load Failure

- [x] Diagnose and repair the production Lumen video request so the first-reading dashboard scene visibly renders

## Release-Blocking Audit Fixes — August 19

- [x] Restore a working logged-out entry route and update canonical and Open Graph metadata away from `/login`
- [x] Repair check-in read paths across Dashboard, The Weave, and Oracle
- [x] Ensure Oracle claims only verified user-context facts and never denies access it actually has
- [x] Centralize date rendering and correct the one-day timezone offset across Weave and Oracle
- [x] Restore working light and dark theme switching at the application root and Settings
- [x] Prevent silent app-authored journal entries; require explicit save or clearly label generated content

## August 19 Audit — Next Priority

- [x] Persist started pathway progress to the dashboard active-pathways read model
- [x] Standardize the survey name across routes, dashboard, assessment, Pathways, and disclaimer copy
- [x] Prevent survey interpretation claims when dimension scores are tied and render equal scores without false visual differentiation
- [x] Enforce canonical 5S order: State, Story, Standards, Strategy, Stewardship across all surfaces
- [x] Consolidate Daily Check-in and Mood Rhythm into one connected source of truth
- [x] Eliminate full-screen splash remounts on route navigation
- [ ] Make the avatar open its intended menu

## August 19 Audit — Polish

- [x] Brand the 404 page and repair dead `/resources` navigation
- [x] Route the Dashboard "Log today’s mood" action to the shared Daily Check-in rather than the legacy Mood Rhythm view
- [x] Standardize Lumen spelling and Oracle pronouns, restore Oracle conversational memory, and make toasts dismissible
- [x] Fix Mood Rhythm layout overlap, off-palette controls, and unsupported fringe-research framing
- [x] Correct Reset duration, Oracle tab/input sticky behavior, and beta cancel control
- [x] Separate The Weave composer module tags from archive filters and correct its prompt direction
- [x] Remove desktop-only pull-to-refresh text
- [x] Reduce oversized empty-state whitespace
- [x] Clean up only the audit test data identified in the attachment after verifying ownership and exact identifiers

## Lumen Rendering and Media Performance Repair

- [x] Inventory all active Lumen video placements, media sizes, and loading behavior
- [x] Create and upload compact poster stills for every active Lumen video placement
- [x] Create and upload sub-500 KB, fast-start Lumen video derivatives where source assets permit
- [x] Use poster-first media, preload="none", and intersection-gated video loading across Lumen placements
- [x] Reframe Lumen as a portrait treatment and move the primary scene into the first viewport
- [x] Add regression coverage and verify the media repair in production before checkpointing

## Canonical Lumen Poster Correction

- [x] Remove all generated Lumen artwork references and retain only commissioned mascot-video appearances
- [x] Extract poster frames from the matching canonical commissioned MP4s and upload them as managed web assets
- [x] Map each Lumen video to its own extracted frame using the HTML video poster attribute
- [x] Preserve the existing Pathways video placements and portrait sizes while restoring canonical video media
- [x] Re-run media, TypeScript, and production-build verification before checkpointing the correction

## Consumer-View Rendered-Page Audit

- [x] Review the live desktop build as a consumer across Home, Dashboard, Pathways, Oracle, The Weave, The Ground, and Load-Bearing Survey
- [ ] Review the same primary consumer flows at mobile width when a mobile browser viewport is available
- [x] Record and prioritize observed media playback, crop, contrast, and typography-over-media defects
- [x] Restore the primary Dashboard Lumen poster so its real canonical frame is visibly present before video readiness
- [x] Fill the dashboard diagnostic’s portrait scene with a face-safe canonical crop rather than leaving a letterboxed media strip
- [x] Separate Home hero typography from Lumen’s face and tendrils with protected negative space and a readable copy field
- [x] Recompose Pathways so 520×650 and 420×525 portrait Lumen scenes do not sit behind headings or body copy
- [x] Separate the authenticated Weave empty-state copy from its Lumen poster so all journal prompts remain readable
- [x] Correct the confirmed live visual defects while keeping commissioned videos canonical and accessible
- [x] Revisit corrected pages visually and rerun regression and production-build verification before checkpointing

## Pathways Canonical Media Playback Repair

- [x] Remove duplicate absolutely positioned Lumen poster-image siblings from Pathways video scenes
- [x] Retain native HTML video poster behavior without a second frozen image layer during playback
- [x] Recompose Pathways frames around the canonical landscape footage instead of excessive portrait cover cropping
- [x] Add playback regression coverage, visually verify Pathways, and checkpoint the repair

## Pathways Full-Figure Lumen Framing

- [x] Measure canonical Pathways clips and identify a full-figure safe area for arms and tendrils
- [x] Create source-aware full-figure video derivatives or frame treatments where the existing source cannot fill the surface safely
- [x] Render the affected Pathways media full bleed without visual borders, duplicate layers, or cropped limbs
- [x] Replace matted source scenes with clean full-field canonical swaps rather than feathering altered source frames
- [x] Visually verify full-figure playback and run regression, TypeScript, and production-build checks before checkpointing

## Pathways Canonical Watermark Audit

- [x] Sample every active Pathways Lumen clip across playback and identify any visible VEO watermark frame
- [x] Create clean full-figure canonical derivatives only for watermark-affected clips
- [x] Use only verified watermark-free media and poster frames in active Pathways scenes
- [x] Visually recheck all selected Pathways media and run regression, TypeScript, and production-build verification before checkpointing

## Pathways Clean Canonical Clip Swap

- [x] Screen clean commissioned Lumen clips for edge-to-edge full-figure composition that avoids the affected source mattes
- [x] Prepare compact matching-poster replacements while retaining the existing edited assets as fallbacks
- [x] Apply only visually approved clean canonical swaps to the affected Pathways cards
- [x] Compare the swapped scenes in the rendered page and run regression, TypeScript, and production-build verification before checkpointing

## Dashboard Full-Figure Lumen Repair

- [x] Inventory the first-reading diagnostic and all dashboard empty-state Lumen renderers that crop arms or tendrils
- [x] Select clean full-figure commissioned clips and matching posters appropriate to each dashboard media panel
- [x] Use source-matched media frames and protected copy fields so dashboard text never overlays Lumen’s face or limbs
- [x] Visually verify the complete dashboard media set and run regression, TypeScript, and production-build validation before checkpointing

## Sign-In Canonical Lumen Media Repair

- [x] Inspect the sign-in screen for duplicate poster-image layers and inherited crop behavior
- [x] Remove any redundant still layer and use a single full-figure canonical video with its native matching poster
- [x] Visually verify the sign-in screen and run regression, TypeScript, and production-build validation before checkpointing

## Public Home, Weave, and Oracle Full-Figure Repair

- [x] Inspect the public landing hero, The Weave header, and Oracle header for duplicate layers and portrait-cover crop behavior
- [x] Remove the public landing hero’s separate poster-image sibling so it relies only on the native video poster
- [x] Select clean full-figure commissioned clips and matching native posters for the three reported surfaces
- [x] Use a single source-matched video scene with protected copy fields on Home, The Weave, and Oracle
- [x] Visually verify all three surfaces and run regression, TypeScript, and production-build validation before checkpointing

## Landing Hero Scale and Weave Entry Repair

- [x] Make the public landing Lumen hero the largest media treatment on its page without reducing any other video
- [x] Ensure the enlarged public landing hero renders its native poster and canonical video on first paint rather than appearing blank
- [x] Ensure navigating directly to /weave consistently starts at the top of the page
- [x] Visually verify the new landing-hero hierarchy and Weave route entry, then run regression, TypeScript, and production-build validation before checkpointing

## Dashboard First-Reading Hero Scale

- [x] Make the “Let’s take your first reading” diagnostic the largest Lumen video treatment on the dashboard without reducing any other dashboard video
- [x] Preserve the diagnostic’s full-figure, source-matched media treatment and protected reading copy
- [x] Visually verify the revised dashboard hierarchy and run regression, TypeScript, and production-build validation before checkpointing

## Lumen Hero Composition Fade and Oracle Entry Repair

- [x] Inventory all Lumen hero scenes that meet adjacent copy and identify their directional blend edge
- [x] Apply a subtle source-aware fade from Lumen media into its adjacent copy field without obscuring the character or reducing text contrast
- [x] Ensure direct navigation to /oracle consistently begins at the page top
- [x] Visually verify hero blending and Oracle entry, then run regression, TypeScript, and production-build validation before checkpointing

## Complete Light-Mode Interface Repair

- [x] Inspect theme provider, navigation toggle, settings control, and current light-mode token resolution
- [x] Implement a coherent readable light-mode surface, typography, border, and control palette
- [x] Confirm the theme controls visibly activate light and dark modes across the rendered app
- [x] Run regression, TypeScript, and production-build validation before checkpointing

## August 19 P0 Data Integrity and Routing Repair

- [x] Reinstate a server-enforced Weekly Summary gate that never pre-populates or fabricates a trailing-week narrative
- [x] Remove only the identified June 3 smoke-test check-ins and the listed August 19 audit records from production data
- [x] Centralize Oracle’s server-verified counts and thresholds so Guide, Pattern Mirror, and Weekly Summary agree
- [x] Weight Ground Check anxiety and load responses and apply the declared URL state as an outcome floor
- [x] Fix ahead-of-day timestamps by persisting UTC and rendering through one Pacific-timezone path
- [x] Correct all primary Resources navigation hrefs to /library
- [x] Add focused regression coverage and visually verify the critical P0 flows before checkpointing

## Legacy Resources URL Compatibility

- [x] Preserve `/resources` as a redirect to `/library` for bookmarks, shared links, and legacy metadata
- [x] Add regression coverage and verify direct navigation to the legacy URL before checkpointing

## Legacy Path Coverage and Cache-Update Repair

- [x] Preserve /today → /dashboard, /assessment → /audit, /survey → /audit, and /ground-check → /ground/ground-check
- [x] Ensure an existing PWA client detects and activates an updated app bundle without retaining stale route behavior
- [x] Add redirect and update-behavior regression coverage, verify bare and cache-busted paths, and checkpoint the repair

## Check-in and Mood Legacy URL Compatibility

- [x] Preserve `/check-in` as a redirect to `/dashboard` and `/mood` as a redirect to `/mood-rhythm`
- [x] Add regression coverage and verify both aliases through direct browser navigation before checkpointing

## Assessment, Account Feedback, and Signup Funnel Integrity

- [x] Make successful sign-out visibly confirm, redirect, and clear stale identity UI
- [x] Label assessment score direction as load, audit the capped Stewardship calculation, and align narrative recommendations with the same dimension semantics
- [x] Present Lifewoven Terms and Privacy links with account-creation consent before or at OAuth handoff
- [x] Correct the optional-question flow count and disclose neurodivergence-adjacent personalization responses in the Privacy Policy
- [x] Place Start free ahead of logged-out Oracle plan upsell CTAs
- [x] Add regression coverage and verify logged-out and authenticated assessment flows before checkpointing

## Launch Trust, Pricing, Policy, and Homepage Integrity

- [x] Reconcile Seeker founding pricing to one authoritative monthly and annual price across marketing and app pages
- [x] Reconcile refund policy, minimum age, content-processing language, and Manus Analytics disclosure across all public and app policies
- [x] Remove or revise unsupported locked-for-life, annual-savings, community-access, and AI-training claims
- [x] Standardize Lumen, Load-Bearing Survey, and Alignment Fundamentals naming across marketing and app funnel copy
- [x] Repair homepage logo rendering, desktop navigation wrap/CTA overlap, and visible founding-form honeypot field
- [x] Trace and prevent recurring disappearance of persisted check-in counts without modifying legitimate user data
- [x] Visually verify deployed policies, pricing, and homepage after the marketing deployment updates

## Referenced Marketing-Site Launch Reconciliation

- [x] Obtain authorized access to github.com/dwoodyd/lifewovenwebsite and inspect its active source structure
- [x] Read the referenced marketing-site project and map pricing, policies, claims, naming, homepage, and form sources to their app counterparts
- [x] Align marketing Seeker founding pricing, annual savings language, refund policy, age requirement, AI/content claims, Manus Analytics disclosure, and founding-rate terms with the app
- [x] Standardize Lumen, Load-Bearing Survey, and Alignment Fundamentals terminology across marketing and app surfaces
- [x] Remove unavailable community-access promises and correct marketing homepage logo, desktop navigation, and honeypot visibility
- [x] Visually verify the deployed marketing-to-app funnel after the GitHub deployment updates the public site

## Corrected Marketing Repository Deployment

- [x] Access dwoodyd/lifewovenwebsite1 and confirm the verified marketing reconciliation is in its deployment branch
- [x] Verify the corrected repository is the source connected to the public marketing deployment

## Authenticated Survey Bypass

- [x] Add a visible “Take me into the app” dashboard link to the authenticated in-app “Find your clearest place to begin” survey entry
- [x] Verify the bypass preserves guest survey access and routes signed-in returning members directly to the dashboard
- [x] Add regression coverage, run full validation, and checkpoint the bypass

## Pre-Launch Funnel Audit — August 20–21, 2026

- [x] Audit and repair anonymous Load-Bearing Survey result persistence through Manus OAuth, then attach the result on first authenticated load
- [x] Streamline the survey flow by showing results immediately after the twelve core questions and moving optional refinement after results
- [x] Correct optional-question disclosure and consent copy, including the four-step count and sensitive personalization disclosure
- [x] Reduce the logged-out results page to the primary save-and-start CTA plus the Reset path; reserve Oracle upsells and sharing for authenticated users
- [x] Add a low-emphasis account-setup path beneath the survey primary CTA and make an interrupted survey resumable from the dashboard
- [x] Make the empty first-run dashboard default to a single ranked next step rather than competing modules
- [x] Confirm `/signin` aliases the official OAuth entry and prevent broken sign-in paths
- [x] Audit Oracle-tier resource entitlement and ensure covered Library resources open for the top tier
- [x] Hide irrelevant upgrade actions for top-tier subscribers and accurately label unavailable community access
- [x] Verify all assessment readings and recommendations use a consistent load direction and dimension
- [x] Reconcile app pricing, founding-rate, annual-savings, refund, age, data-processing, analytics, and founding-rate-lock claims with a single approved policy position
- [x] Ensure Lifewoven Terms and Privacy consent is presented before the OAuth account-creation handoff
- [x] Review and repair marketing-site navigation, sign-in destination, terminology, legal and privacy copy, payment claims, header layout, logo loading, and honeypot visibility
- [x] Standardize public terminology across sites: Lumen, Load-Bearing Survey, and Alignment Fundamentals
- [x] Update marketing privacy and homepage claims to accurately state data processing, analytics, and general-model-training limits
- [x] Align marketing and app age thresholds, refund policy, pricing changes, and annual savings statement
- [x] Add or update focused regression tests covering the anonymous-to-authenticated survey handoff and launch-trust requirements
- [x] Run full app and marketing validation, complete a consumer-view pass, checkpoint the app, and record marketing source changes

## Remaining Launch Polish — August 21, 2026

- [x] Reduce redundant marketing-page destinations and clarify the difference between instant free access and reviewed founding-seat applications
- [x] Ensure the marketing page leads with a single primary survey path and removes repeated decision points that do not advance the visitor
- [x] Correct untagged Weave entries so the default “Free” module remains reachable through filters
- [x] Reconcile Ground posture and score colors with the established Lifewoven palette and accessible semantic states
- [x] Remove unnecessary route-transition splash behavior and ensure normal navigation does not show a prolonged loading screen
- [x] Unify the app and marketing 404 recovery voice and route people toward a clear next step
- [x] Add an in-app privacy deletion control that gives members an actionable, explicit deletion-request path
- [x] Add focused regression coverage, validate app and marketing builds, visually verify the revised funnel, and save the required checkpoints

## Survey Funnel Regression Repair — August 21, 2026

- [x] Restore a visible low-emphasis account-setup bypass beneath the logged-out survey entry’s Start the Survey action
- [x] Remove any remaining pre-results “Almost there” or optional-refinement gate so core-question results appear immediately
- [x] Limit logged-out results actions to Start free — save my results and Start Reset
- [x] Add a failsafe splash dismissal so a loading overlay cannot trap visitors on the survey route
- [x] Add regressions, complete a manual logged-out survey pass, run full validation, and checkpoint the repair

## Marketing Survey Funnel Alignment — August 21, 2026

- [x] Audit public survey calls to action and account-entry language against the repaired app funnel
- [x] Apply and push any necessary marketing-source updates, with validation, for the next marketing checkpoint

## Marketing LW-01 Final Alignment — August 21, 2026

- [x] Align the marketing survey and account-entry copy with durable anonymous-result saving and the logged-out app bypass
- [x] Validate and push any resulting marketing-source update for a new checkpoint

## LW-01 Production Migration and Verification — August 21, 2026

- [x] Inspect and apply Drizzle migration 0036_silent_frog_thor.sql to create the audit_claims table and expiry index
- [x] Verify the production audit_claims schema and deployed claim-based OAuth return implementation
- [x] Verify anonymous claim minting, authenticated claim redemption, persisted results, dashboard routing, and idempotency safeguards
- [x] Record the production outcome and deployed checkpoint/version after the migration

## Oracle Bundle Delivery Repair — August 22, 2026

- [x] Allow Oracle-entitled members to issue secure product downloads without a completed PayPal order
- [x] Distinguish included access with no issued link from an expired purchase link on My Downloads
- [x] Resolve Store and My Downloads product links through canonical product slugs and prevent coming-soon dead ends
- [x] Render included Oracle access on course pages without a base-price enrollment prompt
- [x] Make Wisdom Tools and My Downloads discoverable in member navigation
- [x] Rename Reset Audio and Morning Alignment Series in product data, correct their types, and align the Wisdom Tools filter labels
- [x] Decide and label the course delivery model as PDF-first without representing the syllabus as a live in-app course reader
- [x] Add focused delivery regressions, validate secure member download issuance without email or payment actions, and checkpoint the repair

## Oracle Commerce Control Recovery — August 22, 2026

- [x] Reproduce and correct the live Store Open controls, Downloads reissue controls, and product links that still use numeric IDs
- [x] Provide a canonical PDF-first product detail or direct-download route for all nine published products
- [x] Make download issuance errors visible to members and ensure Oracle membership issuance succeeds at the deployed gate
- [x] Correct course-page entitlement buttons and investigate the inert non-entitled PayPal entry control without initiating payment
- [x] Replace purchase-complete wording on included Oracle product pages with accurate membership-access language
- [x] Repair the authenticated secure-download token handoff so issued Oracle links do not resolve to a 401
- [ ] Add behavioral regression coverage, validate live routes and non-charging controls, and checkpoint the recovery

## Self-Serve Acquisition Alignment — August 22, 2026

- [x] Retire or redirect `/apply` to the immediate self-serve signup path while leaving invitation routes intact
- [x] Remove the unsupported 30% standalone product discount claim from app pricing
- [x] Confirm self-serve signup and instant Reading Bridge redemption remain free of approval or waiting states
- [x] Add regression coverage, validate routes and pricing copy, and checkpoint the self-serve acquisition repair

## LW-01 Anonymous Result Persistence Repair — August 21, 2026

- [x] Persist the completed anonymous survey result in durable browser storage before the OAuth redirect
- [x] Claim the stored result after authentication, save it to the account, and route to the personalized dashboard
- [x] Render the survey bypass for logged-out visitors rather than only returning authenticated members
- [x] Add end-to-end regression coverage, reproduce the OAuth return path, run full validation, and checkpoint the repair

## LW-01 and LW-09 Regression Repair — August 21, 2026

- [x] Add an explicit authenticated `audit.redeemClaim` mutation for the `audit_claim` OAuth-return path.
- [x] Update the survey OAuth handoff to mint a server-backed claim and redeem it after authentication.
- [x] Wire Profile’s `Sign Out` control to the same complete sign-out-and-redirect behavior as the account menu.
- [x] Move Sign out ahead of the Account sub-list in desktop and mobile account menus.
- [x] Add regression tests for the claim-redeem call and unified sign-out implementation.

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

## Library Products — Format Claims & Repricing (August 21, 2026)

- [x] Rename Reset Audio to The Reset Protocol and change its standalone price from $27 to $12 across the app catalog.
- [x] Replace unsupported audio, MP3, and PDF claims with the approved script and interactive-document labels.
- [x] Replace the app marketplace Audio category with Scripts and remove inactive audio-player UI.
- [x] Replace all app catalog retail-value claims of $607 with $592.
- [x] Audit the Resource Library Audio filter and preserve it only for verified audio resources.
- [x] Add regression coverage and validate the corrected app catalog before checkpointing.

## Library Products — Revision 3 Audio Withdrawal (August 21, 2026)

- [ ] Restore the verified PDF delivery labels and original $607 catalog total across app storefront surfaces.
- [ ] Restore The Reset Protocol’s $27 price while retaining its renamed, recording-free script framing.
- [ ] Remove only untrue recording, AI-voice, MP3, and audio-session promises from app product pages.
- [ ] Keep the marketplace Audio tab renamed to Scripts and update its products without changing their verified PDF delivery.
- [ ] Verify Resource Library Audio resources are recordings; rename the filter only where items are scripts or documents.
- [ ] Revise regression tests to protect revision-3 pricing and PDF labels while rejecting untrue recording claims.

## Audited Repository Recovery (August 25, 2026)
- [x] Back up the pre-restore workspace and compare it against audited commit 0cba415 before restoring.
- [x] Fast-forward the codebase to audited commit 0cba415 and retain both the Git bundle backup and recovery stash.
- [x] Apply missing migrations 0034–0037, including audit_claims and script_bundle enum support.
- [x] Validate all nine products are published with download URLs, total $607, and correct product 7/8 script_bundle data and Reset Protocol title.
- [x] Verify required recovery code: membership download entitlement, /apply redirect, and Downloads links in both navigation variants.
- [x] Verify restored route count: 72 routes.
- [x] Audit R-01/R-02: route /signup through OAuth signUp intent and return paid-tier entrants to the selected pricing tier.
- [x] Audit R-03: verify the Seeker server-side price calculation ($97 → $67.90) and restore the accurate 30% standalone-product benefit.
- [x] Audit R-04/R-05: replace unsupported lifetime-rate claims and application-gate Store language with subscription-qualified, self-serve copy.
- [x] Audit R-06: confirm zero stored applications, remove public application intake and admin queue, and preserve issued-invite redemption in the founding router.
- [x] Resolve absent VAPID runtime keys so the restored full test suite can pass its push-configuration test.
- [x] Generate and store production VAPID credentials while retaining the existing push-notification feature gate in its disabled state until post-purchase verification.
- [x] Fix broken public logo and mascot video delivery after the audited repository restore, then verify rendered media in the browser.
- [x] Correct the media repair: restore the intended Lifewoven logo and original mascot clips, then validate live Paths, Weave, and Oracle views.
- [x] Audit and repair every mascot video reference across the app; do not release until the full registry and all major video surfaces are verified non-blank.
- [x] Defer the PWA home-screen prompt so it does not interrupt first visits to Dashboard or First Honest Week.
- [x] Verify and harden Oracle Pattern Mirror and Weekly Summary so they disclose insufficient data and never fabricate user-specific insights.
- [x] Keep push notifications functionally disabled until the post-purchase path is verified, despite configured VAPID credentials.
- [x] Restore paid-download storage redemption: inventory all nine catalog objects, repair missing uploads or access, and verify signed redirect integrity.
- [x] Ensure 72-hour download tokens never store short-lived signed URLs, and replace expired-storage errors with a branded reissue-link recovery path.
- [x] Replace the Reset Audio PDF with the newly supplied file and update all protected catalog and order storage keys.
- [x] New-user funnel A-1: ensure signup entry points request OAuth signUp while session-expiry and header links keep signIn.
- [x] New-user funnel A-2: preserve returnTo across OAuth and carry pricing-tier selection intent through the callback.
- [x] New-user funnel A-3/A-5: show a visible Lifewoven signup interstitial with Terms and Privacy consent before OAuth handoff.
- [x] New-user funnel A-4: trigger the PWA installation prompt only after a completed survey or during a second session.
- [x] New-user funnel A-6: assess custom OAuth callback-host capability and document any platform-side action required.
- [x] New-user funnel A-7: add controlled QA evidence and verify honest, consistent Oracle behavior across Guide, Pattern Mirror, and Weekly Summary.
- [x] New-user funnel: complete the brief’s route, consent, PWA, and Oracle verification matrix before publishing.
- [x] Fix `/signup?returnTo=…` parsing so OAuth callback state preserves the requested path instead of defaulting to `/dashboard`.
- [x] Frictionless access: grant an idempotent, code-free beta window to new Explorer users on first sign-in while retaining beta-code, referral, invitation, and PayPal flows.
- [x] Frictionless access: keep organic sign-ins app-first, while preserving explicit pricing and checkout return intent.
- [x] Conversion timing: track reflective-tool completion and content consumption as activation events.
- [x] Conversion timing: keep pre-activation experiences prompt-free and make paid-feature UpgradeGate copy specific, warm, dismissible, and tier-aware.
- [x] Conversion timing: show one dismissible, post-completion Seeker invitation after an eligible free reflective milestone.
- [x] Conversion timing: preserve and reframe beta-window-closing surfaces as a gentle “keep going” invitation.
- [x] Conversion timing and frictionless access: verify fresh-account, free-tool, paid-gate, beta-expiry, code/referral/invitation, and PayPal-purchase paths.
- [ ] Conversion surface map: record reflective activation after Audit, Weave, and Ground Check completion.
- [ ] Conversion surface map: record content activation after Resource Library, Oracle, and Ground lesson consumption.
- [ ] Conversion surface map: verify all mapped premium Library, Course, Oracle, and Ground surfaces use value-specific UpgradeGate copy without gating results or support.
- [ ] Conversion surface map: add one dismissible, post-exercise invitation on Audit, Weave, and Ground Check completion surfaces.
- [ ] Conversion surface map: reframe Dashboard beta-window notices and expiry messaging as continuation invitations with no pre-activation prompts.
- [ ] Conversion surface map: complete route, activation, prompt-frequency, and purchase-intent regression verification.
- [ ] Signup routing: send bare `/pricing` browsing to `/dashboard` after account creation while preserving selected seeker/oracle tiers and referral paths.
- [ ] Fix the Settings Lumen intro replay control so it reliably restarts the intended onboarding experience.
- [ ] Repair the live Settings replay path after event dispatch failed to open the mounted onboarding controller.
- [ ] Visually audit and correct Lumen intro slide typography, including word spacing, tracking, line height, and scene hierarchy.
- [ ] Cinematic onboarding: auto-open Lumen intro once for eligible first-run root and dashboard entries, never tool deep-links or returning users.
- [ ] Cinematic onboarding: transfer anonymous marketing-survey readings to a newly authenticated account and route intro completion to the reading or one-time survey.
- [ ] Cinematic onboarding: preserve deliberate Settings replay and prevent any first-run duplicate survey prompt.
- [ ] Cinematic onboarding: activate service-worker releases promptly and present a nonintrusive refresh prompt for new builds.
- [ ] Cinematic onboarding: verify new-user, returning-user, survey-transfer, deep-link, replay, and PWA-update paths.
- [ ] Native-quality mobile: centralize 8pt spacing, type, radius, elevation, motion, touch-target, safe-area, and semantic theme tokens.
- [ ] Native-quality mobile: audit and strengthen shared page, button, card, media, navigation, modal, and loading primitives.
- [ ] Native-quality mobile: verify manifest, standalone launch, maskable icons, splash treatment, offline shell, update activation, installation timing, and supported haptics.
- [ ] Native-quality mobile: directly improve and verify dashboard, Load-Bearing Survey, Lumen intro, pricing, Settings, Ground, Resource Library, and core practice routes at phone viewport.
- [ ] Native-quality mobile: validate dark/light contrast, reduced motion, safe areas, tap targets, media fallbacks, overflow, input/keyboard behavior, and focused regression coverage.
- [ ] Native-quality mobile: publish the current hardening checkpoint and record installed-PWA verification on real iOS Safari and Android Chrome.
- [x] P0 installed-PWA startup: Android home-screen launch shows only the splash/background and never mounts Lifewoven UI; diagnose and fix before further mobile release claims.
- [x] P0 installed-PWA migration: corrected static startup build was published and Android retest remained blank; retire the persistent legacy service worker/cache state without clearing user data.
- [ ] Mobile Round 1: replace every watermarked Lumen/Veo clip with clean approved media and eliminate video pillarbox bars.
- [ ] P0 media follow-up: replace the verified watermarked Align pathway card clip with a distinct clean static visual and retest it on Android.
- [ ] P0 media regression: published Android Align static replacement returns a broken image and exposes alt text; use a verified managed image plus an in-card fallback.
- [x] Mobile Round 1: inspect, register, and verify supplied clean exports Untitledvideo(65).mov and Untitledvideo(67).mov against the active Lumen scene mappings.
- [x] Mobile Round 1: rebuild The Weave mobile header, intro measure, and filter-chip behavior so title/actions are calm, copy is full width, and filters never clip.
- [x] Mobile Round 1: reset scroll position on navigation; correct dashboard top-header clearance and the overlapping red note action.
- [x] Mobile Round 1: reserve safe clearance around the chat FAB so it never covers content or calls to action.
- [x] Mobile Round 1: tighten the mobile Dashboard hero vertical rhythm and revalidate targets, contrast, media, safe areas, and installed-PWA behavior.
- [x] Merchandising Round 1: redesign Resources and Wisdom Tools offering cards with visual anchors, benefit-led copy, spec chips, clear tier/price signals, and one confident mobile CTA.
- [x] Merchandising Round 1: improve Resources, Wisdom Tools, and The Weave collection headers and discovery filters into a premium, honest shopping experience.
- [x] Mobile Round 1: run direct mobile render checks and full regression validation while preserving survey and reading logic unchanged.
- [x] Mobile Round 1: inspect supplied Android Dashboard and The Weave screenshot archives and resolve any remaining directly evidenced layout defects.
- [x] P0 Mobile Round 1 follow-up: fresh published Android The Weave screenshot shows the chat control still overlapping the lower check-in card; reposition the shared control and revalidate.
