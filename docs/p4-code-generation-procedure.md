# P4 Task 3 — Automated Code Generation Procedure

This document describes the repeatable workflow we use to drive code
generation for a new user story with an LLM agent. It is the procedure
we followed for stories **#119 (US15 ratings)**, **#120 (US16 map
filters)**, and **#121 (US17 reports)**.

## Tooling

- **Agent**: Claude Code (Opus 4.7) — CLI coding agent with repo read/write,
  shell access, and `gh` CLI access.
- **VCS**: GitHub; one issue-per-story, one branch-per-story, one PR-per-story.
- **Auth for the agent**: `gh auth` backed by the developer's keychain
  GitHub token (`gho_…`). The agent exports `GH_TOKEN` per invocation so
  `gh api` / `gh pr create` work without interactive login.

## Repeatable steps

Given a story tracked in a GitHub issue `#N`, the agent runs the following
ordered steps. The steps are identical across stories; only the prompt and
resulting code differ.

1. **Load the issue**
   ```
   gh api repos/<owner>/<repo>/issues/N
   ```
   Extract title, body, human and machine acceptance criteria.

2. **Ground in the codebase**
   Read the files the story most likely touches:
   - `prisma/schema.prisma` (if new data is needed)
   - `app/api/stores/[id]/*` and nearby API routes as pattern references
   - `lib/require-shopper-session.ts` / `lib/require-owner-session.ts`
     for auth-gating
   - The relevant page under `app/(public)` or `app/(dashboard)`
   - The sidebar / nav components if owner surfaces are added

3. **Branch off `main`**
   ```
   git fetch origin main
   git checkout -b feature/us-<n>-<slug> origin/main
   ```

4. **Generate code** using the *system prompt* below, pasting the issue
   body verbatim as context.

5. **Quality gate (local)**
   - Confirm new files compile against existing types (pre-existing TS
     errors about `@/app/generated/prisma/client` are expected in a
     fresh worktree — Prisma Client is generated at build time on Vercel;
     run `npx prisma generate` locally).
   - Run `npm run lint` and any test script that touches the surface.

6. **Commit + PR**
   ```
   git add -A
   git commit -m "US<N>: <short summary> (closes #<issue>)…"
   git push -u origin feature/us-<n>-<slug>
   gh pr create --base main --head feature/us-<n>-<slug> \
     --title "US<N>: <title> (#<issue>)" \
     --body <Closes #<issue>, summary, acceptance-criteria checklist>
   ```

7. **Human review + merge**
   A human teammate reviews the PR, runs it locally against a seeded DB,
   and merges via the usual "squash" button. The agent **does not** merge.

## Human responsibilities (what we explicitly did not automate)

- **Merging** PRs into `main` and resolving merge conflicts.
- **Prisma migrations against the live database**. The agent writes the
  SQL migration file, but a human runs `npx prisma migrate deploy` in the
  Supabase environment.
- **Security-sensitive choices** — auth scopes, rate-limit windows,
  duplicate-report windows, and any change to `middleware.ts`.
- **Product calls** — e.g., whether 429 vs 409 is the right status for a
  24-hour duplicate-report guard, or whether notes should be public.
- **Fixing the model when it gets something wrong** — for example, the
  agent initially proposed a looser dedupe window for US17; we tightened
  it to 24 hours to match the issue.

## System prompt used for generation

Paste this prompt into the agent alongside the issue body. The prompt is
the same for every story — only the issue body changes.

> You are working in the `GrocerEase` Next.js 16 + Prisma + Supabase
> repo. Implement the user story quoted below. Follow these constraints:
>
> 1. **Match existing patterns.** Authenticated API routes live under
>    `app/api/...`, return `NextResponse.json(...)`, and gate access with
>    `requireShopperSession()` / `requireOwnerSession()` from `lib/`.
>    Client "islands" live under `components/` and are marked
>    `"use client"`. Server pages live under `app/(public)` or
>    `app/(dashboard)` and use `auth()` from `@/auth` to resolve role.
> 2. **Data model.** If the story needs persistence, add a Prisma model
>    to `prisma/schema.prisma` with `@@map(...)` and `snake_case` column
>    names, and ship a matching SQL migration under
>    `prisma/migrations/<timestamp>_<name>/migration.sql`. Reuse enums,
>    cascade deletes to parents, and add indexes for the expected query
>    shape.
> 3. **Respect acceptance criteria verbatim.** Every machine-acceptance
>    bullet must map to a concrete status code or query in the
>    implementation. Every human-acceptance bullet must be visible in the
>    UI you build.
> 4. **Keep the diff minimal.** Do not refactor unrelated code. Do not
>    invent feature flags, dashboards, or analytics the story did not ask
>    for. If the backend already supports what the story wants (e.g.
>    `/api/stores?category=`), surface it in UI instead of duplicating.
> 5. **Trust the framework.** Do not add defensive fallbacks for things
>    Next/Prisma already guarantee. Validate only at the HTTP boundary.
> 6. **Ship one branch, one PR.** Commit with a message that references
>    the issue (`Refs #N` / `closes #N`). Open the PR with a body that
>    mirrors the acceptance-criteria checklist.
>
> When uncertain between two reasonable designs, pick the simpler one and
> note the tradeoff in the PR body. Do not merge — a human reviews.

## Story-level notes

### US15 — Shopper ratings (#119)
- Asked the agent for: Prisma `StoreRating` + unique(store, shopper) +
  migration; public GET with average/total/10-per-page notes; POST
  gated by shopper; DELETE gated by owner-of-rating.
- What worked: The pattern-matching against `StoreAlertSubscribe` and
  `require-shopper-session.ts` produced an idiomatic client island on
  the first try. Server-side aggregate fetch on the profile page avoided
  layout shift.
- What needed correction: The first draft returned the Prisma aggregate
  raw; we wrapped it so the API always returns a rounded `average` and
  stable shape even when there are zero ratings.

### US16 — Map category filters (#120)
- Asked the agent for: *only* the UI. Backend already supports
  `GET /api/stores?category=asian,halal`.
- What worked: The agent correctly spotted the existing
  `StoreFilterBar`, reused it, and wired a client `useState<Set<FilterKey>>`
  through the existing `buildMapStoresApiUrl` helper.
- What needed correction: Initial pass didn't refetch when filters
  changed (only on mount). We added `handleFiltersChange` to re-query.

### US17 — Incorrect-info reports (#121)
- Asked the agent for: Prisma `StoreReport` + enum + migration; shopper
  POST with 24 h dedupe; owner GET scoped to own store; shopper UI on
  store page; owner `/dashboard/reports` page and sidebar entry.
- What worked: The four-type enum + chip UI matched the "lightweight,
  not punitive" criterion cleanly. The in-place "Thanks — your report
  was submitted" acknowledgement satisfied human-AC.
- What needed correction: First draft used 409 for the 24 h duplicate
  case. We moved to 429 (rate-limit-shaped) with a friendlier message
  because 409 suggests the same resource already exists, whereas here
  the shopper is allowed to report again after 24 h.

## PRs delivered under this procedure

- US15 → https://github.com/gsha22/GrocerEase/pull/126 (branch
  `feature/us-15-store-ratings`)
- US16 → https://github.com/gsha22/GrocerEase/pull/124 (branch
  `feature/us-16-map-filters`)
- US17 → https://github.com/gsha22/GrocerEase/pull/125 (branch
  `feature/us-17-store-reports`)
