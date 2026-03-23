# Story 1: Fresh Today Updates (Shopper)

High-resolution UI prototype screenshots for User Story 1.

> **As a shopper** deciding whether a local store is worth visiting, I want to see a store's recent "fresh today" or "newly in stock" updates on its profile page so that I can make an informed decision about whether to make the trip before I leave home.

## Screenshots

### `us1_fresh_loaded.png` — Loaded state
The store profile page with active "Fresh Today" entries visible. Each item shows its name, an optional note, and a relative timestamp (e.g., "posted 1h ago"). Items older than 48 hours appear de-emphasized (reduced opacity, smaller text, gray badge).

### `us1_fresh_loading.png` — Loading state
Skeleton loading state shown while fresh update data is being fetched from the API. Uses shimmer animation placeholders that match the shape of the final content.

### `us1_fresh_empty.png` — Empty state (no recent updates)
Displayed when the store has no inventory updates within the last 7 days. Shows a friendly empty state with an icon, message, and encouragement to check back soon.

## Acceptance Criteria Demonstrated
- Each store profile page displays a "Fresh Today" section with timestamped entries
- Updates older than 48 hours are visually de-emphasized
- The page loads with all inventory highlights visible without additional taps
- An empty state is shown when no updates exist in the last 7 days
- Each update item displays: item name, optional note, and post time
