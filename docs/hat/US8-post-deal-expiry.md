# HAT: User Story 8 — Post a deal with expiry

**Related issue:** [#71 — HAT: US 8 — Post a Deal with Expiry](https://github.com/gsha22/GrocerEase/issues/71)  
**Implementing PR:** [#27 — Story 8: owner deal posting, expiry maintenance, expiring-soon alerts](https://github.com/gsha22/GrocerEase/pull/27)  
**Tester:** Clarence Choy

## User story

As a store owner, I want to post a deal with a price, description, and expiry date so that shoppers see time-sensitive promotions that automatically clear when they end.

## Prerequisites

- The tester is logged in as a store owner with an existing store profile.
- A clock or timer is available to verify expiry behavior.

## Outcome

Clarence Choy ran the US 8 protocol from issue [#71](https://github.com/gsha22/GrocerEase/issues/71). He **posted a deal** and confirmed it **appeared on the public store page**. He **skipped steps 6–7** (waiting for expiry and checking the one-hour notification) because the window would take too long in-session.

Survey answers are recorded below. One **product issue** showed up during the run: the owner experience did not clearly reflect the new deal in the same way shoppers saw it (see **Iteration**).

Traceability note: primary HAT ticket **#71**; original feature **#27**.

## Steps executed

Protocol from issue #71 (record results after the session):

1. From the owner dashboard, navigated to the **deals** section.
2. Created a new deal with a valid item name, discount description, price, and a **future** expiry date (5–10 minutes ahead for testing where applicable).
3. Submitted the deal and confirmed it appears on the store’s **public profile** page.
4. Attempted to create a deal with a **past** expiry date — confirmed the system rejects it with a descriptive error.
5. Attempted to create a deal with a **missing required field** — confirmed a validation error is shown.
6. _(Skipped — time)_ Wait for the posted deal to expire; refresh the public store page and confirm the expired deal is no longer visible.
7. _(Skipped — time)_ Check for a notification when the deal was within one hour of expiring.

## Metrics evaluation

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Post-to-publish latency** | ⚠️ Partial | Deal appeared on the **public** store page promptly after submit; dashboard “signal” was misleading before the fix (see **Iteration**). |
| 2 | **Expiry reliability** | ⚠️ Not fully exercised | Steps 6–7 were skipped, so end-to-end expiry visibility was **not** verified in this session. |
| 3 | **Error prevention** | ✅ Pass | Past expiry and missing required fields were rejected with clear validation (per protocol steps 4–5). |

## Survey

**Protocol questions**

1. Think about how you currently tell customers about a special. How does this compare in terms of effort?
2. Did you trust that the deal would actually stop showing when the expiry passed, or did you feel like you’d need to check?
3. Was there anything about the form that slowed you down or made you hesitate?

**Tester notes (verbatim)**

> When I create a deal it shows on the public store page but not my owner dashboard active deals section. Had to skip steps 6-7 because it lowk takes a long time.

**Answers — Clarence Choy**

1. Currently, store owners don’t really tell people about deals in advance. For this, you can notify your customers (I think).
2. No because I couldn’t really test that.
3. No.

## Iteration

- **Dashboard “Active deals” stat was wrong:** The owner **home** dashboard showed a **hardcoded `0`** for “Active deals” even after a valid deal was live on the public store. That matched the tester’s impression that the dashboard did not reflect active promotions. **Fix:** `app/(dashboard)/dashboard/page.tsx` now loads the store id and uses `prisma.deal.count` with the same rules as shopper-facing listings (`deletedAt: null`, `isExpired: false`, `expiresAt > now`), and the subtitle switches to “Shown on your store & deals feed” when the count is positive.
- **Owner deal list vs server time:** The manage-deals page classified “active” rows using the **browser clock** (`Date.now()`), which can disagree slightly with the server used for the public store page. **Fix:** `GET /api/stores/:id/deals` now includes a server-computed **`isActive`** flag per row; `ManageDealsClient` prefers that flag when bucketing active vs past deals.
- **Duplicate “Deals” heading:** The deals route layout already titled the page; the client component repeated a full **Deals** heading. **Fix:** removed the redundant heading block inside `ManageDealsClient.tsx` so the primary “Your deals” list reads clearly under the portal header.
