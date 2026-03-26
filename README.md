# PGH Local Grocers (GrocerEase)

A lightweight discovery platform that helps Pittsburgh shoppers find out what nearby neighborhood grocery stores have in stock before they leave home.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js 16 (App Router) |
| Auth | Auth.js (Credentials provider) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Geocoding | Google Maps Geocoding API |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project (free tier works)
- A Google Maps Geocoding API key

### Setup

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd GrocerEase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase `DATABASE_URL`, a `NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`), and your `GOOGLE_MAPS_API_KEY`.

4. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (public)/              — unauthenticated routes
    page.tsx             — home / store directory
    stores/[id]/page.tsx — store profile
    map/page.tsx         — map view
    deals/page.tsx       — deals feed
    login/page.tsx       — owner login
    signup/page.tsx      — owner registration
  (dashboard)/           — owner routes (auth-protected)
    dashboard/page.tsx
    dashboard/profile/page.tsx
    dashboard/posts/page.tsx
    dashboard/deals/page.tsx
  auth/                  — JSON auth helpers
    login/route.ts
    signup/route.ts
  api/                   — API routes
    auth/[...nextauth]/route.ts
    stores/route.ts
    stores/[id]/route.ts
    stores/[id]/updates/route.ts
    stores/[id]/deals/route.ts
    stores/[id]/items/route.ts
    alerts/route.ts
prisma/
  schema.prisma          — database schema (7 tables)
components/              — shared UI components
lib/                     — utilities (Prisma client, helpers)
middleware.ts            — protects /dashboard/* routes
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed deterministic relational test fixtures |
| `npm run db:reset` | Reset DB and re-seed deterministic fixtures |
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `npx prisma migrate dev` | Run pending migrations |
| `npm run test:auth` | HTTP integration tests for auth & session (needs running app) |
| `npm run test:signup` | HTTP integration tests for `POST /auth/signup` (needs running app + DB) |
| `npm run test:store-profile` | HTTP integration tests for store profile create/edit (needs running app + DB) |
| `npm run test:geocode` | Geocoding branch tests (mocked; optional real Google API check) |

### Running `test:geocode`

`scripts/geocode-branch-tests.ts` exercises `lib/geocode-address.ts` in two ways:

1. **Mocked (default, no network required)** — Always runs when you execute `npm run test:geocode`. It stubs `fetch` so you can assert both behaviors deterministically:
   - Google returns `OK` → coordinates come from the API response.
   - Google fails or the key is unset → deterministic Pittsburgh-area fallback is used.

2. **Live integration (optional)** — Makes one real request to the Google Geocoding API to confirm your key, billing, and API restrictions work from your machine. Requires network access and `GOOGLE_MAPS_API_KEY` in `.env` (loaded via `dotenv`).

   ```bash
   GEOCODE_LIVE_TEST=1 npm run test:geocode
   ```

   If the live step passes, you should see a log line with `lat`/`lng` for a fixed Pittsburgh test address. If it fails, fix the key or Google Cloud console settings (Geocoding API enabled, key not overly restricted for server-side use) before relying on production geocoding.

The live check is optional because CI and offline runs cannot depend on Google’s availability or quotas; the mocked tests are the stable regression suite.

### Running `test:auth`

These tests call a **live** Next.js server and your database (same as local dev).

1. Set `.env` (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` matching the server origin).
2. Apply migrations and seed: `npx prisma migrate deploy` and `npm run db:seed`.
3. Build and start the app in another terminal (or use dev):

   ```bash
   npm run build && npm run start
   ```

   For `next dev`, the default URL is `http://localhost:3000`.

4. Run the suite:

   ```bash
   npm run test:auth
   ```

   If the app listens on another host/port:

   ```bash
   TEST_BASE_URL=http://localhost:3000 npm run test:auth
   ```

The script (`scripts/auth-machine-tests.ts`) covers login, dashboard protection, owner-only APIs, forgot-password stub, and **session persistence** (cookie still valid for `/api/auth/session` and `/` after login, `/login` redirects to `/dashboard` when already signed in).

### Running `test:signup`

Same prerequisites as `test:auth` (running Next server, `DATABASE_URL`, secrets). Then:

```bash
npm run test:signup
```

Optional: `TEST_BASE_URL=http://localhost:3000 npm run test:signup`.

The script (`scripts/signup-machine-tests.ts`) asserts validation errors (**400**), duplicate email (**409**), successful create (**201**) with **no password** in JSON, **Set-Cookie** session, **`/api/auth/session`** shows the new user, **`POST /auth/login`** works with the chosen password, and duplicate signup is rejected.

## Test Data Fixtures

Use deterministic test data for QA/demo/integration scenarios:

```bash
npm run db:seed
```

Full fixture inventory and story coverage mapping: `docs/test-data.md`.

### Seeded store owner logins (testing)

After `npm run db:seed`, every seeded store shares the same fixture password. Use the **login email** at `/login` to exercise the owner dashboard and authenticated APIs.

| Store (seed) | Login email | Password |
| --- | --- | --- |
| Lotus Asian Market | `linh@lotus-market.test` | `OwnerPass123!` |
| Crescent Halal Grocer | `abdullah@crescent-halal.test` | `OwnerPass123!` |
| Three Rivers Organic Produce | `maria@3rivers-produce.test` | `OwnerPass123!` |
| Tokyo Mart Shadyside | `jiyeon@tokyo-mart.test` | `OwnerPass123!` |
| River Halal Hub | `omar@river-halal.test` | `OwnerPass123!` |
| East End Organic Pantry | `evelyn@eastend-organic.test` | `OwnerPass123!` |

Owners in the seed **without** a linked store (useful for onboarding flows): `newowner@no-store.test`, `backupowner@no-store.test` — same password **`OwnerPass123!`**.

> These credentials are for **local/demo databases only**. Do not reuse this password in production.

New owners can also self-register at **`/signup`** (email, password, display name).

## Branch Strategy

All feature work branches off `main` after this scaffold is merged. See the implementation brief for the full story dependency graph and branch naming conventions (`feature/story-N-description`).
