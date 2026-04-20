# Development specifications (LLM-assisted)

This folder holds **development specifications**: living docs that describe what shipped for each prioritized user story (behavior, code touchpoints, APIs, data, tests), aligned with P2-style intent but **grounded in the actual codebase**.

## How specs are generated

- **Automation:** [`.github/workflows/dev-spec-on-merge.yml`](../../.github/workflows/dev-spec-on-merge.yml) runs when a pull request is **merged into `main`**.
- **LLM:** Uses **GitHub Models** via the official [`actions/ai-inference`](https://github.com/actions/ai-inference) action — **no OpenAI API key required** if your repo/org can use GitHub Models. The workflow sets `permissions: models: read` and passes the default `GITHUB_TOKEN`.
- **Hygiene:** The workflow opens a **follow-up documentation PR** (branch `docs/dev-spec-…`) so humans can review the markdown before it lands on `main`.

> **Course interpretation:** Required reviews + merge into `main` count as your team’s “approval gate.” The spec PR is the artifact graders can link as “review of the development specification.”

## How to trigger an update for a story

1. Add a PR label: **`dev-spec:US5`** (prefix `dev-spec:`, suffix is the slug — becomes `docs/dev-specs/US5-development-spec.md`).
2. Merge the feature PR to `main`.
3. Wait for the workflow run; review and merge the bot-opened docs PR.

If no `dev-spec:*` label is present, the workflow **skips** (does not fail CI).

## Prompts (assignment / audit trail)

| File | Purpose |
|------|---------|
| [`prompts/spec-new.md`](./prompts/spec-new.md) | Instructions when **no** spec file exists yet. |
| [`prompts/spec-update.md`](./prompts/spec-update.md) | Instructions when **updating** an existing spec. |
| [`.github/prompts/dev-spec-generate.prompt.yml`](../../.github/prompts/dev-spec-generate.prompt.yml) | Template sent to GitHub Models (pulls in the above via the workflow). |

## GitHub Models availability

GitHub Models must be enabled for your account/org. If inference fails in Actions, see [Integrating AI models into your development workflow](https://docs.github.com/en/github-models/github-models-at-scale/integrating-ai-models-into-your-development-workflow) and the [inference API](https://docs.github.com/en/rest/models/inference).

**Fallback:** You can fork the workflow to call OpenAI or another provider with a repository secret; the prompt files in `docs/dev-specs/prompts/` stay the same.
