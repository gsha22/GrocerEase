You are **updating** an existing development specification after the **user story**, **acceptance criteria**, or **implementing code** has changed.

Reuse the same product vocabulary, story framing, and rigor you used in **P2** (user stories, AC, implementation notes): do not rewrite in a different voice unless the product direction changed.

---

## Output shape (must match a new spec)

The final file MUST have **exactly** these top-level sections, in this order:

1. H1: `# Development specification: {slug} — <short name>` (refresh the subtitle if the feature scope clearly changed).
2. `## Primary and secondary owners`
3. `## Merge date`
4. `## Architecture diagram (Mermaid)`
5. `## Information flow diagram (Mermaid)`
6. `## Class diagram (Mermaid)`
7. `## Classes in implementation`
8. `## Technologies, libraries, and external APIs`
9. `## Database data types and storage`
10. `## Failure mode effects (frontend)`
11. `## Personally Identifying Information (PII)`
12. `## Minors and PII`

Do **not** add any other top-level `##` sections. Use `###` inside sections.

---

## How to merge old doc + new PR

You receive:

- The **previous specification** (full markdown).
- The **current PR** title, body, number, author/assignees, merge state, linked issues, changed-file list, and **unified diff** (may be truncated).

### General rules

1. **Preserve correct legacy content.** If a section of the old spec is still accurate after the diff, keep it (minor wording tweaks OK).
2. **Apply the diff surgically.** Prefer editing paragraphs, tables, and diagram code in place over deleting whole sections.
3. **Mark removals.** If the PR removes behavior, add a short `**Removed in this revision:**` note in the affected section (or strike through obsolete bullets) instead of silently deleting.
4. **No invented scope.** Only describe behavior, data, and components evidenced by the PR body + diff + supplied metadata. Mark gaps `TBD` with what is needed to confirm.

### Section-specific update rules

**`## Primary and secondary owners`**  
Refresh if PR assignees/author or linked issue text implies a handoff; otherwise keep prior names.

**`## Merge date`**  
- Keep prior merge history bullets.  
- **Append** a new bullet for **this** documentation refresh: ISO timestamp (use review / generation time from supplied context if merge time still unknown), PR number, one line on what changed in the implementation or story.  
- If the implementing PR has merged since the last spec (`merged_at` present in context), add/update the canonical **“merged to main”** line with that UTC timestamp.

**`## Architecture diagram (Mermaid)`**, **`## Information flow diagram (Mermaid)`**, **`## Class diagram (Mermaid)`**  
Regenerate all three diagrams so they match the **post-PR** codebase. If only one layer changed, still re-render the full diagram so it stays self-contained.

**`## Classes in implementation`**  
Reconcile the inventory with the diff: add/remove classes and interfaces, update public/private lists, fix paths.

**`## Technologies, libraries, and external APIs`**  
Update versions and rows when `package.json`, lockfiles, or new imports appear in the diff.

**`## Database data types and storage`**  
Update fields, purposes, and byte estimates when Prisma schema, migrations, or usage changed.

**`## Failure mode effects (frontend)`**  
Update only if UX, network, or error paths changed; otherwise add one sentence: `No change from prior revision for this PR.` and cite the diff.

**`## Personally Identifying Information (PII)`** and **`## Minors and PII`**  
Update if collection, storage, routing, or policy-relevant behavior changed; otherwise `No change from prior revision for this PR.` with a one-line diff citation.

---

## Rules

- Output **only** the full updated Markdown file (no preamble, no “here is your document”).
- If the diff is truncated, add a single `Assumption:` note in `## Merge date` or the first updated technical section.
