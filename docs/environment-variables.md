# Environment Variables — Lifewoven

All environment variables are injected by the Manus platform at runtime. **Never hardcode secrets in source code.** Never commit a `.env` file with real values.

## Security Rules

| Rule | Explanation |
|------|-------------|
| Server-side only | Variables without `VITE_` prefix are only available in server code (`process.env.VAR`) |
| Client-safe only | Variables with `VITE_` prefix are bundled into the frontend build — visible to anyone who inspects the page |
| Never mix | A secret (API key, client secret, database password) must NEVER have a `VITE_` prefix |

## All Variables

### Database

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `DATABASE_URL` | Server | Yes | MySQL/TiDB connection string |
| `DRIZZLE_DATABASE_URL` | Server | Yes | Alias used by drizzle-kit for migrations |

### Authentication & Session

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `JWT_SECRET` | Server | **Yes** | Signs session cookies — never expose |
| `OAUTH_SERVER_URL` | Server | No | Manus OAuth backend base URL |
| `OWNER_OPEN_ID` | Server | No | Owner identity for notifications |
| `OWNER_NAME` | Server | No | Owner display name |
| `VITE_APP_ID` | Client | No | Manus OAuth public application ID |
| `VITE_OAUTH_PORTAL_URL` | Client | No | Manus login portal URL |

### Manus Built-in APIs

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `BUILT_IN_FORGE_API_URL` | Server | No | Manus Forge API base URL (LLM, storage, notifications) |
| `BUILT_IN_FORGE_API_KEY` | Server | **Yes** | Server-side Forge bearer token — never expose |
| `VITE_FRONTEND_FORGE_API_URL` | Client | No | Forge API URL for frontend (maps proxy etc.) |
| `VITE_FRONTEND_FORGE_API_KEY` | Client | No* | Frontend-scoped Forge key — limited permissions only |

*`VITE_FRONTEND_FORGE_API_KEY` is intentionally client-accessible. It has restricted scope (maps proxy, public APIs only) and is not the same as `BUILT_IN_FORGE_API_KEY`.

### PayPal — Sandbox

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `PAYPAL_CLIENT_ID` | Server | No | Sandbox app client ID |
| `PAYPAL_CLIENT_SECRET` | Server | **Yes** | Sandbox app secret — never expose |
| `PAYPAL_WEBHOOK_ID` | Server | No | Sandbox webhook ID for signature verification |
| `PAYPAL_PLAN_SEEKER_FOUNDING_MONTHLY_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_SEEKER_FOUNDING_ANNUAL_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_ORACLE_FOUNDING_MONTHLY_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_ORACLE_FOUNDING_ANNUAL_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_SEEKER_RETAIL_MONTHLY_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_SEEKER_RETAIL_ANNUAL_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_ORACLE_RETAIL_MONTHLY_ID` | Server | No | Sandbox plan ID |
| `PAYPAL_PLAN_ORACLE_RETAIL_ANNUAL_ID` | Server | No | Sandbox plan ID |

### PayPal — Live

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `PAYPAL_ENV` | Server | No | Set to `"live"` to activate live payments |
| `PAYPAL_LIVE_CLIENT_ID` | Server | No | Live app client ID |
| `PAYPAL_LIVE_CLIENT_SECRET` | Server | **Yes** | Live app secret — never expose |
| `PAYPAL_LIVE_WEBHOOK_ID` | Server | No | Live webhook ID for signature verification |
| `PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_MONTHLY_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_SEEKER_FOUNDING_ANNUAL_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_MONTHLY_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_ORACLE_FOUNDING_ANNUAL_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_SEEKER_RETAIL_MONTHLY_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_SEEKER_RETAIL_ANNUAL_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_ORACLE_RETAIL_MONTHLY_ID` | Server | No | Live plan ID |
| `PAYPAL_LIVE_PLAN_ORACLE_RETAIL_ANNUAL_ID` | Server | No | Live plan ID |

> **Note:** The PayPal client ID is returned to the frontend via `trpc.paypal.config` — no `VITE_PAYPAL_CLIENT_ID` is needed. The client ID is safe to expose (it is not a secret), but serving it from the server means the frontend automatically gets the right value for the current environment.

### Email

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `RESEND_API_KEY` | Server | **Yes** | Resend email API key — never expose |

### Cache

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `REDIS_URL` | Server | Yes | Upstash Redis URL for rate limiting |

### Analytics

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `VITE_ANALYTICS_ENDPOINT` | Client | No | Umami analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Client | No | Umami website tracking ID |

### App Branding

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `VITE_APP_TITLE` | Client | No | App display name shown in the UI |
| `VITE_APP_LOGO` | Client | No | App logo CDN URL |

### Stripe (Inactive — PayPal is the active payment processor)

| Variable | Side | Secret? | Purpose |
|----------|------|---------|---------|
| `STRIPE_SECRET_KEY` | Server | **Yes** | Stripe secret key — server-side only |
| `STRIPE_WEBHOOK_SECRET` | Server | **Yes** | Stripe webhook signing secret — server-side only |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | No | Stripe publishable key (safe to expose, but unused) |

## What Was Fixed

The following security issues were identified and resolved:

1. **`VITE_PAYPAL_CLIENT_ID` was set to the sandbox CLIENT_SECRET** — a secret key was accidentally placed in a client-visible variable. This variable has been removed from use. The PayPal client ID is now served via `trpc.paypal.config` instead.

2. **`store.ts` one-time purchases always used sandbox credentials** even when `PAYPAL_ENV=live`. Fixed to use `PAYPAL_LIVE_CLIENT_ID` / `PAYPAL_LIVE_CLIENT_SECRET` when in live mode, matching the behaviour of the subscription flow.

3. **No hardcoded secrets found** in any source file. All sensitive values are read from `process.env` on the server side only.
