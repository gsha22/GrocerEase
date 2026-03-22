import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const stores = [
  {
    name: "Sultan Bey International",
    address: "142 Beaver St, Sewickley, PA 15143",
    lat: 40.5338,
    lng: -80.1854,
    categories: ["Halal", "Middle Eastern", "EBT Accepted"],
    hours: { open: "08:00", close: "20:00" },
  },
  {
    name: "Lotus Asian Market",
    address: "1710 Lowrie St, Pittsburgh, PA 15233",
    lat: 40.4568,
    lng: -79.9901,
    categories: ["Asian groceries", "Produce"],
    hours: { open: "09:00", close: "19:00" },
  },
  {
    name: "Fresh Harvest Co-op",
    address: "200 Main St, Edgeworth, PA 15143",
    lat: 40.5515,
    lng: -80.1875,
    categories: ["Organic", "Produce", "EBT Accepted"],
    hours: { open: "07:00", close: "21:00" },
  },
  {
    name: "Pitaland Bakery & Grocery",
    address: "2106 Murray Ave, Pittsburgh, PA 15217",
    lat: 40.4318,
    lng: -79.9244,
    categories: ["Halal", "Middle Eastern"],
    hours: { open: "09:00", close: "20:00" },
  },
  {
    name: "Tokyo Japanese Food Store",
    address: "5855 Ellsworth Ave, Pittsburgh, PA 15232",
    lat: 40.4526,
    lng: -79.9329,
    categories: ["Asian groceries"],
    hours: { open: "10:00", close: "19:00" },
  },
  {
    name: "Strip District Meats & Produce",
    address: "2101 Penn Ave, Pittsburgh, PA 15222",
    lat: 40.4513,
    lng: -79.9818,
    categories: ["Produce", "EBT Accepted"],
    hours: { open: "06:00", close: "18:00" },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const store of stores) {
    const owner = await prisma.storeOwner.create({
      data: {
        email: `owner@${store.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        passwordHash: "$2a$10$placeholder_hash_for_seed_data_only",
        name: `${store.name} Owner`,
      },
    });

    await prisma.store.create({
      data: {
        ownerId: owner.id,
        name: store.name,
        address: store.address,
        lat: store.lat,
        lng: store.lng,
        categories: store.categories,
        hours: store.hours,
        isPublished: true,
      },
    });

    console.log(`  ✓ ${store.name}`);
  }

  console.log(`\nSeeded ${stores.length} stores.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
