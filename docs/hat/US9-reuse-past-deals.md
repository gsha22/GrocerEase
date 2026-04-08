# HAT: User Story 9 — Reuse past deals

**Related issue:** [#69 — HAT: US 9 — Reuse past deals](https://github.com/gsha22/GrocerEase/issues/69)  
**Implementing PR:** [#40 — feat: added button to reuse old coupon with new expiration date](https://github.com/gsha22/GrocerEase/pull/40)  
**Tester:** Clarence Choy

## Prerequisites

- The tester is logged in as a store owner with **at least two** previously posted deals that are **now expired**.
- The owner dashboard **deals** section shows both **active** and **past** (expired) deals.
- The public store page URL for that store is known, to verify a newly published active deal.

## Outcome

After following the human acceptance test instructions in issue [#69](https://github.com/gsha22/GrocerEase/issues/69), the tester **successfully completed** the reuse flow: duplicated a past deal, edited fields, published a **new** active deal, and confirmed the **original** past deal remained unchanged in history.

Traceability note: this document references issue **#69** as the source-of-truth HAT ticket.

## Steps Executed

All 7 steps from issue #69 were executed in order:

1. From the owner dashboard, navigated to the **deals** section.
2. Located the list of **past deals** (expired deals).
3. Selected a past deal and chose the option to **reuse / duplicate** it.
4. Observed whether deal fields (e.g. item, description, price) were **pre-filled** from the original.
5. Edited at least one field (e.g. **expiry** set to a future date and/or **price** adjusted).
6. Submitted the reused deal and confirmed it appears as a **new, active** deal on the **public** store page.
7. Verified the **original** past deal remained **unchanged** in the history.

## Metrics Evaluation

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Time saved vs. creating from scratch** | ✅ Pass | Reuse path felt meaningfully faster than re-entering a long description from scratch; aligns with intent to use reuse for recurring-style promos (see Q3). |
| 2 | **Editing confidence (carry-over vs. changes)** | ✅ Pass | Tester reported it was **obvious** which fields carried over and what still needed updating (see Q2). |
| 3 | **Repeat usage intent** | ✅ Pass | Tester would **reuse** the flow next time, especially when a **long description** is involved (see Q3). |

## Survey

### Q1. How often do you run the same or similar promotions? (Weekly, monthly, occasionally, rarely)

**Answer:** Idk I'm not a store owner. But I think Costco rotates promos like around every 2 weeks.

### Q2. When you duplicated the deal, was it obvious which fields were carried over and which you needed to update?

**Answer:** Yes

### Q3. Next time you want to run a promotion you've done before, would you look for this reuse button first, or just create a new one from scratch?

**Answer:** Yes I would reuse it, especially if I had a long description

## Iteration

No issues were encountered during the test session. No iteration was required.
