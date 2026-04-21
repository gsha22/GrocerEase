# Development specifications (LLM-assisted)

This folder holds **development specifications** for P2 user stories. Each generated file is intended to match the **course “Development Specification” rubric** (owners, merge date, three Mermaid diagrams, class inventory, technology table, DB byte estimates, failure modes, PII, minors).

## How specs are generated

- **Automation:** [`.github/workflows/dev-spec-on-pr-approval.yml`](../../.github/workflows/dev-spec-on-pr-approval.yml) runs when someone **submits an approving review** on a pull request **into `main`** (`pull_request_review` + `state == approved`).
- **Story detection:** Parses PR **title/body** for `Story N` or `USN`, or falls back to label `dev-spec:USn`.
- **LLM:** **GitHub Models** via [`actions/ai-inference`](https://github.com/actions/ai-inference) (`permissions: models: read`, default `GITHUB_TOKEN`).
- **Validation:** The workflow fails if the Markdown is missing the **exact** `##` headings required by [`prompts/spec-new.md`](./prompts/spec-new.md) (so incomplete LLM output does not open a docs PR).
- **Hygiene:** Opens a **follow-up documentation PR** for human review before merging to `main`.

## Merge date note

This workflow runs on **approval**, which is usually **before** merge. The prompt instructs the model to write `Not merged to main at time of this document generation (workflow ran on PR approval).` unless `pull_request.merged_at` is present. After you merge the feature PR, regenerate or manually edit **`## Merge date`** once if your grader needs the exact merge timestamp.

## Fork PRs and repeat approvals

- Diffs use `git fetch origin refs/pull/N/head` so the **PR head is available even when it comes from a fork** (no need for `HEAD_SHA` on `origin`).
- Docs branches use a **stable name** `docs/dev-spec-USn-pr-<feature-pr#>` so **re-approvals update the same branch**; `gh pr create` runs only if there is **no** open PR for that head yet.

## How to trigger

1. Put `Story N` or `USN` in the PR title or body (or use label `dev-spec:USn`).
2. Approve the PR (into `main`).
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
