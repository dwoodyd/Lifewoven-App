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
