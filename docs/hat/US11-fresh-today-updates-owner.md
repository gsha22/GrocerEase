# HAT: User Story 11 — Fresh Today updates (owner)

**Related issue:** [#65 — HAT: Discover nearby stores (shopper)](https://github.com/gsha22/GrocerEase/issues/65)  
**Implementing PR:** _Add PR link when tracked with the HAT issue._  
**Tester:** Christine Tran

## User story

As a store owner, I want to post "fresh today" or "newly in stock" updates on my store profile so that shoppers can see what is currently available and decide to visit my store.

## Prerequisites

- The tester is logged in as a store owner with an existing store profile.
- A second browser/tab is open to the public store profile page.

## Steps executed

Protocol (record results after the session):

1. From the owner dashboard, locate the "Post Update" or "Fresh Today" input area.
2. Enter an item name (e.g., "Fresh dragon fruit — just arrived") and an optional note.
3. Submit the update.
4. Switch to the public store profile tab and refresh. Confirm the update appears with the item name, note, and a timestamp (e.g., "posted just now").
5. Time yourself: from opening the form to seeing the update live on the public page, how long did it take? _(Record for **metric 1**.)_
6. Post a second update. Confirm the newer one appears above the first.
7. If possible, view an update you posted more than 48 hours ago and confirm it appears de-emphasized or hidden.

## Metrics evaluation

Rationale (from test design): (1) **Posting speed** reflects on-the-floor feasibility (under ~30 seconds). (2) **Publish confirmation** reduces owner uncertainty and silent churn. (3) **Consistency intent** tests whether owners would feed the system habitually (growth hypothesis).

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Posting speed** (can the owner post an update in under 30 seconds?) | _TBD_ | _Use step 5 timing._ |
| 2 | **Publish confirmation** (does the owner see clear evidence that their update is live?) | _TBD_ | |
| 3 | **Consistency intent** (would the owner post updates like this daily as part of their routine?) | _TBD_ | |

## Survey

### Q1. How does the time it took to post this compare to how you'd currently tell customers about a new shipment (e.g., WeChat, sign in the window, Facebook post)?

**Answer:** "Well I probably would've made a facebook post or some kind of printed flyer at the front of the store, but this would've definitely be quicker. But if i were the boss i'd make my employees do it, so I wouldn't be doing it"

### Q2. After you posted the update, were you confident it was showing to shoppers right away, or did you feel the need to double-check?

**Answer:** "Yeah, it was really cool how it shows up for the shoppers who subscribed to me/my store, I'm quite confident"

### Q3. Realistically, on a busy weekday morning when a delivery just came in, would you take 30 seconds to post an update here?

**Answer:** (note, Christine is a student, not a real store owner) "Yeah I think so? Then again it would be my employees so I'd just tell them to do it" 

