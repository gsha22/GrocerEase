import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function assertHostedDatabaseUrlOnVercel(): void {
  const url = resolveDatabaseUrl();
  if (!url || process.env.VERCEL !== "1") return;
  if (!/(127\.0\.0\.1|localhost)/i.test(url)) return;
  throw new Error(
    "GrocerEase: Database URL points to localhost. On Vercel this will always fail — there is no Postgres on 127.0.0.1 in the cloud. " +
      "Use Vercel → Storage → Supabase (provisions DB + env vars), or set DATABASE_URL / POSTGRES_PRISMA_URL / DATABASE_POSTGRES_PRISMA_URL to your hosted Postgres, then redeploy.",
  );
}

assertHostedDatabaseUrlOnVercel();

const connectionString = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
