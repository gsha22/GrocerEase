# Vercel Storage → Supabase (provision from Vercel)

You can create the Postgres database **from Vercel** instead of only using the Supabase dashboard.

## Steps

1. In Vercel: **Storage** → **Create database** → **Supabase** (Marketplace).
2. Pick **region** (e.g. Washington, D.C.) and **plan** (Free is fine to start).
3. **Confirm** / finish **Database provisioning**. Vercel links the Supabase project to your **Vercel project** and syncs environment variables.

## Env vars GrocerEase uses

The integration usually injects variables such as:

- **`POSTGRES_PRISMA_URL`** — pooled URI tuned for Prisma (often what you want on serverless).
- **`DATABASE_POSTGRES_PRISMA_URL`** — same value when Vercel prefixes Storage-linked vars with `DATABASE_`.
- **`POSTGRES_URL`**, **`DATABASE_POSTGRES_URL`**, **`POSTGRES_URL_NON_POOLING`**, etc.

This app resolves the DB URL in this order (see `lib/database-url.ts`): **`DATABASE_URL`** → **`POSTGRES_PRISMA_URL`** → **`DATABASE_POSTGRES_PRISMA_URL`** → **`DATABASE_POSTGRES_URL`** → **`POSTGRES_URL`**.  
So you **do not** have to manually duplicate the string as `DATABASE_URL` unless you want to.

**Security:** Never paste connection strings or API keys into chat or tickets. If any secret was exposed, rotate it in Supabase and Vercel and redeploy.

**Prisma + Supabase pooler:** Vercel’s auto-synced `POSTGRES_PRISMA_URL` may omit `pgbouncer=true` and `connection_limit=1`. GrocerEase adds these automatically when the host is `*.pooler.supabase.com` (see `ensurePrismaPoolerQueryParams` in `lib/database-url.ts`). If signup still fails, run `npx prisma migrate deploy` so tables exist.

Optional client-side Supabase keys (`NEXT_PUBLIC_SUPABASE_*`) are synced for future use; **auth and data still use NextAuth + Prisma**.

## After provisioning

1. **Redeploy** the Vercel project so the new env vars are available to the build and runtime.
2. **Migrations** — from your laptop, pull env (or paste `POSTGRES_PRISMA_URL` / `DATABASE_URL`):

   ```bash
   npx prisma migrate deploy
   ```

3. Optional seed: `npm run db:seed`
4. Set **`NEXTAUTH_URL`** to your production URL (e.g. `https://your-app.vercel.app`) if not already set.

If anything still returns `127.0.0.1` errors, open **Project → Settings → Environment Variables** and confirm the Supabase-backed variables are present for **Production**.
