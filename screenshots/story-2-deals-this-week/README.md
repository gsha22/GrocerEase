# Story 2: Deals This Week (Shopper)

High-resolution UI prototype screenshots for User Story 2.

> **As a cost-conscious grocery shopper**, I want to see any active deals or discounts that a local store is currently running so that I can factor in potential savings when deciding where to shop this week.

## Screenshots

### `us2_deals_loaded.png` — Deals directory (loaded)
The dedicated deals page showing all active promotions across local stores, sorted by expiry date (soonest-expiring first). Each deal card displays the deal title, store name, and expiry date. Deals expiring soon show an urgent badge (e.g., "Ends Thu").

### `us2_deals_empty.png` — Deals directory (empty state)
Displayed when no stores have any active deals. Shows a friendly empty state encouraging the shopper to check back next week.

### `us2_deals_profile.png` — Deals on store profile
The "Deals This Week" section as it appears on an individual store's profile page, showing only that store's active deals with discount descriptions and expiry dates.

## Acceptance Criteria Demonstrated
- A "Deals This Week" section on the store profile displays active promotions
- Each deal shows: item or category, discount description, and expiry date
- Expired deals are automatically hidden from the public view
- An empty state message is shown if the store has no active deals
- Deals are ordered by expiry date, soonest-expiring first
