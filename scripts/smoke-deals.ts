/**
 * Quick DB + deal-maintenance check. Run from repo root after migrate + seed:
 *
 *   cp .env.example .env   # fill DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
 *   npx prisma migrate dev
 *   npm run db:seed
 *   npx tsx scripts/smoke-deals.ts
 */
import { config } from "dotenv";

config({ path: ".env" });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "Missing DATABASE_URL. Copy .env.example to .env and set your Supabase (or local Postgres) URL.",
    );
    process.exit(1);
  }

  const { prisma } = await import("../lib/prisma");
  const { runDealMaintenance } = await import("../lib/deal-maintenance");

  await prisma.$connect();

  const now = new Date();
  const activePublic = await prisma.deal.count({
    where: {
      deletedAt: null,
      isExpired: false,
      expiresAt: { gt: now },
      store: { isPublished: true },
    },
  });

  const withPrice = await prisma.deal.count({
    where: { price: { not: null } },
  });

  console.log("Connected OK.");
  console.log("  Active deals (published stores, expiresAt > now):", activePublic);
  console.log("  Deals with a price set:", withPrice);

  const maintenance = await runDealMaintenance(now);
  console.log("  runDealMaintenance (same instant):", maintenance);

  const unreadAlerts = await prisma.ownerNotification.count({
    where: { readAt: null },
  });
  console.log("  Unread owner notifications:", unreadAlerts);

  await prisma.$disconnect();
  console.log("\nSmoke check passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
