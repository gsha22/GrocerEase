import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { resolveDatabaseUrl } from "../lib/database-url";
import {
  alerts,
  deals,
  fixtureMeta,
  freshUpdates,
  items,
  owners,
  shoppers,
  storeItemSearchesSeed,
  storeProfileViewsSeed,
  stores,
} from "./fixtures";

const seedDatabaseUrl = resolveDatabaseUrl();
if (!seedDatabaseUrl) {
  throw new Error(
    "DATABASE_URL (or Vercel POSTGRES_PRISMA_URL) is required to run prisma/seed.ts",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: seedDatabaseUrl }),
});

async function resetAndSeed() {
  await prisma.$transaction([
    prisma.alert.deleteMany(),
    prisma.ownerNotification.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.freshUpdate.deleteMany(),
    prisma.item.deleteMany(),
    prisma.store.deleteMany(),
    prisma.shopper.deleteMany(),
    prisma.storeOwner.deleteMany(),
  ]);

  await prisma.storeOwner.createMany({ data: owners });
  await prisma.shopper.createMany({ data: shoppers });
  await prisma.store.createMany({ data: stores });
  await prisma.item.createMany({ data: items });
  await prisma.freshUpdate.createMany({ data: freshUpdates });
  await prisma.deal.createMany({ data: deals });
  await prisma.alert.createMany({ data: alerts });
  await prisma.storeProfileView.createMany({ data: storeProfileViewsSeed });
  await prisma.storeItemSearch.createMany({ data: storeItemSearchesSeed });
}

async function main() {
  await resetAndSeed();

  console.log("Deterministic GrocerEase test data seeded.");
  console.log(`Seed clock: ${fixtureMeta.baseTime.toISOString()}`);
  console.log(`Owner login password (fixtures): ${fixtureMeta.ownerPlaintextPassword}`);
  console.log(`Shopper login password (fixtures): ${fixtureMeta.shopperPlaintextPassword}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
