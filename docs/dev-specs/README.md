# Development specifications (LLM-assisted)

This folder holds **development specifications**: living docs that describe what shipped for each prioritized user story (behavior, code touchpoints, APIs, data, tests), aligned with P2-style intent but **grounded in the actual codebase**.

## How specs are generated

- **Automation:** [`.github/workflows/dev-spec-on-pr-approval.yml`](../../.github/workflows/dev-spec-on-pr-approval.yml) runs when someone **submits an approving review** on a pull request **into `main`** (`pull_request_review` + `state == approved`).
- **LLM:** Uses **GitHub Models** via the official [`actions/ai-inference`](https://github.com/actions/ai-inference) action — **no OpenAI API key required** if your repo/org can use GitHub Models. The workflow sets `permissions: models: read` and passes the default `GITHUB_TOKEN`.
- **Hygiene:** The workflow opens a **follow-up documentation PR** (branch `docs/dev-spec-…`) so humans can review the markdown before it lands on `main`.

> The feature PR can still be **open** when the spec PR is created; the spec describes the **approved** diff. Merge the feature PR after (or before) merging the docs PR, per your team process.

## How to trigger an update for a story

1. Include a story marker in PR title/body, e.g. **`Story 4`** or **`US4`** (the workflow maps this to `docs/dev-specs/US4-development-spec.md`).
2. *(Optional fallback)* add label **`dev-spec:US4`** if your PR text does not include a story marker.
3. Get the PR **approved** (GitHub review → Approve) while it targets **`main`**.
4. Wait for the workflow run; review and merge the bot-opened docs PR.

If no story marker is found and no `dev-spec:*` label fallback is present, the workflow **skips** (does not fail CI).

The workflow validates that generated docs include required headings (`User story`, `Summary`, `Files changed`, `Traceability`, etc.). If any are missing, the run fails and no docs PR is opened.

## Prompts (assignment / audit trail)

| File | Purpose |
|------|---------|
| [`prompts/spec-new.md`](./prompts/spec-new.md) | Instructions when **no** spec file exists yet on `main`. |
| [`prompts/spec-update.md`](./prompts/spec-update.md) | Instructions when **updating** an existing spec. |
| [`.github/prompts/dev-spec-generate.prompt.yml`](../../.github/prompts/dev-spec-generate.prompt.yml) | Template sent to GitHub Models (pulls in the above via the workflow). |

## GitHub Models availability

GitHub Models must be enabled for your account/org. If inference fails in Actions, see [Integrating AI models into your development workflow](https://docs.github.com/en/github-models/github-models-at-scale/integrating-ai-models-into-your-development-workflow) and the [inference API](https://docs.github.com/en/rest/models/inference).

Issue links in `## Traceability` are extracted from PR body references such as `Closes #123`, `Fixes #123`, or `Refs #123`.

**Fallback:** You can fork the workflow to call OpenAI or another provider with a repository secret; the prompt files in `docs/dev-specs/prompts/` stay the same.
