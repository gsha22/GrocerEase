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

### Deploy to Vercel

This app is a standard Next.js project. **You** connect the Git repo in the [Vercel dashboard](https://vercel.com) and set environment variables there. Step-by-step instructions (Postgres, `NEXTAUTH_URL`, migrations) are in **[docs/deploy-vercel.md](docs/deploy-vercel.md)**.

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
    shopper/login/page.tsx — shopper login
    shopper/signup/page.tsx — shopper registration (canonical; `/signup/shopper` redirects here)
    shopper/account/page.tsx — shopper account (auth-protected)
  (dashboard)/           — owner routes (auth-protected)
    dashboard/page.tsx
    dashboard/profile/page.tsx
    dashboard/posts/page.tsx
    dashboard/deals/page.tsx
  auth/                  — JSON auth helpers
    login/route.ts
    signup/route.ts
    shopper/login/route.ts
    shopper/signup/route.ts
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
| `npm run test:shopper-auth` | HTTP integration tests for shopper signup/login & alerts (needs running app + DB) |
| `npm run test:signup` | HTTP integration tests for `POST /auth/signup` (needs running app + DB) |
| `npm run test:store-profile` | HTTP integration tests for store profile create/edit (needs running app + DB) |
| `npm run test:geocode` | Geocoding branch tests (mocked; optional real Google API check) |

### Shopper signup URLs

Use **`/shopper/signup`** as the canonical shopper registration page. The legacy path **`/signup/shopper`** (and query params such as `callbackUrl`) **redirects** to the same place so old bookmarks and links keep working.

### Owner password reset

1. Request a reset from **`/login/forgot`** → `POST /auth/forgot-password` (creates a one-time token in the database; response message is always the same to avoid email enumeration).
2. **Email delivery:** set **`RESEND_API_KEY`** and **`EMAIL_FROM`** (see `.env.example`), or **`SENDGRID_API_KEY`** with **`SENDGRID_FROM_EMAIL`** / **`EMAIL_FROM`**. Resend is preferred if both keys are present.
3. Complete the reset at **`/login/reset`** using the link from the email. If no provider is configured, the reset URL is only logged in **development** (see server terminal).
4. See **`docs/security-audit.md`** for `npm audit` policy and **`docs/database-rls.md`** for Postgres/Supabase RLS checks on staging.

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

### Running `test:shopper-auth`

Same prerequisites as `test:auth` (running server, migrated DB, **`npm run db:seed`** so shoppers have password hashes). Then:

```bash
npm run test:shopper-auth
```

Optional: `TEST_BASE_URL=http://localhost:3000 npm run test:shopper-auth`.

The script (`scripts/shopper-auth-machine-tests.ts`) covers `POST /auth/shopper/signup` and `POST /auth/shopper/login`, duplicate email (**409**), session `role: "shopper"`, `/api/alerts` requiring a shopper session, and shoppers blocked from `/dashboard` and `POST /api/stores`.

If shopper login tests return **401** while owner login still works, restart the dev server (`npm run dev`) so it picks up the latest auth code, or run against a production build (`npm run build && npm run start`).

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

### Seeded shopper logins (testing)

After `npm run db:seed`, every seeded shopper shares the same fixture password. Sign in at **`/shopper/login`** (not `/login`, which is for store owners).

| Display name (seed) | Login email | Password |
| --- | --- | --- |
| Nina Shopper | `nina.shopper@testmail.com` | `ShopperPass123!` |
| Jordan Shopper | `jordan.shopper@testmail.com` | `ShopperPass123!` |
| Alex Shopper | `alex.shopper@testmail.com` | `ShopperPass123!` |
| Taylor Shopper | `taylor.shopper@testmail.com` | `ShopperPass123!` |
| Sam Shopper | `sam.shopper@testmail.com` | `ShopperPass123!` |
| Riley Shopper | `riley.shopper@testmail.com` | `ShopperPass123!` |
| Morgan Shopper | `morgan.shopper@testmail.com` | `ShopperPass123!` |
| Jamie Shopper | `jamie.shopper@testmail.com` | `ShopperPass123!` |
| Drew Shopper | `drew.shopper@testmail.com` | `ShopperPass123!` |
| Casey Shopper | `casey.shopper2@testmail.com` | `ShopperPass123!` |
| Cameron Shopper | `cameron.shopper@testmail.com` | `ShopperPass123!` |
| Peyton Shopper | `peyton.shopper@testmail.com` | `ShopperPass123!` |

Nina and Jordan have sample **alerts** in the seed data (useful for checking `/api/alerts` after logging in as a shopper).

> These credentials are for **local/demo databases only**. Do not reuse these passwords in production.

New shoppers can also self-register at **`/shopper/signup`**. New owners can register at **`/signup`** (email, password, display name).

## Branch Strategy

All feature work branches off `main` after this scaffold is merged. See the implementation brief for the full story dependency graph and branch naming conventions (`feature/story-N-description`).
