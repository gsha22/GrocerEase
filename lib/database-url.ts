/**
 * Resolves the Postgres URL for Prisma.
 *
 * Supported env names (first match wins):
 * - **`DATABASE_URL`** — manual / `.env`
 * - **`POSTGRES_PRISMA_URL`** — Vercel ↔ Supabase sync (unprefixed)
 * - **`DATABASE_POSTGRES_PRISMA_URL`** — same when Vercel prefixes Storage-linked vars with `DATABASE_`
 * - **`DATABASE_POSTGRES_URL`** / **`POSTGRES_URL`** — fallbacks
 */
export function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_POSTGRES_PRISMA_URL,
    process.env.DATABASE_POSTGRES_URL,
    process.env.POSTGRES_URL,
  ];
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return "";
}
