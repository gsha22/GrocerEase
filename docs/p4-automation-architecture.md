# P4 Task 7 — Automation Architecture Summary

This document is the self-contained architecture reference for the
automation pipelines that ship with `GrocerEase`. It is meant to be
read by either a grader who has never touched the repo, or a new
developer who just cloned it and wants to understand what runs when.

Everything described here is checked into the repo — nothing lives only
in someone's personal settings or CI secrets without being named below.

## 1. Pipeline diagram (bullet-level)

### 1a. What happens when an issue is opened for a new user story

```
Human opens GitHub issue #N (title "US<N>: …", body = acceptance criteria)
        │
        ▼
Developer runs Claude Code locally (CLI agent, Opus 4.7)
        │   — reads the issue via `gh api repos/.../issues/N`
        │   — grounds in the codebase (schema, auth, existing APIs)
        │   — branches off main: feature/us-<n>-<slug>
        │   — generates code following the system prompt in
        │     docs/p4-code-generation-procedure.md
        │
        ▼
Agent runs `npx jest tests/<new>.test.tsx` locally
        │   — also writes a Jest test file that covers the story
        │     (system prompt: docs/p4-testing-procedure.md)
        │
        ▼
Agent commits + pushes + opens PR with `gh pr create`
        │
        ▼
   (pipeline 1b takes over)
```

### 1b. What happens on every PR (the "open PR" trigger)

```
   pull_request (opened, synchronize, reopened) on any PR into main
              │
              ├──────────────────────────────┐
              ▼                              ▼
   .github/workflows/ci.yml        .github/workflows/copilot-pr-review.yml
     ┌──────────────────┐                ┌─────────────────────────┐
     │ Lint job         │                │ Copilot CLI review job  │
     │   eslint/next    │                │   — pulls PR diff       │
     │                  │                │   — runs a structured   │
     │ Type Check job   │                │     review prompt       │
     │   tsc --noEmit   │                │     (severity table +   │
     │                  │                │     action items)       │
     │ Test job         │                │   — posts the report as │
     │   npx jest       │                │     a PR comment and    │
     │   (all tests/**) │                │     uploads it as an    │
     │                  │                │     artifact            │
     │ Build job        │                │                         │
     │   (needs lint +  │                │   Blocking? NO — this   │
     │   typecheck)     │                │   comment is advisory.  │
     │   next build     │                │   Humans decide what    │
     │                  │                │   changes to make.      │
     │ Blocking? YES —  │                │                         │
     │ PR can't be      │                │                         │
     │ merged until     │                │                         │
     │ these pass.      │                │                         │
     └──────────────────┘                └─────────────────────────┘
              │                              │
              └──────────────┬───────────────┘
                             ▼
               Human reads the review + checks,
               pushes fixes, repeats until green
                             │
                             ▼
               Human clicks "Approve" in GitHub UI
                             │
                             ▼
   .github/workflows/dev-spec-on-pr-approval.yml fires
     ┌────────────────────────────────────────────────┐
     │ Dev specification job                          │
     │   on: pull_request_review (state == approved)  │
     │   — reads PR title/body, derives "USn" slug    │
     │   — uses GitHub Models (GITHUB_TOKEN +         │
     │     models: read) to synthesize a dev-spec     │
     │     doc from the diff                          │
     │   — commits the spec to a stable branch        │
     │     docs/dev-spec-USn-pr-<N>                   │
     └────────────────────────────────────────────────┘
                             │
                             ▼
                  Human merges the PR (squash)
                             │
                             ▼
                      push to main
                             │
                             ▼
     Vercel deploy hook (configured in Vercel UI, not in this repo):
     — runs `npx prisma generate` + `next build`
     — deploys to production
     — human runs `npx prisma migrate deploy` against Supabase
       *separately* (see Human responsibilities in
       docs/p4-code-generation-procedure.md)
```

### 1c. What happens when CI fails on a PR

