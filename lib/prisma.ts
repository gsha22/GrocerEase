import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pgPool: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * Some dev environments (VPN, proxies, Supabase pooler + local Node TLS) hit
 * "self-signed certificate in certificate chain". Use relaxed TLS only when opted in
 * or in local dev against Supabase pooler (opt out with DATABASE_SSL_STRICT=true).
 */
function useInsecurePostgresTls(): boolean {
  if (process.env.DATABASE_SSL_STRICT === "true") return false;
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false") return true;
  return (
    process.env.NODE_ENV === "development" &&
    connectionString.includes("pooler.supabase.com")
  );
}

/**
 * With node-pg v8+, `sslmode=require` in the URL is treated like verify-full and wins over
 * `ssl: { rejectUnauthorized: false }`, so relaxed TLS never applies unless we drop sslmode.
 */
function stripSslModeQueryParam(cs: string): string {
  const q = cs.indexOf("?");
  if (q === -1) return cs;
  const base = cs.slice(0, q);
  const query = cs.slice(q + 1);
  const parts = query.split("&").filter((p) => !/^sslmode=/i.test(p));
  return parts.length > 0 ? `${base}?${parts.join("&")}` : base;
}

function getPool(): Pool {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;

  const insecure = useInsecurePostgresTls();
  const conn = insecure ? stripSslModeQueryParam(connectionString) : connectionString;
  const pool = new Pool({
    connectionString: conn,
    ...(insecure ? { ssl: { rejectUnauthorized: false as const } } : {}),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  return pool;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(getPool()),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
