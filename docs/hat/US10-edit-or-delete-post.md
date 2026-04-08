# HAT: User Story 10 — Edit or delete a post

**Related issue:** [#67 — HAT: US 10 — Edit or delete a post](https://github.com/gsha22/GrocerEase/issues/67)  
**Implementing PR:** [#42 — Story 10: Edit or delete a post](https://github.com/gsha22/GrocerEase/pull/42)  
**Tester:** Clarence Choy

## User story

As a store owner, I want to edit or delete a post I made so that I can correct mistakes or remove an item that sold out faster than expected.

## Prerequisites

- The tester is logged in as a store owner with **at least two** existing posts (fresh-today updates or deals).
- A **second** browser tab (or window) is open to the **public** store profile page to verify shopper-visible updates.

## Outcome

After following the human acceptance test instructions in issue [#67](https://github.com/gsha22/GrocerEase/issues/67), the tester **successfully completed** the edit and delete flows, including confirmation on delete and verification on the public store view.

Traceability note: this document references issue **#67** as the source-of-truth HAT ticket.

## Steps Executed

All 7 steps from issue #67 were executed in order:

1. From the owner dashboard, navigated to **Manage Posts** (or equivalent).
2. Selected an existing post and chose **Edit**.
3. Changed the **description** or **price** and saved; on the public-facing tab, **refreshed** and confirmed the change was **reflected**.
4. Selected **another** post and chose **Delete**.
5. Observed whether a **confirmation** prompt appeared before deletion.
6. **Confirmed** the deletion; refreshed the public store page and confirmed the post was **no longer visible**.
7. Checked that the deleted post did **not** reappear after **further** page refreshes.

## Metrics Evaluation

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Edit-to-live latency** (edit visible to shoppers quickly) | ✅ Pass | Updates were observable on the public view after refresh; no meaningful delay that would undermine trust for “sold out” style corrections (aligned with survey confidence in Q3). |
| 2 | **Accidental deletion prevention** (confirmation before permanent removal) | ✅ Pass | Confirmation step was present and felt **helpful**, not annoying (see Q2). |
| 3 | **Perceived control** (owner trust that the digital storefront matches reality) | ✅ Pass | Tester felt **confident** shoppers see what matches the store after edits/deletes (see Q3). |

## Survey

### Q1. If an item sold out in your store 10 minutes ago, walk me through how you'd update the app. Did anything in that process feel too slow?

**Answer:** I will go to owner portal, click on deals, and delete the deals with the sold out item

### Q2. When you deleted the post, did the confirmation step feel helpful or annoying?

**Answer:** It feels helpful

### Q3. After editing and deleting a few things, do you feel confident that what shoppers see right now matches what's actually in your store?

**Answer:** Yes

## Iteration

No issues were encountered during the test session. No iteration was required.
