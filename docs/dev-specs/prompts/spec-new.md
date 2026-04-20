You are generating a **new** development specification as a single **Markdown** document.

The output MUST use **exactly** these top-level sections, in this order:

1. One H1 title line (see below).
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

Do not add any other top-level `##` sections. You may use `###` and lower headings inside each section.

---

### H1 title line (first line of file)

`# Development specification: {slug} — <short feature name inferred from PR>`

---

### Section content requirements (rubric)

**`## Primary and secondary owners`**  
- Primary owner (name or GitHub handle). Infer from supplied PR author / assignee context; if unknown, `Unknown — fill from GitHub issue` and say what is missing.  
- Secondary owner (prefer assignee not equal to primary; else `None listed — fill from GitHub issue`).

**`## Merge date`**  
- If merge timestamp is supplied in context and the PR is merged, give **UTC** merge date/time.  
- If context says the PR is **not merged** at generation time, start with exactly:  
  `Not merged to main at time of this document generation (workflow ran on PR approval).`  
  Then add a bullet to record the real merge timestamp after merge.  
- If merge time is unknown, say what evidence is needed.

**`## Architecture diagram (Mermaid)`**  
- One fenced Mermaid diagram showing **where** each part runs (browser, Next.js server, API routes, DB, third-party cloud, CI, etc.) for **this user story**.

**`## Information flow diagram (Mermaid)`**  
- One fenced Mermaid diagram: **user information** and **application data** between components, with **direction** on arrows.

**`## Class diagram (Mermaid)`**  
- One fenced Mermaid diagram: classes **and interfaces** relevant to this story, with **inheritance / implements** edges.  
- Do **not** omit any class or interface that appears in the diff or is clearly required for the story (TypeScript `interface` and `type` used as object shapes count).

**`## Classes in implementation`**  
For each relevant class / interface / module: path, then **public** fields and methods (grouped by concept, each with purpose), then **private** fields and methods (grouped by concept, each with purpose).

**`## Technologies, libraries, and external APIs`**  
Table (or structured list): technology, **version**, used for, why chosen over alternatives, **URL** to homepage/docs + author/maintainer. Include language, framework, ORM, DB, auth, hosting, CI, common libs — nothing “obvious” omitted.

**`## Database data types and storage`**  
For each long-term stored entity touched by this story: table/entity name; each field’s purpose; **estimated bytes** per row (show assumptions or formulas).

**`## Failure mode effects (frontend)`**  
For each: process crash; lost runtime state; erased stored data; corrupt DB data observed; RPC failure; client overload; client OOM; DB full; network loss; DB access loss; bot spam — give **user-visible** and **internal** effects.

**`## Personally Identifying Information (PII)`**  
For each PII item in long-term storage affected by this story: why kept; how stored; how entered; path through **modules → components → classes → methods → fields** before storage and after retrieval; **team member** responsible for securing that store; **routine and non-routine auditing** procedures. If none, justify with diff evidence.

**`## Minors and PII`**  
Answer: minor PII solicited/stored? why? guardian permission? team policy re access by persons convicted/suspected of child abuse? If N/A, justify.

---

## Rules

- Ground claims in **PR text, supplied owner/merge context, changed-file list, and diff**. Mark guesses `Assumption:`.
- If the diff is truncated, note it once under `## Merge date` or the first technical section.
- Output **only** the Markdown document (no preamble).
