# Deploy GrocerEase to Vercel

Deployment must be done from **your** Vercel account (this repo cannot be deployed for you automatically).

## 0. Common failure: `Can't reach database server at 127.0.0.1:5432`

That means **`DATABASE_URL` in Vercel still points at localhost** (often copied from a developer’s `.env`). Vercel runs in AWS regions — there is no Postgres on `127.0.0.1` there.

**Fix:** In **Vercel → Project → Settings → Environment Variables**, set `DATABASE_URL` to your **hosted** Postgres connection string (Supabase dashboard → Settings → Database → URI, or Neon/Vercel Postgres). Use the **pooled** URL for serverless if the provider recommends it. Remove any `127.0.0.1` or `localhost` value, save, then **Redeploy** (Deployments → … → Redeploy). Run `npx prisma migrate deploy` against that same database from your laptop once.

## 1. Push the code to GitHub (or GitLab / Bitbucket)

Vercel deploys from a Git repository.

## 2. Create a production Postgres database

Use **Supabase**, **Neon**, **Vercel Postgres**, or any Postgres that allows connections from Vercel’s regions.

**Easiest on Vercel:** **Storage → Create → Supabase** in your Vercel team — it provisions Postgres and syncs env vars (often `POSTGRES_PRISMA_URL`). GrocerEase picks that up automatically; see **[vercel-supabase-integration.md](./vercel-supabase-integration.md)**.

Otherwise copy the **connection string** into `DATABASE_URL`. Use a **pooled** URL for serverless if your provider recommends it.

## 3. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Import your Git repository.
3. **Framework Preset:** Next.js (auto-detected).
4. **Root directory:** repository root (default).
5. **Build command:** `npm run build` (default).
6. **Install command:** `npm install` or `npm ci` (default).

`postinstall` runs `prisma generate` so the Prisma client is available during `next build`.

## 4. Environment variables

In **Project → Settings → Environment Variables**, add at least:

| Name | Notes |
|------|--------|
| `DATABASE_URL` | Postgres URL from step 2. On **Supabase**, prefer the **pooled** “Transaction” string and add Prisma-friendly params, e.g. `?pgbouncer=true` (see [Prisma + Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)); missing or direct-only URLs often cause intermittent **500** errors on Vercel. |
| `NEXTAUTH_SECRET` | Random string, e.g. `openssl rand -base64 32` |
| `NEXTAUTH_URL` | **Production URL**, e.g. `https://your-project.vercel.app` (use your real Vercel domain). Update when you attach a custom domain. |
| `GOOGLE_MAPS_API_KEY` | Optional; geocoding falls back if unset. |
| `RESEND_API_KEY` + `EMAIL_FROM` | Optional; for owner password reset emails (see `.env.example`). |

Add the same keys for **Production** (and **Preview** if you want preview deployments to hit a real DB—often people use a separate preview `DATABASE_URL`).

## 5. Run database migrations (once per environment)

After the first deploy, migrations must be applied to the **same** database as `DATABASE_URL`.

From your machine (with `DATABASE_URL` pointing at production):

```bash
npx prisma migrate deploy
```

Or run your seed if needed: `npm run db:seed` (only if appropriate for production).

## 6. Redeploy

Trigger a new deployment from the Vercel dashboard so the app starts with a migrated database.

## 7. Deal maintenance (no cron)

Expired deals and “expiring soon” owner notifications are updated when users load the app (`GET /api/deals/maintenance` from the root layout) and from the **Deals** page refresh control. The route is **throttled** server-side so traffic spikes do not overload the database.

## CLI alternative

If you prefer the CLI:

```bash
npm i -g vercel
cd /path/to/GrocerEase
vercel login
vercel link
vercel env pull   # optional: sync env locally
vercel --prod
```

Set environment variables in the dashboard or via `vercel env add`.

Your app will be available at **`https://<project-name>.vercel.app`** unless you change the project name or add a custom domain under **Project → Settings → Domains**.
