# Lifewoven

**Lifewoven** is a premium personal transformation platform — a full-stack web application that helps people achieve lasting change by working on five interconnected dimensions of life simultaneously: State, Story, Standards, Strategy, and Stewardship. It also includes *Before the Words*, a contemplative formation companion for the book of the same name.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Core Features](#core-features)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Payments (PayPal)](#payments-paypal)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Most self-help tools address one dimension of change in isolation. Habit apps fix behavior but ignore belief. Meditation apps address emotional state but not strategy. Lifewoven treats all five dimensions as a single, interdependent system.

The platform is built for people who have already tried the books, the routines, and the apps — and still feel stuck. The core insight: lasting change requires alignment across State, Story, Standards, Strategy, and Stewardship simultaneously.

**Key differentiators:**
- The 5S Framework — an original, integrated model for whole-life transformation
- Oracle AI — three modes (Guide, Unstick, Reflect) powered by a built-in LLM
- Before the Words — a contemplative formation suite tied to the book release
- Adaptive Intelligence Layer — personalized language and pacing based on user profile
- Alignment Audit — a diagnostic entry point that routes users to their highest-leverage starting point

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite |
| **UI Components** | shadcn/ui, Radix UI primitives |
| **Backend** | Node.js, Express 4, TypeScript |
| **API Layer** | tRPC 11 (end-to-end type safety, no REST boilerplate) |
| **Database** | MySQL/TiDB via Drizzle ORM |
| **Auth** | Manus OAuth 2.0 (session cookies, `httpOnly`, `secure`, `sameSite=lax`) |
| **Payments** | PayPal (subscriptions, webhooks) |
| **AI** | Built-in LLM via `server/_core/llm.ts` |
| **Serialization** | SuperJSON (Dates stay Dates through the wire) |
| **Testing** | Vitest |
| **Fonts** | Cormorant Garamond (headings), Inter (body), DM Mono (code/data) |

---

## Project Structure

```
lifeos/
├── client/
│   ├── index.html              # Entry point, favicon, meta tags
│   └── src/
│       ├── pages/              # Page-level components (Home, Dashboard, modules, BTW, etc.)
│       │   ├── btw/            # Before the Words feature pages
│       │   ├── modules/        # 5S module pages (State, Story, Standards, Strategy, Stewardship)
│       │   └── pathways/       # Pathway pages (Align, Resonance, Uplift, Flow, Rhythms, Purpose, Reset)
│       ├── components/         # Reusable UI (Nav, DashboardLayout, UpgradeGate, etc.)
│       ├── contexts/           # ThemeContext, etc.
│       ├── hooks/              # Custom React hooks
│       ├── lib/trpc.ts         # tRPC client binding
│       ├── App.tsx             # Route definitions
│       ├── main.tsx            # React entry, providers
│       └── index.css           # Global styles, design tokens (OKLCH color system)
├── drizzle/
│   ├── schema.ts               # All database table definitions
│   └── *.sql                   # Generated migration files
├── server/
│   ├── _core/                  # Framework plumbing (OAuth, context, tRPC init, LLM, maps)
│   ├── routers/
│   │   ├── btw.ts              # Before the Words procedures
│   │   └── paypalOrders.ts     # PayPal one-time product purchase procedures
│   ├── paypal/
│   │   ├── paypal.ts           # PayPal create-order / capture-order handlers
│   │   ├── subscriptions.ts    # PayPal subscription handlers
│   │   └── webhook.ts          # PayPal webhook handler
│   ├── db.ts                   # Query helpers
│   ├── routers.ts              # Main appRouter (all sub-routers merged)
│   └── storage.ts              # S3 file storage helpers
├── shared/                     # Shared constants and types
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- A MySQL/TiDB database (connection string required)

### Installation

```bash
git clone <repository-url>
cd lifeos
pnpm install
```

### Development

```bash
pnpm dev
```

The app starts on `http://localhost:3000`. Vite HMR is active for the frontend; the Express server restarts on backend changes.

### Build

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

---

## Environment Variables

All secrets are injected by the Manus platform. Do not commit `.env` files. The following variables are required:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend) |
| `OWNER_OPEN_ID` | Platform owner identifier |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL (server) |
| `BUILT_IN_FORGE_API_KEY` | Bearer token for built-in APIs (server) |
| `VITE_FRONTEND_FORGE_API_KEY` | Bearer token for built-in APIs (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | Built-in API URL (frontend) |
| `PAYPAL_CLIENT_ID` | PayPal app client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal app client secret |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID for signature verification |
| `VITE_PAYPAL_CLIENT_ID` | PayPal client ID (frontend) |

---

## Core Features

### 5S Framework Modules

| Module | Path | Description |
|---|---|---|
| State | `/module/state` | Emotional alignment — daily mood check-in, resonance mapping |
| Story | `/module/story` | Belief and identity — reframe limiting beliefs, build new narratives |
| Standards | `/module/standards` | Habits and systems — habit stack, daily scorecard, streak tracking |
| Strategy | `/module/strategy` | Decisions and leverage — goal setting, decision frameworks |
| Stewardship | `/module/stewardship` | Energy, body, wealth, time — resource management |

### Pathways

Seven structured transformation journeys: Align, Resonance, Uplift, Flow, Rhythms, Purpose, Reset.

### Oracle AI

Three modes accessible at `/oracle`:
- **Guide** — general transformation guidance
- **Unstick** — targeted help when feeling blocked
- **Reflect** — journal reflection and pattern recognition

### Before the Words (BTW)

A contemplative formation suite tied to the *Before the Words* book:

| Feature | Path | Description |
|---|---|---|
| Landing | `/btw` | Entry point with quick-state routing |
| Ground Check | `/btw/ground-check` | 7-question inner posture diagnostic |
| Enter the Ground | `/btw/enter` | Morning Settling / Midday Return / Evening Release |
| Return to the Ground | `/btw/return` | 5 reset versions (30 sec, 2 min, Fear, Discouragement, Depletion) |
| The State You Enter | `/btw/state` | Name your inner posture before prayer/conversation/decision |
| Living as Heard | `/btw/living` | Prayer journal with Ground Guide AI (Seeker tier) |
| Thanking From There | `/btw/thanking` | Gratitude practice with realness rating |
| Words With Weight | `/btw/words` | Prayers, declarations, scripture — pinnable anchors |
| Closing the Gap | `/btw/closing` | Stats dashboard + weekly AI reflection (Seeker tier) |
| BTW Library | `/btw/library` | Contemplative formation texts and companion practices |

### Alignment Audit

Entry diagnostic at `/audit` — routes users to their highest-leverage 5S starting point.

---

## API Reference

All API calls use tRPC. The base URL is `/api/trpc`. Procedures are called as `trpc.<router>.<procedure>`.

### Auth Router (`trpc.auth.*`)

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `auth.me` | Query | Public | Returns current user or null |
| `auth.logout` | Mutation | Protected | Clears session cookie |

### Habits Router (`trpc.habits.*`)

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `habits.list` | Query | Protected | List user's habits |
| `habits.create` | Mutation | Protected | Create a new habit |
| `habits.logCompletion` | Mutation | Protected | Log a habit completion for today |
| `habits.todayLogs` | Query | Protected | Get today's completion logs |
| `habits.delete` | Mutation | Protected | Archive a habit |

### BTW Router (`trpc.btw.*`)

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `btw.saveGroundCheck` | Mutation | Protected | Save a Ground Check result |
| `btw.getGroundCheckHistory` | Query | Protected | Get past Ground Check results |
| `btw.savePracticeSession` | Mutation | Protected | Save Enter the Ground session |
| `btw.getPracticeSessions` | Query | Protected | Get practice session history |
| `btw.saveStateEntry` | Mutation | Protected | Save a State You Enter entry |
| `btw.savePrayerEntry` | Mutation | Protected | Save a Living as Heard prayer |
| `btw.getPrayerEntries` | Query | Protected | Get prayer journal entries |
| `btw.reflectOnPrayer` | Mutation | **Seeker+** | Ground Guide AI reflection on prayer |
| `btw.saveGratitudeEntry` | Mutation | Protected | Save a Thanking From There entry |
| `btw.saveWordEntry` | Mutation | Protected | Save a Words With Weight entry |
| `btw.getWordEntries` | Query | Protected | Get saved words |
| `btw.getStats` | Query | Protected | Get BTW usage statistics |
| `btw.generateWeeklyReflection` | Mutation | **Seeker+** | AI weekly reflection (Closing the Gap) |

### PayPal Orders Router (`trpc.paypalOrders.*`)

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `paypalOrders.getMyOrders` | Query | Protected | Get completed product orders for current user |
| `paypalOrders.reissueDownload` | Mutation | Protected | Re-issue a 72-hour download token for a purchased product |
| `paypalOrders.getMembershipStatus` | Query | Protected | Get current subscription tier and status |

---

## Database Schema

The database uses 21+ tables managed via Drizzle ORM. Key tables:

| Table | Purpose |
|---|---|
| `users` | User accounts with `membershipTier` (explorer/seeker/oracle), `paypalSubscriptionId` |
| `habits` | User habit definitions |
| `habit_logs` | Daily habit completion records |
| `journal_entries` | Journal entries with module/pathway tags |
| `oracle_conversations` | Oracle AI conversation history |
| `btw_ground_checks` | Ground Check diagnostic results |
| `btw_practice_sessions` | Enter the Ground session records |
| `btw_state_entries` | State You Enter entries |
| `btw_prayer_entries` | Living as Heard prayer journal |
| `btw_gratitude_entries` | Thanking From There entries |
| `btw_word_entries` | Words With Weight entries |
| `btw_weekly_reflections` | AI-generated weekly reflections |

### Schema Changes

1. Edit `drizzle/schema.ts`
2. Run `pnpm drizzle-kit generate` to produce migration SQL
3. Apply via the Manus database tool or `webdev_execute_sql`

---

## Authentication

Lifewoven uses Manus OAuth 2.0. No passwords are stored.

- Login redirects to the Manus OAuth portal
- Callback at `/api/oauth/callback` exchanges the code for a JWT session cookie
- Cookie flags: `httpOnly: true`, `secure: true` (production), `sameSite: "lax"`
- Session expiry: 30 days (set in `server/_core/oauth.ts` via `THIRTY_DAYS_MS`)
- Protected procedures use `protectedProcedure` — unauthenticated calls return `UNAUTHORIZED`
- Admin procedures use `adminProcedure` — non-admin calls return `FORBIDDEN`

---

## Payments (PayPal)

Three subscription tiers:

| Tier | Price | Features |
|---|---|---|
| **Explorer** | Free | Core 5S modules, Pathways, BTW practices |
| **Seeker** | $19/month | + Ground Guide AI, weekly AI reflection, Oracle full access |
| **Oracle** | $49/month | + All Seeker features, priority AI, advanced analytics |

**Webhook endpoint:** `POST /api/paypal/webhook`
Handles: `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `PAYMENT.SALE.COMPLETED`

**Test payments:** Use PayPal sandbox accounts (buyer/seller) from the [PayPal Developer Dashboard](https://developer.paypal.com).

---

## Security

| Control | Implementation |
|---|---|
| Rate limiting | 5 req/15 min on OAuth; 200 req/min on tRPC API |
| Session cookies | `httpOnly`, `secure` (conditional on HTTPS), `sameSite=lax` |
| Error responses | Stack traces stripped in production via tRPC `errorFormatter` |
| Body limit | 1 MB (prevents DoS via large payloads) |
| SQL injection | All queries use Drizzle ORM parameterized queries — no raw string interpolation |
| XSS | React escapes all output by default; no `dangerouslySetInnerHTML` |
| CSRF | `sameSite=lax` cookie + tRPC POST-only mutations |
| Secrets | All secrets injected via platform environment — never in code or git |
| npm audit | 0 critical, 0 high vulnerabilities (run `pnpm audit` before each deploy) |

---

## Testing

```bash
pnpm test              # Run all tests
pnpm test --watch      # Watch mode
pnpm test --coverage   # Coverage report
```

Test files live alongside server code: `server/*.test.ts`. Reference: `server/auth.logout.test.ts`.

---

## Deployment

Lifewoven is deployed via the Manus platform. To publish:

1. Ensure all changes are saved (checkpoint created)
2. Click **Publish** in the Management UI header

**Custom domain:** Configure in Settings → Domains in the Management UI.

**PayPal webhook:** Register `https://<your-domain>/api/paypal/webhook` in the [PayPal Developer Dashboard](https://developer.paypal.com) → Apps & Credentials → Webhooks, subscribing to `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, and `PAYMENT.SALE.COMPLETED`. Set `PAYPAL_WEBHOOK_ID` to the generated webhook ID.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow, code style, and pull request guidelines.
