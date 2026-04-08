# HAT: User Story 4 — Filter stores by specialty

**Related issue:** [#68 — HAT: US 4 — Filter stores by specialty](https://github.com/gsha22/GrocerEase/issues/68)  
**Implementing PR:** [#15 — feat: implement store filtering by specialty category (Story 4)](https://github.com/gsha22/GrocerEase/pull/15)  
**Tester:** Clarence Choy

## User story

As a shopper, I want to filter stores by specialty category (e.g., Asian groceries, halal, organic, EBT accepted) so that I can find stores relevant to my specific needs.

## Prerequisites

- The store directory contains stores tagged with **at least three** different specialty categories.
- At least one category has **multiple** matching stores; at least one category has **only one** matching store.

## Outcome

After following the human acceptance test instructions in issue [#68](https://github.com/gsha22/GrocerEase/issues/68), the tester **successfully completed** the filter workflow on the store directory, including single-filter, combined (**AND**) filters, clearing filters, and confirming the full list restored.

Traceability note: this document references issue **#68** as the source-of-truth HAT ticket.

## Steps executed

All 7 steps from issue #68 were executed in order:

1. Navigated to the **store directory** page (`/`).
2. Located the **filter** options (e.g. Asian groceries, halal, organic, produce, EBT accepted).
3. Selected **one** filter and observed how the list updated (including whether it updated **without a full page reload**).
4. Selected a **second** filter simultaneously and confirmed the results **narrowed** (**AND** logic).
5. **Cleared one** filter and confirmed the results **broadened** accordingly.
6. **Cleared all** filters and confirmed the **full list** was restored.
7. Observed **visual treatment** of active filters (highlighting) and whether filters could be **removed individually**.

## Metrics evaluation

Rationale (from test design): (1) **Task success rate** is a binary pass/fail usability metric — if users can't operate the filters correctly, the feature has zero value regardless of design polish. (2) **Response latency perception**: per lecture on engagement metrics, perceived performance directly affects whether users trust and reuse a feature; sub-second is the bar. (3) **Relevance satisfaction** is a precision metric — the Lean Startup build-measure-learn loop requires that what we deliver matches what the user asked for; wrong results are worse than no results.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Task success rate** (apply, combine, and clear filters without errors) | ✅ Pass | Tester completed the filter journey without confusion; category use case in the survey was straightforward (see Q1). |
| 2 | **Response latency perception** (instant vs. noticeable wait) | ✅ Pass | Filtering felt **fast enough** that the tester did not perceive an annoying wait (see Q2). |
| 3 | **Relevance satisfaction** (results match expectations for selected categories) | ✅ Pass | Category **labels were clear**; tester could map a dietary need to an appropriate filter choice (see Q3). |

## Survey

### Q1. Imagine you just moved to a new neighborhood and keep kosher (or have another dietary requirement). Walk me through how you'd use this page to find a store. Was anything confusing?

**Answer:** I would go to the store page and find the Kosher filter to filter stores that sell Kosher ingredients.

### Q2. When you tapped a filter, did the results update fast enough that you didn't notice a wait?

**Answer:** Yes it was fast enough

### Q3. Were the category labels clear to you, or were there any that you weren't sure what they meant?

**Answer:** Yes they were clear

## Iteration

No issues were encountered during the test session. No iteration was required.
