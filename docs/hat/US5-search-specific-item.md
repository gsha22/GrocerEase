# HAT: User Story 5 — Search for a specific item

**Related issue:** [#70 — HAT: US 5 — Search for a specific item](https://github.com/gsha22/GrocerEase/issues/70)  
**Implementing PR:** [#32 — Add store inventory search with fuzzy matching + restock “Notify me” alerts](https://github.com/gsha22/GrocerEase/pull/32)  
**Bugfix PR (sub-issue #102):** [#112 — fix(search): link FreshUpdates to Items on post, filter stale/deleted from search](https://github.com/gsha22/GrocerEase/pull/112)  
**Tester:** Clarence Choy

## User story

As a shopper, I want to see if a specific local store has the specialty produce I need (e.g., bok choy, shin ramen) so I don't waste a trip.

## Prerequisites

- A store has items in its inventory, including at least one item marked **In stock** and one marked **Out of stock**.
- The inventory has been updated within the last few hours (so timestamps are recent).
- At least one item has a common misspelling variant (e.g. **bok choy** can be found by searching **bok choi**).

## Outcome

**Completed after remediation.** Clarence Choy ran the US 5 protocol from issue [#70](https://github.com/gsha22/GrocerEase/issues/70). The **initial** session exposed a defect: **inventory search did not work reliably** even for a newly posted item, and **grayed-out** (stale / deleted) rows still appeared in search results — which undermined stock trust. The failure was tracked under sub-issue **[#102 — HAT: US 5 - BUG](https://github.com/gsha22/GrocerEase/issues/102)** and addressed by **[#112](https://github.com/gsha22/GrocerEase/pull/112)** (*fix(search): link FreshUpdates to Items on post, filter stale/deleted from search*), which was merged and closed. Survey responses below reflect the tester’s experience during the session (including confusion about grayed-out rows) and remain valuable for UX copy and trust design.

Traceability note: primary HAT ticket **#70**; original feature **#32**; bug follow-up **#102**; fix **#112**.

## Steps executed

Protocol from issue #70 (record results after the session):

1. Navigated to a **store profile** page or the **global search** bar.
2. Searched for an item known to be **in stock** (name provided by the test coordinator).
3. Observed search results: whether each result showed **item name**, **stock status** badge, and **last-updated** timestamp.
4. Searched again using a **deliberate misspelling** (e.g. **bok choi** instead of **bok choy**) and checked whether the correct item still appeared.
5. Searched for an item that is **out of stock** and confirmed the **Out of stock** indicator was visible.
6. If available, used the **Notify me** toggle for the out-of-stock item.
7. **Timed** the flow: from typing the **first search character** to **confirming stock status** (for metric 1).

## Metrics evaluation

Rationale (from test design): (1) **Search-to-answer time** frames the “wasted trip” problem as an information-speed problem — under ~15 seconds is the behavioral benchmark vs. calling the store (The Mom Test). (2) **Fuzzy match success** tests error tolerance for specialty spelling. (3) **Stock trust** validates the value hypothesis: without trust in the badge and timestamp, the feature can increase false confidence (Lean Startup).

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Search-to-answer time** (first keystroke → confirmed stock status) | ⚠️ Initial run blocked | **Pre-#112:** Search did not behave reliably (including for a **newly posted** item), so a clean timing benchmark was not representative. **Post-#112:** Engineering fix targets correct item linkage and stale/deleted filtering — **re-run timed step** in a follow-up session if needed. |
| 2 | **Fuzzy match success** (misspelled query still returns correct item) | ⚠️ Initial run unreliable | **Pre-#112:** Same search reliability issues polluted fuzzy-match evaluation. **Post-#112:** Re-verify misspelling path against known fixtures. |
| 3 | **Stock trust** (belief in “In stock” from timestamp) | ⚠️ Mixed / qualitative | Survey: **yes** for **“updated 3 hours ago”** (with caveat for very busy stores); **no** for **“updated 2 days ago”** for groceries. Tester was **uncertain what grayed-out results meant** (see Q3) — aligns with stale-row bug before #112. |

## Survey

### Q1. If you saw "In Stock — updated 3 hours ago" for an item, would you feel confident enough to drive to the store for it? What about "updated 2 days ago"?

**Answer:** Yes for updated 3 hours ago unless it's a super poppin store. No for updated 2 days ago because I wouldn't want my grocery to be that old anyways and it's probably gone

### Q2. Tell me about a time you went to a store for a specific item and it wasn't there. How does this search experience compare to how you usually check availability?

**Answer:** I went to Target hoping there was the original sriracha but there wasn't.

### Q3. Was there a point during the search where you felt uncertain about what the results were telling you?

**Answer:** Yes, I don't know what it means when an item was grayed out.

## Iteration

- **Original implementation:** Story 5 search shipped in **[#32 — Add store inventory search with fuzzy matching + restock “Notify me” alerts](https://github.com/gsha22/GrocerEase/pull/32)**.
- **Bug found during HAT:** Inventory search failed in practice (including after posting an item); **grayed-out** (expired/deleted) content still appeared in results — eroding clarity and trust.
- **Sub-issue:** **[#102 — HAT: US 5 - BUG](https://github.com/gsha22/GrocerEase/issues/102)** (linked from **#70**).
- **Fix (closed #102):** **[#112 — fix(search): link FreshUpdates to Items on post, filter stale/deleted from search](https://github.com/gsha22/GrocerEase/pull/112)** — merged; addresses linkage between fresh updates and items and excludes stale/deleted rows from search.
- **Follow-up:** Re-run steps 2–7 and refresh metric 1–2 after **#112** is deployed, and consider UI copy or legend for any remaining “de-emphasized” or empty states so grayed rows are self-explanatory.
