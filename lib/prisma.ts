import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "pg-connection-string";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPgPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Hosted Postgres (e.g. Supabase) uses TLS; some environments present a chain
  // Node does not trust ("self-signed certificate in certificate chain").
  const relaxSsl =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.DATABASE_SSL_STRICT !== "true");

  if (!relaxSsl) {
    return { connectionString };
  }

  // `pg` merges `parse(connectionString)` over top-level options when
  // `connectionString` is set, so URL `sslmode=require` overwrites a loose
  // `ssl: { rejectUnauthorized: false }`. Build discrete fields + explicit ssl.
  const parsed = parse(connectionString);
  const host = parsed.host ?? undefined;
  const isLocalTcp =
    host === "localhost" ||
    host === "127.0.0.1" ||
    (typeof host === "string" && host.startsWith("/"));

  if (isLocalTcp && !parsed.sslmode) {
    return { connectionString };
  }

  const portRaw = parsed.port;
  const port =
    portRaw != null && portRaw !== ""
      ? parseInt(String(portRaw), 10)
      : undefined;

  const poolConfig: PoolConfig = {
    user: parsed.user,
    password: parsed.password,
    host: host ?? undefined,
    port: port !== undefined && !Number.isNaN(port) ? port : undefined,
    database: parsed.database ?? undefined,
    ssl: { rejectUnauthorized: false },
  };

  if (typeof parsed.application_name === "string") {
    poolConfig.application_name = parsed.application_name;
  }
  if (typeof parsed.options === "string") {
    poolConfig.options = parsed.options;
  }

  return poolConfig;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(createPgPoolConfig()),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
