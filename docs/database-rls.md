# PostgreSQL Row Level Security (RLS) and Supabase

The migration `20260325120000_enable_rls_all_tables` runs:

```sql
ALTER TABLE "store_owners" ENABLE ROW LEVEL SECURITY;
-- … (other tables)
```

**No `CREATE POLICY` statements are in this repository.** That is intentional for apps that access Postgres **only** through **Prisma** using a **database role that bypasses RLS** (for example the default `postgres` superuser on many installs, or a role with `BYPASSRLS`).

## Staging / production checklist

1. **Identify the DB role** in `DATABASE_URL` (Supabase: **Settings → Database**; check whether you use the **pooled** or **direct** connection string).

2. **Check if RLS applies to that role** (run as a superuser or the Supabase SQL editor):

   ```sql
   SELECT rolname, rolbypassrls
   FROM pg_roles
   WHERE rolname = current_user;
   ```

   - If `rolbypassrls` is `t` for your app role, RLS does not block Prisma queries (typical for some migration users).
   - If `f`, **every** table with RLS enabled needs **policies** that allow the operations your app performs, or migrations will fail at runtime.

3. **Smoke-test critical paths** on staging after any role or RLS change:

   - Owner login, store create/update
   - Shopper login, alerts CRUD
   - Public `GET /api/stores` and store detail

4. **Supabase**: Prefer the **service role** only on trusted servers; use the **anon** key only with **RLS policies** designed for it. This app’s API routes use **Prisma + server env**—align the DB user with your security model.

If you move to **Supabase Auth** or direct client access to Postgres, add explicit **`CREATE POLICY`** statements per table and test them in CI.
