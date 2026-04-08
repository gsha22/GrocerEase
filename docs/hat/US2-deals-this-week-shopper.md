# HAT: User Story 2 — Deals this week (shopper)

**Related issue:** [#63 — HAT: Deals this week (shopper)](https://github.com/gsha22/GrocerEase/issues/63)  
**Implementing PR:** [#19 — feat: implement deals this week for shoppers (Story 2)](https://github.com/gsha22/GrocerEase/pull/19)  
**Tester:** Scarlett Huang

## User story

As a cost-conscious grocery shopper, I want to see any active deals or discounts that a local store is currently running so that I can factor in potential savings when deciding where to shop this week.

## Prerequisites

- A store profile exists with at least 3 active deals (varying expiry dates).
- One deal is set to expire within the next hour.
- One deal has already expired (to verify it does not appear).

## Outcome

**Completed.** Scarlett Huang ran all seven steps per issue [#63](https://github.com/gsha22/GrocerEase/issues/63). All steps completed successfully. She recalled a specific deal (halal lamb) and indicated she would adjust her shopping plans based on it. Metric 1 (scan time) was not formally recorded during this session — that data point should be captured in a follow-up test. UI polish comments were noted for a future sprint (see Iteration).

## Steps executed

Protocol from issue #63 (record results after the session):

1. Navigate to a store profile that has active deals.
2. Locate the "Deals This Week" section on the store page.
3. Review each deal entry: does it show the item or category, discount description, and an expiry date?
4. Confirm that deals appear sorted with the soonest-expiring deal first.
5. Check whether any expired deal is visible on the page.
6. Navigate to a store with no active deals. Observe the empty state message.
7. Time yourself: from the moment you see the deals section, how long does it take to scan all active deals? _(Record time for metric 1.)_

## Metrics evaluation

Rationale (from test design): (1) **Scan speed** measures efficient use (The Mom Test—observed behavior vs hypotheticals; sub-30s scan is the design target). (2) **Deal clarity** is signal-to-noise: shoppers should grasp each deal without re-reading. (3) **Purchase influence** is the behavioral “would it change where you shop?” check from lean practice.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Scan speed** (time to review all deals and identify if any are relevant) | Pass |  Definitely sub-30 seconds, according to tester. |
| 2 | **Deal clarity** (can the shopper explain what each deal offers without re-reading?) | Partial | Q1: she recalled the product context (lamb, halal store) but not the end date (“some Tuesday”)—expiry clarity is weak. |
| 3 | **Purchase influence** (would any deal change where the shopper shops this week?) | Pass | Q2: deal could shift her trip—“probably shift my gears and go there” if the store has what she wants. |

## Survey

### Q1. Without scrolling back, can you describe one of the deals you just saw? What was it for and when does it end?

**Answer:** "Lamb, it was for some Halal store. I don't know when it ends, some tuesday i think."

### Q2. Thinking about your grocery plans this week, did anything you saw just now make you reconsider where you'd shop?

**Answer:** "Yeah, I would love to check it out if the lamb is on sale, and if the store has plenty of things i want. I will probably shift my gears and go there."

### Q3. Have you ever shown up to a store for a deal that turned out to be over? How would you feel if that happened through this app?

**Answer:** "Uhhh no not really, I don't really go to stores for deals or anything. So i can't say."

## Iteration

She commented that the deal cards felt visually cramped and the expiry date was hard to notice at a glance. These are non-blocking UI polish items (typography spacing and expiry-date prominence) deferred to a future sprint. 
