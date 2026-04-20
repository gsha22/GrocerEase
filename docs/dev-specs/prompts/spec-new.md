You are generating a **new** development specification as a single **Markdown** document.

## Required sections (in order)

1. **Title** — `# Development specification: {slug} — …`
2. **User story** — Restate the story in “As a / I want / so that” form **only if** inferable from the PR; otherwise say what the PR appears to implement.
3. **Summary** — 2–4 sentences: what behavior shipped and who it is for.
4. **Scope** — Bullet list of **in-scope** capabilities in this PR.
5. **Out of scope / follow-ups** — Bullets for obvious gaps (empty if none).
6. **User-visible behavior** — How a user triggers and experiences the feature (routes, pages, key UI).
7. **Implementation map** — Table or bullets: **area** (e.g. API route, component, lib), **path** (repo-relative), **role**.
8. **Data & persistence** — Prisma models, fields, migrations **if** touched; else “No schema changes in this diff.”
9. **APIs** — Method, path, auth expectations, request/response notes (from code).
10. **Errors & edge cases** — Validation, empty states, failure modes visible in code.
11. **Testing** — Existing automated tests or scripts that cover this (file paths); suggested **human** checks if none.
12. **Traceability** — PR number, link placeholder `https://github.com/OWNER/REPO/pull/N`, linked GitHub issue numbers if present in the PR body.

## Rules

- Use **only** the supplied PR metadata and **code diff**; do not invent features not evidenced by the diff.
- Prefer **concrete file paths** and symbols from the diff.
- If the diff is truncated, say so in a short note and still document what is visible.
- Output **nothing** outside the Markdown document (no preamble).
