import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DEMO_STORES = [
  {
    name: "Lotus Market",
    address: "2100 Murray Ave, Pittsburgh, PA 15217",
    lat: 40.4319,
    lng: -79.9227,
    categories: ["asian groceries", "produce"],
    isPublished: true,
  },
  {
    name: "Halal Fresh Mart",
    address: "312 Atwood St, Pittsburgh, PA 15213",
    lat: 40.4406,
    lng: -79.9590,
    categories: ["halal", "produce"],
    isPublished: true,
  },
  {
    name: "Green Root Organics",
    address: "5847 Ellsworth Ave, Pittsburgh, PA 15232",
    lat: 40.4529,
    lng: -79.9331,
    categories: ["organic", "produce"],
    isPublished: true,
  },
  {
    name: "East Asian Grocery",
    address: "400 S Craig St, Pittsburgh, PA 15213",
    lat: 40.4443,
    lng: -79.9498,
    categories: ["asian groceries", "ebt accepted"],
    isPublished: true,
  },
  {
    name: "Mediterranean Pantry",
    address: "1706 Murray Ave, Pittsburgh, PA 15217",
    lat: 40.4345,
    lng: -79.9254,
    categories: ["halal", "organic"],
    isPublished: true,
  },
  {
    name: "Community Produce Stand",
    address: "100 S Highland Ave, Pittsburgh, PA 15206",
    lat: 40.4593,
    lng: -79.9250,
    categories: ["produce", "ebt accepted", "organic"],
    isPublished: true,
  },
];

async function main() {
  console.log("Seeding stores...");

  for (const store of DEMO_STORES) {
    const owner = await prisma.storeOwner.create({
      data: {
        email: `owner-${store.name.toLowerCase().replace(/\s+/g, "-")}@demo.grocerease.local`,
        passwordHash: "seed-placeholder",
        name: `${store.name} Owner`,
      },
    });

    await prisma.store.create({
      data: {
        ownerId: owner.id,
        ...store,
      },
    });

    console.log(`  Created: ${store.name} [${store.categories.join(", ")}]`);
  }

  console.log(`\nDone — ${DEMO_STORES.length} stores seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
