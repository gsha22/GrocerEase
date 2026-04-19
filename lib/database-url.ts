/**
 * Resolves the Postgres URL for Prisma.
 *
 * Supported env names (first match wins):
 * - **`DATABASE_URL`** — manual / `.env`
 * - **`POSTGRES_PRISMA_URL`** — Vercel ↔ Supabase sync (unprefixed)
 * - **`DATABASE_POSTGRES_PRISMA_URL`** — same when Vercel prefixes Storage-linked vars with `DATABASE_`
 * - **`DATABASE_POSTGRES_URL`** / **`POSTGRES_URL`** — fallbacks
 *
 * **Supabase pooler (PgBouncer):** Vercel’s synced URL sometimes omits `pgbouncer=true` and
 * `connection_limit=1`, which breaks Prisma on serverless (`prepared statement "s0" already exists`, etc.).
 * We append those when the host is a Supabase pooler (`*.pooler.supabase.com`).
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
    if (t) return ensurePrismaPoolerQueryParams(t);
  }
  return "";
}

/** Ensures Prisma-friendly PgBouncer query params for Supabase Transaction pooler URLs. */
export function ensurePrismaPoolerQueryParams(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.includes("pooler.supabase.com")) {
    return url;
  }

  if (!parsed.searchParams.has("pgbouncer")) {
    parsed.searchParams.set("pgbouncer", "true");
  }
  if (!parsed.searchParams.has("connection_limit")) {
    parsed.searchParams.set("connection_limit", "1");
  }
  return parsed.toString();
}
