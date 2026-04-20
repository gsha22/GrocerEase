# P4 Task 4 — Automated Testing Procedure

This document describes the automated test coverage we added for the three
P4 user stories and the repeatable workflow we use to drive an LLM agent
to author those tests. Tests live alongside the feature they cover: each
story's test file is committed to the same branch and PR that introduces
the feature (so the PR lands the implementation **and** its tests in one
reviewable unit).

## Tooling

- **Test runner**: [Jest](https://jestjs.io/) (already configured for this
  repo in [jest.config.mjs](../jest.config.mjs) and
  [jest.setup.ts](../jest.setup.ts)), with `jest-environment-jsdom`.
- **Assertions / DOM**: `@testing-library/react` +
  `@testing-library/jest-dom` + `@testing-library/user-event`.
- **CI**: GitHub Actions — the `Test` job in
  [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs
  `npx jest` on every pull request, alongside `Lint`, `Type Check`, and
  `Build`.
- **Agent**: Claude Code (Opus 4.7), same configuration as Task 3.

## Repeatable steps

The agent runs these ordered steps for each story. The steps are
identical across stories; only the component under test differs.

1. **Open a tracking issue.**
   We opened one GitHub issue per story specifically for the test work,
   referencing the parent story issue, so reviewers can see the testing
   sub-task separately from the implementation:
   - US15 test coverage → issue **#128** (parent #119, PR #126)
   - US16 test coverage → issue **#129** (parent #120, PR #124)
   - US17 test coverage → issue **#130** (parent #121, PR #125)

2. **Check out the story's feature branch.**
   ```
   git fetch origin feature/us-<n>-<slug>
   git checkout feature/us-<n>-<slug>
   ```
   We do **not** open a new branch — tests land on the same branch that
   introduced the feature. This keeps the diff reviewable as a single
   unit and guarantees CI runs both the implementation and its tests on
   the same PR.

3. **Read the component + surrounding patterns.**
   - The client component under test (`components/<Name>.tsx` or
     `app/(public)/<page>/page.tsx`).
   - Any existing test file that already exercises similar patterns
     (e.g. `tests/StoreAlertSubscribe.test.tsx` as a reference for
     mocking `next/link` and viewer-role branches;
     `tests/MapPage.test.tsx` as a reference for the Map page).
   - The acceptance criteria of the parent story issue.

4. **Author the test** with the *system prompt* below.

5. **Run the test locally**:
   ```
   npx jest tests/<NewFile>.test.tsx
   ```
   Only push if every assertion passes locally.

6. **Commit + push to the feature branch** with a message that references
   the tracking issue (so GitHub cross-links it on the issue timeline):
   ```
   git commit -m "test(us<N>): <one-line summary>

   Refs #<tracking-issue>"
   git push
   ```

7. **Watch the PR's Test job turn green.**
   `gh pr checks <PR> --repo gsha22/GrocerEase --watch`. If it fails,
   switch to the debugging prompt from
   [p4-code-generation-procedure.md](./p4-code-generation-procedure.md).

## System prompt used for test authoring

Paste this prompt into the agent alongside the component code and the
parent story's acceptance criteria. The prompt is the same for every
story — only the component and story number change.

> You are adding Jest tests to the `GrocerEase` Next.js 16 repo. The
> repo already uses `jest-environment-jsdom` + `@testing-library/react`
> + `@testing-library/user-event`. Add a new file under
> `tests/<Component>.test.tsx` that covers the user story quoted below.
> Follow these constraints:
>
> 1. **Test behavior, not implementation.** Assert what a shopper or
>    owner actually sees in the DOM — role-gated CTAs, chip state,
>    success and error messages — not internal state. Prefer
>    `getByRole` with accessible names over test IDs.
> 2. **Mock at the right seam.** Mock `next/link` as a plain anchor,
>    `next/dynamic` as a stub component, `navigator.geolocation`, and
>    `global.fetch`. Do not mock the component under test.
> 3. **Exercise every branch that is load-bearing for the story.**
>    Viewer-role gating (null / shopper / owner), success paths,
>    dedupe/error paths, and any empty-state copy that exists for a
>    reason. If the story specified a particular HTTP status (e.g. 429
>    for 24 h dedupe), assert that the friendly error text surfaces.
> 4. **Keep async assertions correct.** Wrap interactions that trigger
>    React state updates in `act(...)`, and use
>    `await screen.findByText(...)` / `waitFor(...)` for anything that
>    depends on a resolved fetch.
> 5. **One file per story.** Do not edit unrelated tests. If the story's
>    feature already has a sibling test file (e.g. `tests/MapPage.test.tsx`),
>    *add a new file* rather than modifying it — the existing tests
>    encode the contract from earlier stories.
> 6. **Head comment = story pointer.** Start the file with a short
>    docstring that names the story (`Story N — title`), the parent
>    issue (`#119/#120/#121`), and the tracking issue (`#128/#129/#130`),
>    so a reviewer can jump from the test to the requirements.
>
> When you're done, run `npx jest tests/<NewFile>.test.tsx` locally and
> paste the output. Do not merge.

## Human responsibilities (what we explicitly did not automate)

- **Judging whether the test coverage matches the story.** The agent
  generates the tests, but a human verifies that every bullet of the
  parent story's acceptance criteria is covered by at least one
  assertion before approving the PR.
- **Merging** — the agent never merges.
- **Deciding what *not* to test.** We consciously skipped E2E / Playwright
  tests for P4 to keep the diff small and the CI runtime under a minute.

## Tests delivered, per story

### US15 — Shopper ratings (#119, PR #126, tracking #128)

File: [tests/StoreRatingsPanel.test.tsx](../tests/StoreRatingsPanel.test.tsx)

Component under test: [components/StoreRatingsPanel.tsx](../components/StoreRatingsPanel.tsx)

| # | Test | What it asserts |
|---|------|-----------------|
| 1 | `aggregate header › shows 'no ratings yet' when average is null` | Empty summary renders the "No ratings yet. Be the first!" copy, not a zero-star fake aggregate. |
| 2 | `aggregate header › shows the average and total when ratings exist` | Populated summary renders `4.3`, `12 ratings`, and the first rating's note body. |
| 3 | `viewer-role gating › shows a sign-in CTA for logged-out viewers` | `viewerRole={null}` renders a link whose `href` points to `/shopper/login?callbackUrl=…`. |
| 4 | `viewer-role gating › shows the same CTA for owner viewers` | Owners do not see the rating form — they see the shopper sign-in CTA (owners are not the target audience for US15). |
| 5 | `shopper submit flow › POSTs the selected score and renders 'Your rating' on success` | Clicking the 4-star button + Submit hits `POST /api/stores/s1/ratings` with body `{ score: 4 }`, then the UI swaps in the "Your rating" card showing `4/5`. |
| 6 | `shopper submit flow › deletes the shopper's own rating via DELETE` | Given an existing own-rating, clicking "Delete my rating" hits `DELETE /api/stores/s1/ratings/mine-1` and restores the star-picker form. |

### US16 — Map category filters (#120, PR #124, tracking #129)

File: [tests/MapPageCategoryFilters.test.tsx](../tests/MapPageCategoryFilters.test.tsx)

Component under test: [app/(public)/map/page.tsx](../app/(public)/map/page.tsx)

| # | Test | What it asserts |
|---|------|-----------------|
| 1 | `buildMapStoresApiUrl › omits the category param when none are selected` | An empty `Set` produces a URL with no `category=` query param. |
| 2 | `buildMapStoresApiUrl › joins multiple categories with commas` | `new Set(["asian", "halal"])` serializes to `category=asian%2Chalal`. |
| 3 | `buildMapStoresApiUrl › serializes category only, even without coords` | Null coords + one category → `/api/stores?category=produce` (no `lat`/`lng`/`radius`). |
| 4 | `MapPage UI › renders a row of category filter chips` | The Asian / Halal / Produce chips are present as buttons after initial load. |
| 5 | `MapPage UI › shows category tags on each store card under the map` | A fetched store's `categories: ["asian"]` is rendered as a tag pill on its card. |
| 6 | `MapPage UI › refetches /api/stores with category=asian when the Asian chip is toggled` | After clearing the fetch mock, clicking the Asian chip triggers exactly one `fetch` call whose URL contains `category=asian`. |
| 7 | `MapPage UI › shows the filtered empty-state copy when no stores match` | After selecting a chip that yields an empty array, the header switches to "No stores match the selected filters." (distinct from the "Finding stores near you…" initial-load copy — this is the contract we regressed and then restored in commit `036b33c`). |

### US17 — Incorrect-info reports (#121, PR #125, tracking #130)

File: [tests/StoreReportButton.test.tsx](../tests/StoreReportButton.test.tsx)

Component under test: [components/StoreReportButton.tsx](../components/StoreReportButton.tsx)

| # | Test | What it asserts |
|---|------|-----------------|
| 1 | `viewer-role gating › shows a sign-in CTA for logged-out viewers` | `viewerRole={null}` renders a `/shopper/login?callbackUrl=…` link instead of the report form. |
| 2 | `viewer-role gating › shows a sign-in CTA for owner viewers` | Owners can't self-report their own store — they see the shopper sign-in CTA. |
| 3 | `viewer-role gating › renders the report trigger for shoppers` | Shoppers see the "Report incorrect info" button. |
| 4 | `shopper flow › submits the selected type and shows the acknowledgement` | Clicking the trigger opens the form; clicking the "Hours wrong" chip selects it; clicking "Send report" hits `POST /api/stores/store-42/report` with body `{ type: "incorrect_hours" }`; the "Thanks — your report was submitted." ack appears. |
| 5 | `shopper flow › surfaces the server error on 429 dedupe` | When the server responds 429 with `{error: "You already reported this store recently…"}`, the friendly message appears in the form and the ack does **not** replace the form (shopper can correct and retry after 24 h). |

## How each test maps to its story's acceptance criteria

- **US15 Human-AC: "I can rate a store 1–5 stars and leave an optional
  short tip."** → Tests 5 & 6 (submit flow + delete-own-rating).
- **US15 Human-AC: "I see an average and total rating count on the
  store page."** → Tests 1 & 2 (aggregate header).
- **US15 Human-AC: "Only signed-in shoppers can rate."** → Tests 3 & 4
  (viewer-role gating).
- **US16 Machine-AC: "/api/stores accepts `category=a,b,c` and returns
  stores matching *any* of the listed categories."** → Tests 1–3
  (`buildMapStoresApiUrl` serialization).
- **US16 Human-AC: "I can filter the map by category with a row of
  chips."** → Tests 4, 5, 6 (chip rendering, category tags on cards,
  refetch-on-toggle).
- **US16 Human-AC: "When my filters don't match anything, I see a copy
  that says so — not the same empty state as 'still loading'."** →
  Test 7 (filtered-empty copy).
- **US17 Machine-AC: "A shopper reporting the same store twice within
  24 hours gets a 429 with a friendly message."** → Test 5.
- **US17 Human-AC: "Only signed-in shoppers can report; owners can't
  self-report their own store."** → Tests 1–3.
- **US17 Human-AC: "After submitting, I see 'Thanks — your report was
  submitted.'"** → Test 4.

## Successful CI runs

Each PR's `Test` job (which runs `npx jest` against the full
`tests/**` suite, including the tests added by this task) passed on
GitHub Actions:

- US15 (PR #126) → https://github.com/gsha22/GrocerEase/pull/126/checks
- US16 (PR #124) → https://github.com/gsha22/GrocerEase/pull/124/checks
- US17 (PR #125) → https://github.com/gsha22/GrocerEase/pull/125/checks

The `Test` job runs alongside `Lint`, `Type Check`, and `Build` on every
push; all four must pass before a PR is mergeable.
