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
- [ ] Mobile PWA manifest and service worker
- [ ] Email notifications for Oracle insights
- [ ] Live workshop scheduling and community events
- [ ] Course content delivery (video lessons, progress tracking)
- [ ] Habit streak notifications
- [ ] Weekly Oracle summary report
- [ ] Dark/light theme toggle
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
- [ ] Homepage: remove fake testimonials, replace with trust sections (Why LifeOS Exists, Founder Note, Built for Real Minds, How LifeOS Helps)
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
