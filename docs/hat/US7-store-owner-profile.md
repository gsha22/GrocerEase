# HAT: User Story 7 — Store owner profile (create / manage store)

**Related issue:** [#73 — HAT: US 7](https://github.com/gsha22/GrocerEase/issues/73)  
**Implementing PR:** [#50 — US 7: Create a Store Profile](https://github.com/gsha22/GrocerEase/pull/50)  
**Tester:** Clarence Choy

## Prerequisites

- A test store owner account exists with known valid credentials (email + password).
- The owner can create or update a store profile (per the HAT issue — e.g. seed “no store” owner or an owner without a published profile yet).
- The store profile URL (`/dashboard/profile`) and public directory (`/`) are known for verification.

## Outcome

After following the human acceptance test instructions in issue [#73](https://github.com/gsha22/GrocerEase/issues/73), the tester **successfully completed** the flow, including **creating a new store profile**.

Traceability note: this document references issue **#73** as the source-of-truth HAT ticket.

## Steps Executed

All 7 steps from issue #73 were executed in order:

1. Logged in to the owner dashboard as the prepared store owner account.
2. Located the option to create a new store profile and navigated to the profile page (`/dashboard/profile`).
3. Filled in all required fields: store name, address, hours of operation, and at least one specialty category.
4. Submitted the profile and confirmed the app indicated success (confirmation / published state) without blocking errors.
5. Opened the public store directory in a separate tab and confirmed the new store appeared in the list and on the map.
6. Returned to the profile editor, edited the store hours, saved the change, and verified it reflected on the public store profile.
7. Attempted to submit a profile with a required field missing; confirmed an error message was displayed without clearing other entered data.

## Metrics Evaluation

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Profile creation completion rate** | ✅ Pass | Tester completed create/publish quickly; noted desire for more optional fields (e.g. brief description) — see Q1. |
| 2 | **Time from submission to public visibility** | ✅ Pass | Store appeared in the directory after publish; tester had a positive reaction — see Q2. |
| 3 | **Error recovery ease** | ✅ Pass | Correcting store hours was straightforward — see Q3. |

## Survey

### Q1. Walk me through how you'd describe the process of setting up your store to a fellow store owner. Would you call it quick, or would you warn them about anything?

**Answer:** Yes it's quick but I feel like you could add more information to your store that isn't an option here. Like brief description

### Q2. After you submitted your profile, did you check the public directory to see if it showed up? How did that feel?

**Answer:** Yes, it felt nice to see that it updated

### Q3. If you made a mistake in your store hours, how easy was it to go back and fix it?

**Answer:** Super easy

## Iteration

No issues were encountered during the test session. No iteration was required.
