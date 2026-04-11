# Contributing to Lifewoven

Thank you for your interest in contributing to Lifewoven. This document covers the development workflow, code standards, and pull request process.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Adding a Feature](#adding-a-feature)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Design Principles](#design-principles)
- [Security Guidelines](#security-guidelines)

---

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+
- A MySQL/TiDB database instance

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd lifeos

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
# Copy the example env file and fill in your values
cp .env.example .env

# 4. Apply database migrations
pnpm drizzle-kit generate
# Then apply the generated SQL via your database tool

# 5. Start the development server
pnpm dev
```

The app runs at `http://localhost:3000`. Vite HMR is active for frontend changes; the Express server auto-restarts on backend changes.

---

## Project Conventions

### The Four Touch Points

Every feature in Lifewoven follows the same four-step build loop:

1. **Schema** — Add or modify tables in `drizzle/schema.ts`, run `pnpm drizzle-kit generate`, apply the migration SQL.
2. **DB helpers** — Add query helpers in `server/db.ts` (return raw Drizzle rows, no business logic).
3. **Procedures** — Add or extend tRPC procedures in `server/routers.ts` or a sub-router in `server/routers/`.
4. **UI** — Build the frontend in `client/src/pages/` using `trpc.*.useQuery/useMutation`.

Do not skip steps or combine them. Schema changes that are not migrated will cause runtime errors.

### File Placement

| What | Where |
|---|---|
| New page | `client/src/pages/FeatureName.tsx` |
| Reusable component | `client/src/components/ComponentName.tsx` |
| New router (>150 lines) | `server/routers/feature.ts` |
| DB query helpers | `server/db.ts` |
| Shared types/constants | `shared/` |
| Static assets (images, etc.) | Upload via `manus-upload-file --webdev`, use CDN URL — never store in `client/public/` |

### Router Size Limit

Keep router files under 150 lines. Once a router grows beyond this, split it into `server/routers/<feature>.ts` and import it into `server/routers.ts`.

---

## Adding a Feature

### Backend

```ts
// server/routers/myFeature.ts
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const myFeatureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    // ... query logic
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      // ... insert logic
    }),
});
```

Then wire it into `server/routers.ts`:

```ts
import { myFeatureRouter } from "./routers/myFeature";

export const appRouter = router({
  // ... existing routers
  myFeature: myFeatureRouter,
});
```

### Frontend

```tsx
// client/src/pages/MyFeature.tsx
import { trpc } from "@/lib/trpc";

export default function MyFeature() {
  const { data, isLoading } = trpc.myFeature.list.useQuery();
  const utils = trpc.useUtils();

  const create = trpc.myFeature.create.useMutation({
    onMutate: async (newItem) => {
      // Optimistic update for instant feedback
      await utils.myFeature.list.cancel();
      const prev = utils.myFeature.list.getData();
      utils.myFeature.list.setData(undefined, (old) => [...(old ?? []), { ...newItem, id: -1 }]);
      return { prev };
    },
    onError: (_, __, ctx) => {
      utils.myFeature.list.setData(undefined, ctx?.prev);
    },
    onSettled: () => {
      utils.myFeature.list.invalidate();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* UI */}</div>;
}
```

Register the route in `client/src/App.tsx`:

```tsx
import MyFeature from "@/pages/MyFeature";
// ...
<Route path="/my-feature" component={MyFeature} />
```

---

## Code Style

### TypeScript

- Strict mode is enabled. All types must be explicit — no `any` unless absolutely necessary and commented.
- Use `z.object(...)` for all tRPC input validation. Never trust unvalidated user input.
- Prefer `const` over `let`. Avoid `var`.

### React

- Never call `setState` or navigation functions in the render phase — wrap in `useEffect`.
- Stabilize query inputs with `useState` or `useMemo` to prevent infinite re-fetch loops.
- Use optimistic updates for list operations, toggles, and profile edits. Use `invalidate` with loading states for critical operations (payments, auth).
- Always handle loading, empty, and error states in the UI.

### Accessibility

- All interactive elements must have a visible label: `aria-label` for icon-only buttons, `alt` text for all images.
- Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>` with `aria-label` for navigation regions.
- Ensure keyboard reachability: all interactive elements must be focusable and have a visible focus ring.
- Minimum touch target size on mobile: 44×44px.

### Styling

- Use Tailwind utilities. Avoid custom CSS unless adding a design token or animation.
- Use the design token system — `bg-background`, `text-foreground`, `border-border`, etc. — not hardcoded colors.
- Use OKLCH color format for any custom color values (not HSL or hex).
- The `.card-premium` and `.btn-premium` utility classes in `index.css` provide the standard hover/transition treatment for interactive cards and primary buttons.

---

## Testing

Every new feature must include Vitest tests covering:

1. The happy path (successful mutation/query)
2. Authentication enforcement (unauthenticated calls return `UNAUTHORIZED`)
3. Authorization enforcement (ownership checks — users cannot access other users' data)
4. Input validation (invalid inputs return `BAD_REQUEST`)

Reference: `server/auth.logout.test.ts`

```bash
pnpm test              # Run all tests
pnpm test --watch      # Watch mode
pnpm audit             # Check for dependency vulnerabilities before merging
```

**Do not merge a PR that reduces test coverage or introduces failing tests.**

---

## Pull Request Process

1. **Branch naming:** `feature/short-description`, `fix/short-description`, `chore/short-description`
2. **Commit messages:** Use imperative mood — "Add habit streak tracking", not "Added habit streak tracking"
3. **PR description:** Include what changed, why, and how to test it
4. **Checklist before opening a PR:**
   - [ ] `pnpm test` passes with zero failures
   - [ ] `npx tsc --noEmit` returns zero errors
   - [ ] `pnpm audit` returns zero critical or high vulnerabilities
   - [ ] All new interactive elements have `aria-label` or visible text labels
   - [ ] All new images have `alt` text
   - [ ] No hardcoded secrets, API keys, or environment values in code
   - [ ] No files committed to `client/public/` except `favicon.ico`, `robots.txt`, `manifest.json`
5. **Review:** At least one approval required before merging to `main`

---

## Design Principles

Lifewoven is built around four non-negotiable design principles. All contributions must respect them.

**1. Do not punish interruption. Design for return.**
Users will miss days, skip sessions, and disappear. The app must always welcome them back without shame, streaks that reset to zero, or guilt-inducing empty states.

**2. Reduce shame. Do not gamify it.**
No badges for streaks. No leaderboards. No "you're falling behind" notifications. Progress is personal and non-comparative.

**3. Language matters as much as features.**
Every label, placeholder, empty state, and error message is part of the product. Write with care. Avoid clinical language. Avoid motivational clichés.

**4. Built for real minds in real life.**
The platform is explicitly designed for people whose minds work differently — ADHD, anxiety, depression, neurodivergence. Features must be forgiving, flexible, and low-friction.

---

## Security Guidelines

- **Never store secrets in code.** All credentials must go through environment variables.
- **Never use raw SQL string concatenation.** All queries must use Drizzle ORM parameterized queries.
- **Always check ownership.** Every protected query that returns user data must filter by `ctx.user.id`. Never return another user's data.
- **Use `protectedProcedure` for all user data.** Public procedures must not expose PII.
- **Tier gates belong on the server.** Never rely solely on frontend UI to hide paid features — the server procedure must enforce the tier check.
- **File uploads go to S3.** Never store file bytes in the database. Use `storagePut()` from `server/storage.ts`.
- **Run `pnpm audit` before every deploy.** Zero critical or high vulnerabilities is a hard requirement.

---

## Questions

Open an issue or reach out via the project's support channel. For security vulnerabilities, do not open a public issue — contact the maintainer directly.