```
CI job red (lint / typecheck / test / build)
        │
        ▼
Developer pastes the debugging prompt from
  docs/p4-code-generation-procedure.md ("System prompt used for debugging")
  into Claude Code, along with the PR number
        │
        ▼
Agent runs `gh pr checks <N> --repo <owner>/<repo>` → `gh run view --log-failed`
        │
        ▼
Agent diagnoses the single failing assertion / type / lint rule,
makes the smallest diff, pushes to the same branch
        │
        ▼
CI re-runs automatically on the new commit → back to pipeline 1b
```

## 2. Files that wire the automation together

| File | What it does | Trigger |
|---|---|---|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Lint, type-check, Jest test suite, Next.js build. **Blocks merge.** | `push` to `main`, `pull_request` into `main` |
| [`.github/workflows/copilot-pr-review.yml`](../.github/workflows/copilot-pr-review.yml) | Posts an advisory LLM-generated PR review via GitHub Copilot CLI. **Does not block merge.** | `pull_request` (opened, synchronize, reopened), `workflow_dispatch` |
| [`.github/workflows/dev-spec-on-pr-approval.yml`](../.github/workflows/dev-spec-on-pr-approval.yml) | Synthesizes a dev-spec markdown doc from the approved PR's diff and commits it to `docs/dev-spec-USn-pr-<N>`. | `pull_request_review` with `state == approved` |
| [`jest.config.mjs`](../jest.config.mjs) | Jest configuration consumed by the `Test` job in `ci.yml`. | — |
| [`jest.setup.ts`](../jest.setup.ts) | jest-dom + fetch/EventSource polyfills for the jsdom env. | — |
| [`docs/p4-code-generation-procedure.md`](./p4-code-generation-procedure.md) | The two agent system prompts (code generation + debugging). | Human-triggered (paste into Claude Code). |
| [`docs/p4-testing-procedure.md`](./p4-testing-procedure.md) | The agent system prompt for authoring Jest tests, plus a per-story test map. | Human-triggered (paste into Claude Code). |

## 3. Setup instructions for a new developer

A new developer should be able to go from `git clone` to a green PR
without reading the rest of the repo first. Follow these steps in order.

### 3a. Local environment

```bash
git clone https://github.com/gsha22/GrocerEase.git
cd GrocerEase
nvm use 20                     # or install Node 20 any way you like
npm ci                          # installs exact versions from package-lock.json
cp .env.example .env            # then fill in DATABASE_URL + NEXTAUTH_SECRET
npx prisma generate             # generates the Prisma client into app/generated/prisma
npx prisma migrate deploy       # applies all migrations to your local DB
npm run dev                     # http://localhost:3000
```

You now have a working local app. To run the test suite the same way
CI does:

```bash
npx jest                        # all tests under tests/**
npx jest tests/MapPage.test.tsx # one file at a time during development
```

### 3b. Install the agent tooling (only needed if you'll run the LLM automations)

```bash
# Claude Code CLI (the coding agent used for Tasks 3 & 4)
# Install per https://docs.claude.com/en/docs/claude-code/quickstart
# then auth it to your Anthropic account.

# GitHub CLI (used by the agent and by the debugging workflow)
brew install gh                 # macOS; see cli.github.com for other OSes
gh auth login                   # or export GH_TOKEN=<your PAT> per shell
```

The agent only needs `gh` to read issues, PRs, and failing job logs —
it never pushes as you; it pushes as whoever is logged in to `git` locally.

### 3c. GitHub Actions secrets (one-time, per fork)

These live in **Settings → Secrets and variables → Actions** on the
GitHub repository. They are referenced by name in the workflow files,
so you can grep for them to see exactly what each one does.

