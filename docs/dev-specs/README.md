# Development specifications (LLM-assisted)

This folder holds **development specifications** for P2 user stories. Each generated file is intended to match the **course “Development Specification” rubric** (owners, merge date, three Mermaid diagrams, class inventory, technology table, DB byte estimates, failure modes, PII, minors).


## How specs are generated

- **Automation:** [`.github/workflows/dev-spec-on-pr-approval.yml`](../../.github/workflows/dev-spec-on-pr-approval.yml) runs when a PR targeting **`main`** either (1) receives an **approving review** while still **open**, or (2) is **merged** (`pull_request` `closed` + `merged`). Same story slug rules apply in both cases.
- **Story detection:** Parses PR **title/body** for `Story N` or `USN`, or falls back to label `dev-spec:USn`.
- **LLM:** **GitHub Models** via [`actions/ai-inference`](https://github.com/actions/ai-inference) (`permissions: models: read`, default `GITHUB_TOKEN`).
- **Validation:** The workflow fails if the Markdown is missing the **exact** `##` headings required by [`prompts/spec-new.md`](./prompts/spec-new.md) (so incomplete LLM output does not open a docs PR).
- **Hygiene:** Opens a **follow-up documentation PR** for human review before merging to `main`.

## Merge date note

If the workflow ran **only on approval** (before merge), the prompt may say the PR was not merged yet unless `merged_at` was already present. **Merge-triggered** runs include `pull_request.merged_at`, so the generated **`## Merge date`** can be accurate without a manual edit. If you use **both** approval and merge triggers for the same PR, you may get **two** runs (concurrency groups by PR number); the later merge run overwrites the docs branch with the merge-aware context.

## Fork PRs and repeat approvals

- Diffs use `git fetch origin refs/pull/N/head` so the **PR head is available even when it comes from a fork** (no need for `HEAD_SHA` on `origin`).
- Docs branches use a **stable name** `docs/dev-spec-USn-pr-<feature-pr#>` so **re-approvals update the same branch**; `gh pr create` runs only if there is **no** open PR for that head yet.

## Tracking issue

Each successful spec commit opens or reuses an **open** GitHub issue titled `Dev spec tracking: USn for feature PR #<n>` with label **`dev-spec-tracking`**. The spec commit message includes `Refs #<issue>`, and the docs PR body links the same issue for course traceability.

## How to trigger

1. Put `Story N` or `USN` in the PR title or body (or use label `dev-spec:USn`).
2. Either **approve** the PR into `main` while it is open, **or** **merge** it into `main` (no separate approval required for the merge path).
3. Review and merge the bot-opened docs PR.

## Prompts (assignment / audit trail)

| File | Purpose |
|------|---------|
| [`prompts/README.md`](./prompts/README.md) | Which file to submit as “new” vs “update” prompt. |
| [`prompts/spec-new.md`](./prompts/spec-new.md) | Full rubric section list and content rules for **new** specs. |
| [`prompts/spec-update.md`](./prompts/spec-update.md) | **Update** prompt: merge prior spec with new PR/diff; same rubric headings. |
| [`.github/prompts/dev-spec-generate.prompt.yml`](../../.github/prompts/dev-spec-generate.prompt.yml) | Model template (injects PR text, slug, issues, owners, merge context, diff). |

Issue links in prompts are extracted from PR body (`Closes #123`, `Fixes #123`, `Refs #123`, etc.).

## GitHub Models availability

See [GitHub Models docs](https://docs.github.com/en/github-models/github-models-at-scale/integrating-ai-models-into-your-development-workflow). If inference fails, you can swap in another provider using a repository secret while keeping the same prompt files.
