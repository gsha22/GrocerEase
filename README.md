# PGH Local Grocers (GrocerEase)

A lightweight discovery platform that helps Pittsburgh shoppers find out what nearby neighborhood grocery stores have in stock before they leave home.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
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
  (dashboard)/           — owner routes (auth-protected)
    dashboard/page.tsx
    dashboard/profile/page.tsx
    dashboard/posts/page.tsx
    dashboard/deals/page.tsx
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
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `npx prisma migrate dev` | Run pending migrations |

## Branch Strategy

All feature work branches off `main` after this scaffold is merged. See the implementation brief for the full story dependency graph and branch naming conventions (`feature/story-N-description`).
