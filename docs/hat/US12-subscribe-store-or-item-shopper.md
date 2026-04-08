# HAT: User Story 12 — Subscribe to a store or item (shopper)

**Related issue:** [#64 — HAT: Subscribe to a store or item (shopper)](https://github.com/gsha22/GrocerEase/issues/64)  
**Implementing PR:** https://github.com/gsha22/GrocerEase/pull/108
**Tester:** Scarlett Huang

## User story

As a logged-in shopper, I want to subscribe to alerts for a specific store or item so that I am notified when new updates or restocks are posted.

## Prerequisites

- The tester has a shopper account and is logged in.
- At least one store has a published profile.
- The test coordinator is prepared to post a new update or deal on a store the tester has subscribed to.
- A second browser/session is set up as the store owner to trigger updates.

## Outcome

_Pending._ After Scarlett Huang completes the human acceptance test per issue [#64](https://github.com/gsha22/GrocerEase/issues/64), update this section with whether all steps completed successfully and any blockers.

## Steps executed

Protocol from issue #64 (record results after the session):

1. Navigate to a store's profile page while logged in as a shopper.
2. Locate the "Follow this store" or "Subscribe" button.
3. Tap to subscribe. Confirm visual feedback (e.g., button changes to "Unsubscribe" or "Following").
4. If available, also subscribe to a specific out-of-stock item via "Notify me."
5. Ask the test coordinator to post a new "Fresh Today" update or deal on the store you subscribed to.
6. Navigate to your "My Alerts" or notifications inbox. Confirm the new update appears. _(Record elapsed time from coordinator post to inbox visibility for **metric 1**.)_
7. Mark the notification as read. Confirm it moves to a read section.
8. Navigate back to the store profile and unsubscribe. Confirm the button reverts.
9. Attempt all of this while logged out — confirm you see a prompt to log in or sign up.

## Metrics evaluation

Rationale (from test design): (1) **Subscription-to-notification latency** is the passive-discovery promise—slow delivery misses time-sensitive value. (2) **Inbox comprehension** checks whether the shopper knows what happened, from which store, and what to do next. (3) **Unsubscribe ease** supports trust and opt-in willingness.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Subscription-to-notification latency** (how quickly after a store posts does the shopper see it in their inbox?) | Inconclusive | Q1: she would **check later**, not open immediately—low urgency once a notification exists, separate from server/UI delay. |
| 2 | **Inbox comprehension** (can the shopper understand what happened, which store it was from, and what action to take?) | Pass (channel fit) | Q2: finds alerts **acceptable** vs noisy push/SMS; **web-only** reduces “bother,” which supports a scannable inbox mental model. (Does not explicitly restate store/item clarity.) |
| 3 | **Unsubscribe ease** (can the shopper stop alerts without friction?) | Pass | Q3: **confident** alerts would stop after unsubscribe (pragmatic / slightly humorous tone, no reported lingering doubt about the control). |

## Survey

### Q1. After you got the notification, what was your first instinct — to open it immediately, check it later, or ignore it?

**Answer:** "I would check it later probably, i actually rarely turn notifications on for anything... so I wouldn't immediately open it."

### Q2. Think about a group chat or app notification you actually find useful (not annoying). How does this compare?

**Answer:** "Yeah this is pretty acceptable, i like how it stays in the web only so I won't be bothered by it."

### Q3. When you unsubscribed, were you confident the alerts would actually stop?

**Answer:** "Um yeah... I have to be confident right? What else can I do LOL"

