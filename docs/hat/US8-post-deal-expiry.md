# HAT: User Story 8 — Post a deal with expiry

**Related issue:** [#71 — HAT: US 8 — Post a Deal with Expiry](https://github.com/gsha22/GrocerEase/issues/71)  
**Implementing PR:** [#27 — feat: Story 8 owner deal posting, expiry maintenance, expiring-soon alerts](https://github.com/gsha22/GrocerEase/pull/27)  
**Tester:** Clarence Choy

## User story

As a store owner, I want to post a deal with a price, description, and expiry date so that shoppers see time-sensitive promotions that automatically clear when they end.

## Prerequisites

- The tester is logged in as a store owner with an existing store profile.
- A clock or timer is available to verify expiry behavior.

## Outcome

**Partially completed.** Clarence Choy followed the human acceptance test instructions in issue [#71](https://github.com/gsha22/GrocerEase/issues/71). He **posted a deal**, confirmed **validation** for past expiry and missing fields, and verified the deal on the store’s **public profile**. He did **not** run the full time-based checks (steps 6–7): waiting for expiry and the one-hour notification was deferred because the session window was too long.

A **dashboard inconsistency** surfaced during the run (see **User note**); that gap was closed in a follow-up change (see **Iteration**).

Traceability note: this document references issue **#71** as the source-of-truth HAT ticket; original feature delivery is tracked under **#27**.

## Steps executed

Protocol from issue #71 (record results after the session):

1. From the owner dashboard, navigated to the **deals** section.
2. Created a new deal with a valid item name, discount description, price, and a **future** expiry date (5–10 minutes ahead for testing where applicable).
3. Submitted the deal and confirmed it appears on the store’s **public profile** page.
4. Attempted to create a deal with a **past** expiry date and confirmed the system rejects it with a descriptive error.
5. Attempted to create a deal with a **missing required field** and confirmed a validation error is shown.
6. *(Skipped — session time.)* Wait for the posted deal to expire; refresh the public store page and confirm the expired deal is no longer visible.
7. *(Skipped — session time.)* Check whether you received a notification when the deal was within one hour of expiring.

## Metrics evaluation

Rationale (from test design): (1) **Post-to-publish latency** measures how quickly value reaches shoppers after the owner submits — deals are time-sensitive, so delay undermines the promotion. (2) **Expiry reliability** is the main trust metric from research: if expired deals linger, shoppers waste trips and the product promise breaks. (3) **Error prevention** reflects that stopping bad data at entry is cheaper than cleaning it up later; missing expiry or a past date is actively harmful.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Post-to-publish latency** (deal visible to shoppers soon after submit) | ⚠️ Partial | The deal appeared promptly on the **public** store page; the owner **home** dashboard still showed zero active deals until the post-HAT fix (see **Iteration**). |
| 2 | **Expiry reliability** (expired deals no longer visible to shoppers) | ⚠️ Not exercised | Steps 6–7 were skipped, so disappearance after expiry was **not** verified in this session (see Q2). |
| 3 | **Error prevention** (validation blocks invalid deals) | ✅ Pass | Past expiry and missing required fields were rejected with clear errors (steps 4–5). |

## Survey

### Q1. Think about how you currently tell customers about a special. How does this compare in terms of effort?

**Answer:** Currently, store owners don’t really tell people about deals in advance. For this, you can notify your customers (I think).

### Q2. Did you trust that the deal would actually stop showing when the expiry passed, or did you feel like you’d need to check?

**Answer:** No because I couldn’t really test that.

### Q3. Was there anything about the form that slowed you down or made you hesitate?

**Answer:** No.

## User note

Verbatim note from Clarence Choy during the session:

> When I create a deal it shows on the public store page but not my owner dashboard active deals section. Had to skip steps 6-7 because it lowk takes a long time.

## Iteration

The tester’s note pointed to a real issue: the **owner dashboard home** tile **“Active deals”** was **hardcoded to `0`**, so owners could see a live deal on the public store while the dashboard still implied none were active. **`app/(dashboard)/dashboard/page.tsx`** now counts deals with the same rules as shopper-facing listings (`deletedAt: null`, `isExpired: false`, `expiresAt > now`) and updates the helper line when the count is positive.

The **manage deals** page had been classifying “active” rows using the **browser clock**, which can disagree slightly with the server that powers the public store. **`GET /api/stores/:id/deals`** now returns a server-computed **`isActive`** flag per deal, and **`ManageDealsClient`** prefers that when splitting active vs past deals.

Finally, the deals screen had a **duplicate “Deals”** heading inside the client while the layout already provided the portal title; the redundant block was removed from **`ManageDealsClient.tsx`** so “Your deals” reads clearly under the page header.
