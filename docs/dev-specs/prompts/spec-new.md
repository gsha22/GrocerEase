You are generating a **new** development specification as a single **Markdown** document.

## Required headings (exact text)

Use these exact headings in this order.

1. `# Development specification: {slug} — ...`
2. `## User story`
3. `## Summary`
4. `## Scope`
5. `## User-visible behavior`
6. `## Files changed`
7. `## Implementation map`
8. `## Data & persistence`
9. `## APIs`
10. `## Errors & edge cases`
11. `## Testing`
12. `## Traceability`
13. `## Out of scope / follow-ups`

## Rules

- Use **only** the supplied PR metadata and **code diff**; do not invent features not evidenced by the diff.
- Prefer **concrete file paths** and symbols from the diff.
- In `## Files changed`, group paths by area and use only changed files from the supplied list.
- In `## Traceability`, include:
  - PR number and full PR URL
  - user story slug (e.g. `US4`)
  - linked issue URLs (or `None found in PR metadata` if absent)
- If the diff is truncated, say so in a short note and still document what is visible.
- Output **nothing** outside the Markdown document (no preamble).
