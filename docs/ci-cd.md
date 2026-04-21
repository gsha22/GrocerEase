# CI/CD & Automations

## Pipeline overview

```
Push to main / open PR against main
  └─► ci.yml
        ├── lint          (ESLint)
        ├── typecheck     (tsc --noEmit)
        ├── test          (Jest)
        └── build         (next build)  ← runs only after all three pass

PR opened / pushed to / reopened
  └─► copilot-pr-review.yml
        └── GitHub Copilot CLI reviews the diff
              └── posts a summary comment on the PR
                    (informational — does NOT block merge)

PR receives an "Approved" review
  └─► dev-spec-on-pr-approval.yml
        ├── extracts story slug from PR title/body (e.g. "Story 4" → US4)
        ├── collects diff, changed files, PR metadata as context
        ├── calls GitHub Models (GPT-4o) to generate a development spec
        ├── validates required sections (owners, diagrams, PII, etc.)
        └── opens (or updates) a docs PR targeting main
              └── human reviews & merges the docs PR separately
```

**Merge gates:** The `build` job depends on `lint`, `typecheck`, and `test`. All must pass before a PR can merge. The Copilot review and dev-spec workflows are non-blocking.

---

## New developer setup

### 1. Repository secrets

Two secrets must be configured in **Settings → Secrets and variables → Actions** before all three workflows are fully functional:

| Secret | Required by | How to obtain |
|---|---|---|
| `GITHUB_TOKEN` | All workflows | Automatically provided by GitHub — no action needed |
| `COPILOT_PR_REVIEW_PAT` | `copilot-pr-review.yml` | Create a **fine-grained PAT** for your account with the **"Copilot Requests"** scope, then add it as a repository secret |

The dev-spec workflow (`dev-spec-on-pr-approval.yml`) uses only `GITHUB_TOKEN` and the GitHub Models API (available on GitHub Team and Enterprise plans).

### 2. Enable GitHub Models (dev-spec workflow)

GitHub Models is used for spec generation on PR approval. It requires a **GitHub Team or Enterprise** plan on the repository's organization. No extra secret is needed — the workflow authenticates via `GITHUB_TOKEN` with `models: read` permission.

If your repo is on the free plan, the `generate` job will fail at the `ai-inference` step. You can disable the workflow by removing `.github/workflows/dev-spec-on-pr-approval.yml` or by adding a branch protection rule that does not depend on it.

### 3. Enable the Copilot PR review

The `copilot-pr-review.yml` workflow installs the `@github/copilot` CLI and authenticates using `COPILOT_PR_REVIEW_PAT`. Without this secret the job exits early with an error — CI still passes.

To enable it:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Create a token scoped to this repository with **"Copilot Requests: Read"** permission.
3. Add it as a repository secret named `COPILOT_PR_REVIEW_PAT`.

### 4. Verify CI runs locally before pushing

Run the same checks GitHub Actions will run so you don't need to wait for a red CI run:

```bash
npm ci
npx prisma generate
npm run lint
npx tsc --noEmit
npx jest
npm run build        # needs DATABASE_URL and NEXTAUTH_SECRET in .env (see .env.example)
```

For the `build` step, CI injects stub values for `DATABASE_URL` and `NEXTAUTH_SECRET`. Locally you can do the same:

```bash
DATABASE_URL=postgresql://fake:fake@localhost:5432/fake \
NEXTAUTH_SECRET=ci-placeholder-secret \
npm run build
```

### 5. Triggering automations manually

| Workflow | Manual trigger |
|---|---|
| `copilot-pr-review.yml` | Go to **Actions → Copilot PR Review → Run workflow** (select the branch) |
| `dev-spec-on-pr-approval.yml` | Approve a PR that targets `main` and includes a story reference (e.g. "Story 4" or "US4") in its title or body |
| `ci.yml` | Runs automatically; no manual trigger exposed |
