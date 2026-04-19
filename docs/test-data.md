# Deterministic Test Data

This project ships with deterministic relational fixtures for manual QA, demos, and automated tests across all 12 user stories.

## Seed Commands

- `npm run db:seed` - clears and re-seeds all application tables with deterministic test data.
- `npm run db:reset` - runs `prisma migrate reset --force` and then runs `npm run db:seed`.

Expected runtime is typically under 1 minute after dependencies/migrations are ready.

## Determinism Strategy

- Fixed IDs for all records (UUID constants).
- Fixed seed clock: `2026-04-14T12:00:00.000Z`.
- Derived timestamps are deterministic offsets from that clock.
- Deterministic password hashing with a fixed bcrypt salt.

Owner test password for all seeded owners: `OwnerPass123!`

## Seeded Entities

- **Store owners (8)**  
  Includes 6 owners with stores and 2 owners without stores for authz/setup checks.
- **Stores (6 published)**  
  Multiple Pittsburgh neighborhoods with valid lat/lng coordinates and specialty categories (`asian`, `halal`, `organic`, `produce`, `ebt`).
- **Shoppers (12)**  
  Non-owner accounts for authorization boundary tests.
- **Items (14)**  
  In-stock and out-of-stock items, typo/fuzzy-search variants (`Bok Choi`, `Cillantro`), and mixed `last_updated` values.
- **Fresh updates/posts (8)**  
  Includes fresh (<48h), stale (>48h), and soft-deleted records.
- **Deals (12)**  
  Active, expiring-soon, expired, historical reusable deal, duplicated active deal (`source_deal_id`), and soft-deleted deal.
- **Alerts (4)**  
  Item and store-follow alerts to preserve relational completeness.

## Story Coverage Matrix

| User Story | Seed Support |
|---|---|
| Fresh Today Updates (Shopper) | Recent updates at Lotus/Crescent + stale update at Three Rivers and a store scenario with no update in last 7 days |
| Deals This Week | Active + expiring-soon deals at Lotus/Crescent with deterministic expiry ordering |
| Discover Nearby Stores | 3 stores with valid Pittsburgh geolocation coordinates across distinct neighborhoods |
| Filter Stores by Specialty | Category combinations across `asian`, `halal`, `organic`, `produce`, `ebt` |
| Search for a Specific Item | Item names include realistic terms and typo variants (`Bok Choy`/`Bok Choi`, `Cillantro`) |
| Secure Store Owner Login | Seeded owner accounts with deterministic bcrypt hashes and known plaintext QA password |
| Create a Store Profile | Owner account with no store (`newowner@no-store.test`) supports create-profile happy path |
| Post a Deal with Expiry | Stores/items exist for creating new deals with explicit expiration timestamps |
| Reuse Past Deals | `Past lamb special (historical)` + `source_deal_id` duplicate active record |
| Edit or Delete a Post | Fresh update soft-delete example and mutable owner-owned post records |
| Fresh Today Updates (Owner) | Owner-linked stores with existing posts to edit and new-post baseline |
| Browse Without an Account | Published stores, non-expired deals, and public-facing updates available without auth |

## Edge Cases Included

- Stale fresh updates (`created_at` older than 48 hours).
- Store with no updates in last 7 days behavior.
- Expired deals (`expires_at` in the past and `is_expired=true`).
- Soft-deleted posts/deals (`deleted_at` set).
- Out-of-stock inventory.
- Non-owner + owner-without-store records for authorization checks.

## Fixture Source

- `prisma/fixtures.ts` - canonical fixture IDs, timestamps, and entities.
- `prisma/seed.ts` - seed execution logic (delete + recreate in FK-safe order).
