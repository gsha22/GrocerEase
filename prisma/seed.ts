import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { createPgPoolConfig } from "../lib/pg-pool-config";
import { PrismaClient } from "../app/generated/prisma/client";
import {
  alerts,
  deals,
  fixtureMeta,
  freshUpdates,
  items,
  owners,
  shoppers,
  stores,
} from "./fixtures";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPgPoolConfig()),
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
