# Dev spec LLM prompts (for course submission)

These files are the **prompts** referenced in the assignment: one for **new** specs, one for **updates**. The GitHub Action composes them with PR metadata and the diff via [`.github/prompts/dev-spec-generate.prompt.yml`](../../.github/prompts/dev-spec-generate.prompt.yml).

| Prompt | File | Use when |
|--------|------|----------|
| **New development specification** | [`spec-new.md`](./spec-new.md) | No `docs/dev-specs/USn-development-spec.md` on `main` yet (first generation for that story). |
| **Update development specification** | [`spec-update.md`](./spec-update.md) | That file already exists; story or code changed; refresh the same rubric sections. |

**P2 alignment:** Both prompts tell the model to keep the same story/AC tone and rigor you used in P2; `spec-update.md` states that explicitly.

When turning in to Gradescope, you can submit **PDF or text exports** of these two files plus the composed template, or **GitHub blob URLs** to these paths on `main` after merge.
