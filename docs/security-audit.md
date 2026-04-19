# Dependency security audit (npm)

Run periodically:

```bash
npm audit
```

## Accepted risk (as of last review)

Some findings come from **transitive dev dependencies** (for example `@prisma/dev` → `@hono/node-server`). They affect Prisma’s **development** tooling, not the GrocerEase runtime bundle served to users.

- **`npm audit fix`** is applied when it does not require a **breaking** Prisma major downgrade.
- Do **not** run `npm audit fix --force` blindly: it may pin **Prisma 6.x** and break the app.

When Prisma releases a patch that upgrades `@hono/node-server` (or removes the vulnerable path), update `prisma` / `@prisma/client` in range and re-run `npm audit`.

## Production hardening

- Rotate `NEXTAUTH_SECRET` and database credentials on a schedule.
- Use Supabase **connection pooling** URLs as recommended for serverless.
- Enable Supabase/Vercel **WAF** and **rate limits** at the edge for auth routes if abuse appears.
