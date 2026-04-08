# HAT: User Story 6 — Secure store owner login

**Related:** GitHub issue [#72](https://github.com/gsha22/GrocerEase/issues/72)  
**Tester:** Clarence Choy

## Outcome

After following the human acceptance test instructions in issue [#72](https://github.com/gsha22/GrocerEase/issues/72), the tester **successfully completed** all steps and navigated the scenario without problems.

## Steps Executed

All 7 steps from issue #72 were executed in order:

1. Navigated to the store owner login page.
2. Entered valid credentials and submitted — redirected to the store dashboard.
3. Confirmed dashboard displayed only own store's data (no cross-store data visible).
4. Logged out successfully.
5. Attempted login with incorrect credentials — error message displayed.
6. Pasted the dashboard URL while logged out — redirected to the login page.
7. "Forgot password" link was available; clicked it and confirmed a reset email flow was initiated.

## Metrics Evaluation

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Login success/failure clarity** | ✅ Pass | Tester understood immediately whether login worked; error messaging on invalid credentials was clear. |
| 2 | **Access isolation confidence** | ✅ Pass | Tester saw no data belonging to another store after login (see Q1). |
| 3 | **Recovery flow completeness** | ✅ Pass | Tester expressed confidence in regaining access without external help (see Q2); password reset email flow was confirmed. |

## Survey

### Q1. After logging in, did you notice anything that belonged to a store other than yours?

**Answer:** No — dashboard showed only my store's listings.

### Q2. If you forgot your password on a busy morning, how confident are you that you could get back into your account quickly without calling someone?

**Answer:** Pretty confident — there's a "Forgot password" link that sends a reset email, so I wouldn't need to contact anyone.

### Q3. On a scale of your banking app to a random website you signed up for once, where does this login experience fall in terms of how secure it feels?

**Answer:** Feels like logging in to a trusted site that doesn't use Google OAuth — more trustworthy than a random sign-up page, though not quite as polished as a banking app.

## Iteration

No issues were encountered during the test session. No iteration was required.
