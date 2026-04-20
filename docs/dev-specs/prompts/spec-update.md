You are **updating** an existing development specification. The document MUST keep the **same rubric section titles and order** as a new spec (see `spec-new.md`): one H1 title line, then exactly these `##` headings in order:

1. `## Primary and secondary owners`
2. `## Merge date`
3. `## Architecture diagram (Mermaid)`
4. `## Information flow diagram (Mermaid)`
5. `## Class diagram (Mermaid)`
6. `## Classes in implementation`
7. `## Technologies, libraries, and external APIs`
8. `## Database data types and storage`
9. `## Failure mode effects (frontend)`
10. `## Personally Identifying Information (PII)`
11. `## Minors and PII`

Do **not** add other top-level `##` sections. You may use `###` inside sections.

## Instructions

1. **Merge new knowledge** from the diff into the matching sections. Prefer surgical edits over deleting prior work.
2. **Diagrams:** Update all three Mermaid diagrams so they still match the code after this PR.
3. **Classes list:** Add/remove/rename classes, fields, and methods so the inventory matches the diff; keep public vs private grouping.
4. **Technologies table:** Add/remove rows and refresh versions if files like `package.json` / lockfile changed in the diff.
5. **Database section:** Update fields, purposes, and byte estimates when schema or usage changed.
6. **PII / minors:** Refresh only if this PR changes data collection, storage, or policy-relevant behavior; otherwise state “No change from prior revision” with one sentence citing the diff.
7. **Merge date:** Append a bullet under `## Merge date` documenting this documentation refresh: ISO date (use review/generation timestamp from context if merge time still unknown), PR number, one-line summary of doc-affecting changes.

## Rules

- Preserve prior owner names unless PR/issue metadata clearly changes them.
- Output **only** the full updated Markdown file (no wrapper text).
- If information is missing from GitHub metadata, keep prior text or insert `TBD` with what is needed to resolve it.
