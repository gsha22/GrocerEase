You are **updating** an existing development specification. Preserve structure and history unless the code clearly supersedes it.

## Inputs you receive

- **Existing specification** (full markdown) — treat as the prior truth.
- **New merged PR** title, body, number.
- **Unified diff** (possibly truncated) for this PR.

## Instructions

1. **Merge knowledge:** Integrate new behavior from the diff into the existing doc. Prefer **editing sections in place** over rewriting from scratch.
2. **Version note:** Add a bullet under a `## Changelog` section at the bottom: date (ISO if unknown use `YYYY-MM-DD` placeholder), PR number, one-line summary of doc-affecting changes.
3. **Deprecate carefully:** If the diff removes behavior, strike through or move to “Removed / superseded” rather than deleting without comment.
4. **Implementation map & APIs:** Update tables/lists to match **current** code after this PR.
5. **Testing:** Append new tests or commands introduced in the diff.
6. **Traceability:** Ensure the latest PR is listed in **Traceability** (keep older PRs if still relevant).

## Rules

- Do not drop acceptance criteria or user-story text unless the product intentionally removed them and the diff supports that.
- If the diff is unrelated to sections of the old spec, **leave those sections** largely intact.
- Output **only** the full updated Markdown file (no “here is your document” wrapper).