| Secret | Used by | How to obtain |
|---|---|---|
| `COPILOT_PR_REVIEW_PAT` | `copilot-pr-review.yml` | Create a fine-grained PAT ([link](https://github.com/settings/personal-access-tokens/new?type=fine_grained)) on an account that has Copilot access; grant scope **Copilot Requests** and repository access to this repo. |
| *(none)* | `ci.yml` | `ci.yml` uses the auto-provided `GITHUB_TOKEN` only. |
| *(none)* | `dev-spec-on-pr-approval.yml` | Uses `GITHUB_TOKEN` with `models: read` permission (declared in the workflow file). No user secret needed. |

Vercel deployment secrets (`DATABASE_URL`, `DIRECT_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, etc.) live in the Vercel project
settings, not in GitHub. See [`docs/deploy-vercel.md`](./deploy-vercel.md)
and [`docs/vercel-supabase-integration.md`](./vercel-supabase-integration.md).

### 3d. First contribution — the golden path

1. **Pick an issue.** Stories are tracked as GitHub issues with titles
   like `US18: <title>`. Self-assign the issue so nobody else grabs it.
2. **Branch off `main`.**
   ```
   git fetch origin main
   git checkout -b feature/us-<n>-<slug> origin/main
   ```
3. **Implement** (by hand, or by pasting the system prompt from
   [`docs/p4-code-generation-procedure.md`](./p4-code-generation-procedure.md)
   into Claude Code).
4. **Write tests** (same: by hand, or via the system prompt in
   [`docs/p4-testing-procedure.md`](./p4-testing-procedure.md)).
5. **Run locally**:
   ```
   npm run lint
   npx tsc --noEmit
   npx jest
   npm run build
   ```
   If all four pass, CI will almost certainly pass too.
6. **Push and open the PR.**
   ```
   git push -u origin feature/us-<n>-<slug>
   gh pr create --base main --title "US<N>: <title> (#<issue>)" \
     --body "Closes #<issue>. …"
   ```
7. **Watch CI + the Copilot review comment.** Address any
   severity-WARN/BLOCKER findings from the review by pushing follow-up
   commits to the same branch. CI re-runs automatically.
8. **Get a human approval**, then merge (squash). The approval also
   triggers the dev-spec workflow, which commits a generated spec to
   `docs/dev-spec-USn-pr-<N>`.

## 4. What is explicitly *not* automated

These are the handoff points where a human stays in the loop on
purpose:

- **Merging a PR.** The agent never merges. It only opens PRs.
- **Applying Prisma migrations to production.** The agent writes the
  SQL migration file; a human runs `npx prisma migrate deploy` against
  Supabase. See [`docs/p4-code-generation-procedure.md`](./p4-code-generation-procedure.md#human-responsibilities-what-we-explicitly-did-not-automate).
- **Security-sensitive choices.** Auth scopes, rate-limit windows,
  session-cookie changes, `middleware.ts` edits.
- **Product calls.** Status codes (e.g. 409 vs 429 for the 24 h
  report-dedupe case), copy decisions, pricing.
- **Interpreting the Copilot review.** The review is advisory. A
  human judges whether each finding is a real issue and either fixes
  it or explains why it's a non-issue in the PR thread.

## 5. Quick smoke test that everything is wired up

After setup, open a throwaway PR (e.g. change a comment in the README)
and verify:

1. The **CI** workflow runs 4 jobs (`Lint`, `Type Check`, `Test`,
   `Build`) and all pass.
2. The **Copilot PR review** workflow posts a comment within ~1 minute
   (usually "Docs-only change — no findings" on a README edit).
3. Approving the PR triggers the **Dev specification** workflow, which
   pushes a `docs/dev-spec-*` branch.

If any of those don't happen, the most common causes are:

- Secret `COPILOT_PR_REVIEW_PAT` is missing or expired → Copilot
  review silently fails. Check the Actions tab.
- `models: read` permission was removed from the default
  `GITHUB_TOKEN` for the repo → Dev specification workflow 403s.
  Re-enable in **Settings → Actions → General → Workflow permissions**.
- A forked-PR author triggers the workflows: GitHub restricts
  `GITHUB_TOKEN` write scopes on fork PRs by design. Same-repo PRs are
  the supported path.
