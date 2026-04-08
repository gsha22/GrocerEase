# Human acceptance tests (HAT)

Manual QA outcomes and survey responses for user stories. Each file maps to one story.

| User story | HAT issue | Document |
|------------|-----------|----------|
| US 6 — Secure store owner login | [#72](https://github.com/gsha22/GrocerEase/issues/72) | [US6-store-owner-login.md](./US6-store-owner-login.md) |
| US 9 — Reuse past deals | [#69](https://github.com/gsha22/GrocerEase/issues/69) | [US9-reuse-past-deals.md](./US9-reuse-past-deals.md) |
| User story | Document |
|------------|----------|
| US 1 — Fresh Today updates (shopper) | [US1-fresh-today-updates-shopper.md](./US1-fresh-today-updates-shopper.md) |
| US 2 — Deals this week (shopper) | [US2-deals-this-week-shopper.md](./US2-deals-this-week-shopper.md) |
| US 3 — Discover nearby stores (shopper) | [US3-discover-nearby-stores-shopper.md](./US3-discover-nearby-stores-shopper.md) |
| US 6 — Secure store owner login | [US6-store-owner-login.md](./US6-store-owner-login.md) |
| US 11 — Fresh Today updates (owner) | [US11-fresh-today-updates-owner.md](./US11-fresh-today-updates-owner.md) |
| US 12 — Subscribe to a store or item (shopper) | [US12-subscribe-store-or-item-shopper.md](./US12-subscribe-store-or-item-shopper.md) |

_Add additional rows and files (e.g. `US7-….md`) as other HATs are run._

## Linking the documentation PR to GitHub

When you open a pull request that adds or updates these HAT markdown files, **link it to the HAT issue** so traceability shows up on GitHub:

- **US 9** (`US9-reuse-past-deals.md`): link the PR to **[#69](https://github.com/gsha22/GrocerEase/issues/69)** — e.g. put `Closes #69`, `Fixes #69`, or `Resolves #69` in the PR description, or connect the issue under **Development** on the PR sidebar (use whichever matches your team’s workflow for closing vs. only referencing the issue).
