import bcrypt from "bcryptjs";
import { Prisma } from "../app/generated/prisma/client";

/**
 * All seeded `createdAt` / `expiresAt` / `lastUpdated` values are offsets from this instant.
 * Using wall-clock time keeps rows inside the public Fresh Today window (7 days) and
 * active-deal filters (`expiresAt > now`) after `db:seed` / `db:reset`.
 *
 * For deterministic timestamps (e.g. screenshots), set `PRISMA_SEED_CLOCK` to an ISO string.
 */
const BASE_TIME = process.env.PRISMA_SEED_CLOCK
  ? new Date(process.env.PRISMA_SEED_CLOCK)
  : new Date();

const BCRYPT_SALT = "$2b$10$CwTycUXWue0Thq9StjUM0u";

const atHours = (deltaHours: number) =>
  new Date(BASE_TIME.getTime() + deltaHours * 60 * 60 * 1000);

const atDays = (deltaDays: number) => atHours(deltaDays * 24);

export const fixtureMeta = {
  baseTime: BASE_TIME,
  publicNowHint: BASE_TIME.toISOString(),
  ownerPlaintextPassword: "OwnerPass123!",
  shopperPlaintextPassword: "ShopperPass123!",
};

export const ids = {
  owners: {
    linh: "11111111-1111-1111-1111-111111111111",
    abdullah: "22222222-2222-2222-2222-222222222222",
    maria: "33333333-3333-3333-3333-333333333333",
    noStoreOwner: "44444444-4444-4444-4444-444444444444",
    jiyeon: "66666666-6666-6666-6666-666666666661",
    omar: "66666666-6666-6666-6666-666666666662",
    evelyn: "66666666-6666-6666-6666-666666666663",
    noStoreOwnerTwo: "66666666-6666-6666-6666-666666666664",
  },
  stores: {
    lotus: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    crescent: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    threeRivers: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
    tokyoMart: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
    riverHalalHub: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
    eastEndOrganic: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6",
  },
  shoppers: {
    nina: "55555555-5555-5555-5555-555555555555",
    jordan: "55555555-5555-5555-5555-555555555556",
    shopper03: "55555555-5555-5555-5555-555555555557",
    shopper04: "55555555-5555-5555-5555-555555555558",
    shopper05: "55555555-5555-5555-5555-555555555559",
    shopper06: "55555555-5555-5555-5555-555555555560",
    shopper07: "55555555-5555-5555-5555-555555555561",
    shopper08: "55555555-5555-5555-5555-555555555562",
    shopper09: "55555555-5555-5555-5555-555555555563",
    shopper10: "55555555-5555-5555-5555-555555555564",
    shopper11: "55555555-5555-5555-5555-555555555565",
    shopper12: "55555555-5555-5555-5555-555555555566",
  },
  items: {
    bokChoy: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
    bokChoiTypo: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
    halalLambShoulder: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3",
    spinach: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4",
    oatMilk: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5",
    ramen: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6",
    cilantro: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7",
    napaCabbage: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8",
    gochujang: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9",
    halalChickenThighs: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10",
    datesMedjool: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11",
    kale: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12",
    sourdough: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13",
    tomatoeSauceTypo: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14",
  },
  freshUpdates: {
    lotusRecent: "cccccccc-cccc-cccc-cccc-ccccccccccc1",
    crescentRecent: "cccccccc-cccc-cccc-cccc-ccccccccccc2",
    threeRiversStale: "cccccccc-cccc-cccc-cccc-ccccccccccc3",
    lotusSoftDeleted: "cccccccc-cccc-cccc-cccc-ccccccccccc4",
    tokyoRecent: "cccccccc-cccc-cccc-cccc-ccccccccccc5",
    riverHalalRecent: "cccccccc-cccc-cccc-cccc-ccccccccccc6",
    eastEndStale: "cccccccc-cccc-cccc-cccc-ccccccccccc7",
    tokyoSoftDeleted: "cccccccc-cccc-cccc-cccc-ccccccccccc8",
  },
  deals: {
    lotusActive: "dddddddd-dddd-dddd-dddd-ddddddddddd1",
    lotusExpiringSoon: "dddddddd-dddd-dddd-dddd-ddddddddddd2",
    crescentExpired: "dddddddd-dddd-dddd-dddd-ddddddddddd3",
    crescentHistorical: "dddddddd-dddd-dddd-dddd-ddddddddddd4",
    crescentReusedActive: "dddddddd-dddd-dddd-dddd-ddddddddddd5",
    threeRiversSoftDeleted: "dddddddd-dddd-dddd-dddd-ddddddddddd6",
    tokyoActive: "dddddddd-dddd-dddd-dddd-ddddddddddd7",
    tokyoExpiringSoon: "dddddddd-dddd-dddd-dddd-ddddddddddd8",
    riverHalalExpired: "dddddddd-dddd-dddd-dddd-ddddddddddd9",
    eastEndHistorical: "dddddddd-dddd-dddd-dddd-dddddddddd10",
    eastEndReusedActive: "dddddddd-dddd-dddd-dddd-dddddddddd11",
    riverHalalSoftDeleted: "dddddddd-dddd-dddd-dddd-dddddddddd12",
  },
  alerts: {
    ninaStoreFollowLotus: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1",
    ninaItemRestockLamb: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2",
    jordanStoreFollowTokyo: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3",
    jordanItemRestockKale: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4",
  },
} as const;

export const owners = [
  {
    id: ids.owners.linh,
    email: "linh@lotus-market.test",
    name: "Linh Tran",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-45),
  },
  {
    id: ids.owners.abdullah,
    email: "abdullah@crescent-halal.test",
    name: "Abdullah Khan",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-30),
  },
  {
    id: ids.owners.maria,
    email: "maria@3rivers-produce.test",
    name: "Maria Santos",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-25),
  },
  {
    id: ids.owners.noStoreOwner,
    email: "newowner@no-store.test",
    name: "Casey Newowner",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-3),
  },
  {
    id: ids.owners.jiyeon,
    email: "jiyeon@tokyo-mart.test",
    name: "Jiyeon Park",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-22),
  },
  {
    id: ids.owners.omar,
    email: "omar@river-halal.test",
    name: "Omar Hassan",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-18),
  },
  {
    id: ids.owners.evelyn,
    email: "evelyn@eastend-organic.test",
    name: "Evelyn Brooks",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-16),
  },
  {
    id: ids.owners.noStoreOwnerTwo,
    email: "backupowner@no-store.test",
    name: "Robin Draft",
    passwordHash: bcrypt.hashSync(fixtureMeta.ownerPlaintextPassword, BCRYPT_SALT),
    createdAt: atDays(-2),
  },
];

export const stores = [
  {
    id: ids.stores.lotus,
    ownerId: ids.owners.linh,
    name: "Lotus Asian Market",
    address: "5899 Forbes Ave, Pittsburgh, PA 15217",
    lat: 40.43734,
    lng: -79.92148,
    categories: ["asian", "produce"],
    isPublished: true,
    createdAt: atDays(-40),
  },
  {
    id: ids.stores.crescent,
    ownerId: ids.owners.abdullah,
    name: "Crescent Halal Grocer",
    address: "202 Brownsville Rd, Pittsburgh, PA 15210",
    lat: 40.40502,
    lng: -79.98631,
    categories: ["halal", "ebt"],
    isPublished: true,
    createdAt: atDays(-28),
  },
  {
    id: ids.stores.threeRivers,
    ownerId: ids.owners.maria,
    name: "Three Rivers Organic Produce",
    address: "2401 Smallman St, Pittsburgh, PA 15222",
    lat: 40.45258,
    lng: -79.97938,
    categories: ["organic", "produce", "ebt"],
    isPublished: true,
    createdAt: atDays(-20),
  },
  {
    id: ids.stores.tokyoMart,
    ownerId: ids.owners.jiyeon,
    name: "Tokyo Mart Shadyside",
    address: "5525 Walnut St, Pittsburgh, PA 15232",
    lat: 40.45131,
    lng: -79.9345,
    categories: ["asian", "ebt"],
    isPublished: true,
    createdAt: atDays(-18),
  },
  {
    id: ids.stores.riverHalalHub,
    ownerId: ids.owners.omar,
    name: "River Halal Hub",
    address: "3115 Banksville Rd, Pittsburgh, PA 15216",
    lat: 40.41403,
    lng: -80.03962,
    categories: ["halal", "produce"],
    isPublished: true,
    createdAt: atDays(-15),
  },
  {
    id: ids.stores.eastEndOrganic,
    ownerId: ids.owners.evelyn,
    name: "East End Organic Pantry",
    address: "6400 Penn Ave, Pittsburgh, PA 15206",
    lat: 40.4609,
    lng: -79.91922,
    categories: ["organic", "produce", "ebt"],
    isPublished: true,
    createdAt: atDays(-12),
  },
];

const shopperPasswordHash = bcrypt.hashSync(
  fixtureMeta.shopperPlaintextPassword,
  BCRYPT_SALT,
);

export const shoppers = [
  {
    id: ids.shoppers.nina,
    email: "nina.shopper@testmail.com",
    name: "Nina Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-10),
  },
  {
    id: ids.shoppers.jordan,
    email: "jordan.shopper@testmail.com",
    name: "Jordan Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-8),
  },
  {
    id: ids.shoppers.shopper03,
    email: "alex.shopper@testmail.com",
    name: "Alex Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-7),
  },
  {
    id: ids.shoppers.shopper04,
    email: "taylor.shopper@testmail.com",
    name: "Taylor Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-6),
  },
  {
    id: ids.shoppers.shopper05,
    email: "sam.shopper@testmail.com",
    name: "Sam Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-6),
  },
  {
    id: ids.shoppers.shopper06,
    email: "riley.shopper@testmail.com",
    name: "Riley Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-5),
  },
  {
    id: ids.shoppers.shopper07,
    email: "morgan.shopper@testmail.com",
    name: "Morgan Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-5),
  },
  {
    id: ids.shoppers.shopper08,
    email: "jamie.shopper@testmail.com",
    name: "Jamie Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-4),
  },
  {
    id: ids.shoppers.shopper09,
    email: "drew.shopper@testmail.com",
    name: "Drew Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-4),
  },
  {
    id: ids.shoppers.shopper10,
    email: "casey.shopper2@testmail.com",
    name: "Casey Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-3),
  },
  {
    id: ids.shoppers.shopper11,
    email: "cameron.shopper@testmail.com",
    name: "Cameron Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-3),
  },
  {
    id: ids.shoppers.shopper12,
    email: "peyton.shopper@testmail.com",
    name: "Peyton Shopper",
    passwordHash: shopperPasswordHash,
    createdAt: atDays(-2),
  },
];

const coreItems = [
  {
    id: ids.items.bokChoy,
    storeId: ids.stores.lotus,
    name: "Baby Bok Choy",
    description: "Crisp bunches from regional growers",
    inStock: true,
    lastUpdated: atHours(-3),
  },
  {
    id: ids.items.bokChoiTypo,
    storeId: ids.stores.lotus,
    name: "Bok Choi Family Pack",
    description: "Intentional spelling variant for fuzzy search QA",
    inStock: false,
    lastUpdated: atDays(-2),
  },
  {
    id: ids.items.ramen,
    storeId: ids.stores.lotus,
    name: "Shin Ramyun 4-Pack",
    description: "Spicy instant noodle multipack",
    inStock: true,
    lastUpdated: atHours(-6),
  },
  {
    id: ids.items.halalLambShoulder,
    storeId: ids.stores.crescent,
    name: "Halal Lamb Shoulder",
    description: "Fresh halal-certified lamb shoulder cuts",
    inStock: true,
    lastUpdated: atHours(-2),
  },
  {
    id: ids.items.cilantro,
    storeId: ids.stores.crescent,
    name: "Cillantro Bunch",
    description: "Intentional typo to test search tolerance",
    inStock: true,
    lastUpdated: atHours(-5),
  },
  {
    id: ids.items.spinach,
    storeId: ids.stores.threeRivers,
    name: "Organic Spinach",
    description: "Organic bunch spinach",
    inStock: false,
    lastUpdated: atDays(-4),
  },
  {
    id: ids.items.oatMilk,
    storeId: ids.stores.threeRivers,
    name: "Oat Milk Unsweetened",
    description: "Dairy-free staple",
    inStock: true,
    lastUpdated: atHours(-7),
  },
  {
    id: ids.items.napaCabbage,
    storeId: ids.stores.tokyoMart,
    name: "Napa Cabbage",
    description: "Fresh napa cabbage heads",
    inStock: true,
    lastUpdated: atHours(-4),
  },
  {
    id: ids.items.gochujang,
    storeId: ids.stores.tokyoMart,
    name: "Gochujang Paste",
    description: "Korean chili paste",
    inStock: true,
    lastUpdated: atHours(-9),
  },
  {
    id: ids.items.halalChickenThighs,
    storeId: ids.stores.riverHalalHub,
    name: "Halal Chicken Thighs",
    description: "Fresh halal chicken cuts",
    inStock: false,
    lastUpdated: atDays(-1),
  },
  {
    id: ids.items.datesMedjool,
    storeId: ids.stores.riverHalalHub,
    name: "Medjool Dates",
    description: "Imported premium dates",
    inStock: true,
    lastUpdated: atHours(-11),
  },
  {
    id: ids.items.kale,
    storeId: ids.stores.eastEndOrganic,
    name: "Organic Kale",
    description: "Locally grown kale bunches",
    inStock: true,
    lastUpdated: atHours(-13),
  },
  {
    id: ids.items.sourdough,
    storeId: ids.stores.eastEndOrganic,
    name: "Whole Grain Sourdough",
    description: "Fresh bakery loaf",
    inStock: true,
    lastUpdated: atHours(-15),
  },
  {
    id: ids.items.tomatoeSauceTypo,
    storeId: ids.stores.eastEndOrganic,
    name: "Tomatoe Sauce",
    description: "Intentional typo for fuzzy search testing",
    inStock: false,
    lastUpdated: atDays(-3),
  },
];

const BULK_STORE_ROTATION = [
  ids.stores.lotus,
  ids.stores.crescent,
  ids.stores.threeRivers,
  ids.stores.tokyoMart,
  ids.stores.riverHalalHub,
  ids.stores.eastEndOrganic,
] as const;

const BULK_PRODUCT_NAMES = [
  "Ataulfo Mangoes",
  "Fuji Apples",
  "Cara Cara Oranges",
  "Thai Basil Bunch",
  "Persian Cucumbers",
  "Enoki Mushrooms",
  "Panko Breadcrumbs",
  "Jasmine Rice 10lb",
  "Extra Firm Tofu",
  "Kimchi Jar",
  "Miso White",
  "Sesame Oil Toasted",
  "Yuzu Juice",
  "Pomegranate Arils",
  "Green Lentils Dry",
  "Chickpeas Dry",
  "Quinoa Tri-color",
  "Avocado Hass",
  "Limes Key West",
  "Mint Bunch",
  "Italian Parsley",
  "Thyme Fresh Pack",
  "Rosemary Sprigs",
  "Serrano Peppers",
  "Shishito Peppers",
  "Cremini Mushrooms",
  "Portobello Caps",
  "Zucchini Medley",
  "Rainbow Carrots",
  "Golden Beets",
] as const;

function bulkItemUuid(index: number): string {
  return `f1000000-0004-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`;
}

function bulkFreshUpdateUuid(index: number): string {
  return `f2000000-0004-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`;
}

function bulkDealUuid(index: number): string {
  return `f3000000-0004-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`;
}

function buildBulkExtraItems() {
  const count = 90;
  const notes = [
    "New shipment.",
    "Peak season quality.",
    "Limited run today.",
    "Staff favorite this week.",
    "Restocked this morning.",
  ];
  return Array.from({ length: count }, (_, i) => {
    const storeId = BULK_STORE_ROTATION[i % BULK_STORE_ROTATION.length]!;
    const base = BULK_PRODUCT_NAMES[i % BULK_PRODUCT_NAMES.length]!;
    const suffix = Math.floor(i / BULK_PRODUCT_NAMES.length);
    const name = suffix > 0 ? `${base} (${suffix + 1})` : base;
    return {
      id: bulkItemUuid(i),
      storeId,
      name,
      description: notes[i % notes.length]!,
      inStock: i % 7 !== 0,
      lastUpdated: atHours(-(i % 52) - 1),
    };
  });
}

const bulkExtraItems = buildBulkExtraItems();

function buildBulkExtraFreshUpdates() {
  const out: {
    id: string;
    storeId: string;
    itemId: string | null;
    itemName: string;
    note: string | null;
    createdAt: Date;
    deletedAt: Date | null;
  }[] = [];
  let idx = 0;

  for (let i = 0; i < bulkExtraItems.length; i++) {
    const item = bulkExtraItems[i]!;
    const updatesForRow = i % 4 === 0 ? 2 : 1;
    for (let j = 0; j < updatesForRow; j++) {
      const notes = [
        "Fresh delivery — check produce aisle.",
        "Back on shelf after restock.",
        "Small batch from local supplier.",
        "Quality spot-check passed.",
      ];
      out.push({
        id: bulkFreshUpdateUuid(idx),
        storeId: item.storeId,
        itemId: item.id,
        itemName: item.name,
        note: notes[(i + j) % notes.length]!,
        createdAt: atHours(-((idx % 80) + 1)),
        deletedAt: null,
      });
      idx += 1;
    }
  }

  for (let k = 0; k < 25; k++) {
    out.push({
      id: bulkFreshUpdateUuid(idx),
      storeId: BULK_STORE_ROTATION[k % BULK_STORE_ROTATION.length]!,
      itemId: null,
      itemName: "Seasonal tasting board",
      note: "Bulk fixture — soft-deleted sample.",
      createdAt: atHours(-(120 + k)),
      deletedAt: atHours(-(20 + k)),
    });
    idx += 1;
  }

  return out;
}

const bulkExtraFreshUpdates = buildBulkExtraFreshUpdates();

function buildBulkExtraDeals() {
  const out: {
    id: string;
    storeId: string;
    itemId: string | null;
    sourceDealId: string | null;
    title: string;
    description: string | null;
    price: Prisma.Decimal;
    discountPct: number | null;
    expiresAt: Date;
    isExpired: boolean;
    createdAt: Date;
    deletedAt: Date | null;
  }[] = [];

  for (let i = 0; i < bulkExtraItems.length; i++) {
    const item = bulkExtraItems[i]!;
    const active = i % 9 !== 0;
    const pct = 8 + (i % 22);
    const shortName = item.name.replace(/\s*\(\d+\)\s*$/, "");
    out.push({
      id: bulkDealUuid(i),
      storeId: item.storeId,
      itemId: item.id,
      sourceDealId: null,
      title: `${pct}% off ${shortName}`,
      description: "Bulk-seeded deal for demos and UI stress.",
      price: new Prisma.Decimal((1.99 + (i % 40) * 0.17).toFixed(2)),
      discountPct: pct,
      expiresAt: active ? atDays(1 + (i % 18)) : atHours(-(12 + (i % 30))),
      isExpired: !active,
      createdAt: atHours(-(i % 55) - 2),
      deletedAt: null,
    });
  }

  for (let k = 0; k < 15; k++) {
    const item = bulkExtraItems[k * 5]!;
    out.push({
      id: bulkDealUuid(bulkExtraItems.length + k),
      storeId: item.storeId,
      itemId: item.id,
      sourceDealId: null,
      title: `Flash markdown #${k + 1}`,
      description: "Bulk soft-deleted deal row.",
      price: new Prisma.Decimal((3.49 + k * 0.21).toFixed(2)),
      discountPct: 10 + k,
      expiresAt: atDays(3),
      isExpired: false,
      createdAt: atHours(-(8 + k)),
      deletedAt: atHours(-(1 + k)),
    });
  }

  return out;
}

const bulkExtraDeals = buildBulkExtraDeals();

export const items = [...coreItems, ...bulkExtraItems];

const coreFreshUpdates = [
  {
    id: ids.freshUpdates.lotusRecent,
    storeId: ids.stores.lotus,
    itemId: ids.items.bokChoy,
    itemName: "Baby Bok Choy",
    note: "Fresh delivery arrived this morning.",
    createdAt: atHours(-8),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.crescentRecent,
    storeId: ids.stores.crescent,
    itemId: ids.items.halalLambShoulder,
    itemName: "Halal Lamb Shoulder",
    note: "Halal certified cuts available today.",
    createdAt: atHours(-20),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.threeRiversStale,
    storeId: ids.stores.threeRivers,
    itemId: ids.items.spinach,
    itemName: "Organic Spinach",
    note: "Posted earlier this week; should now be stale.",
    createdAt: atDays(-4),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.lotusSoftDeleted,
    storeId: ids.stores.lotus,
    itemId: ids.items.bokChoiTypo,
    itemName: "Bok Choi Family Pack",
    note: "Removed by owner after stock ran out.",
    createdAt: atHours(-22),
    deletedAt: atHours(-2),
  },
  {
    id: ids.freshUpdates.tokyoRecent,
    storeId: ids.stores.tokyoMart,
    itemId: ids.items.napaCabbage,
    itemName: "Napa Cabbage",
    note: "Fresh heads arrived from this morning shipment.",
    createdAt: atHours(-6),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.riverHalalRecent,
    storeId: ids.stores.riverHalalHub,
    itemId: ids.items.datesMedjool,
    itemName: "Medjool Dates",
    note: "New batch stocked at opening.",
    createdAt: atHours(-14),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.eastEndStale,
    storeId: ids.stores.eastEndOrganic,
    itemId: ids.items.tomatoeSauceTypo,
    itemName: "Tomatoe Sauce",
    note: "Older post to test stale filtering behavior.",
    createdAt: atDays(-5),
    deletedAt: null,
  },
  {
    id: ids.freshUpdates.tokyoSoftDeleted,
    storeId: ids.stores.tokyoMart,
    itemId: ids.items.gochujang,
    itemName: "Gochujang Paste",
    note: "Deleted after owner corrected inventory status.",
    createdAt: atHours(-25),
    deletedAt: atHours(-4),
  },
];

export const freshUpdates = [...coreFreshUpdates, ...bulkExtraFreshUpdates];

const coreDeals = [
  {
    id: ids.deals.lotusActive,
    storeId: ids.stores.lotus,
    itemId: ids.items.ramen,
    sourceDealId: null,
    title: "Shin Ramyun buy 3 get 1 free",
    description: "Multi-pack ramen promotion.",
    price: new Prisma.Decimal("4.99"),
    discountPct: 25,
    expiresAt: atDays(3),
    isExpired: false,
    createdAt: atHours(-30),
    deletedAt: null,
  },
  {
    id: ids.deals.lotusExpiringSoon,
    storeId: ids.stores.lotus,
    itemId: ids.items.bokChoy,
    sourceDealId: null,
    title: "20% off Baby Bok Choy",
    description: "Ends in under 24 hours for urgency tests.",
    price: new Prisma.Decimal("2.49"),
    discountPct: 20,
    expiresAt: atHours(12),
    isExpired: false,
    createdAt: atHours(-12),
    deletedAt: null,
  },
  {
    id: ids.deals.crescentExpired,
    storeId: ids.stores.crescent,
    itemId: ids.items.halalLambShoulder,
    sourceDealId: null,
    title: "30% off lamb shoulder",
    description: "Expired deal; should be hidden from public views.",
    price: new Prisma.Decimal("12.99"),
    discountPct: 30,
    expiresAt: atHours(-6),
    isExpired: true,
    createdAt: atDays(-4),
    deletedAt: null,
  },
  {
    id: ids.deals.crescentHistorical,
    storeId: ids.stores.crescent,
    itemId: ids.items.halalLambShoulder,
    sourceDealId: null,
    title: "Past lamb special (historical)",
    description: "Historical seed deal used to validate deal duplication.",
    price: new Prisma.Decimal("11.49"),
    discountPct: 15,
    expiresAt: atDays(-7),
    isExpired: true,
    createdAt: atDays(-14),
    deletedAt: null,
  },
  {
    id: ids.deals.crescentReusedActive,
    storeId: ids.stores.crescent,
    itemId: ids.items.halalLambShoulder,
    sourceDealId: ids.deals.crescentHistorical,
    title: "Past lamb special (reused this week)",
    description: "Duplicated from historical record with a new active expiry.",
    price: new Prisma.Decimal("11.49"),
    discountPct: 15,
    expiresAt: atDays(2),
    isExpired: false,
    createdAt: atHours(-1),
    deletedAt: null,
  },
  {
    id: ids.deals.threeRiversSoftDeleted,
    storeId: ids.stores.threeRivers,
    itemId: ids.items.oatMilk,
    sourceDealId: null,
    title: "Soft-deleted oat milk flash sale",
    description: "Exists for owner edit/delete edge cases.",
    price: new Prisma.Decimal("3.29"),
    discountPct: 10,
    expiresAt: atDays(1),
    isExpired: false,
    createdAt: atHours(-10),
    deletedAt: atHours(-3),
  },
  {
    id: ids.deals.tokyoActive,
    storeId: ids.stores.tokyoMart,
    itemId: ids.items.gochujang,
    sourceDealId: null,
    title: "15% off Gochujang",
    description: "Active pantry staple promo.",
    price: new Prisma.Decimal("5.49"),
    discountPct: 15,
    expiresAt: atDays(4),
    isExpired: false,
    createdAt: atHours(-18),
    deletedAt: null,
  },
  {
    id: ids.deals.tokyoExpiringSoon,
    storeId: ids.stores.tokyoMart,
    itemId: ids.items.napaCabbage,
    sourceDealId: null,
    title: "Napa cabbage 2-for-1",
    description: "Short window deal ending tonight.",
    price: new Prisma.Decimal("1.99"),
    discountPct: null,
    expiresAt: atHours(8),
    isExpired: false,
    createdAt: atHours(-7),
    deletedAt: null,
  },
  {
    id: ids.deals.riverHalalExpired,
    storeId: ids.stores.riverHalalHub,
    itemId: ids.items.halalChickenThighs,
    sourceDealId: null,
    title: "25% off halal chicken thighs",
    description: "Expired deal for public-filtering checks.",
    price: new Prisma.Decimal("6.99"),
    discountPct: 25,
    expiresAt: atHours(-20),
    isExpired: true,
    createdAt: atDays(-3),
    deletedAt: null,
  },
  {
    id: ids.deals.eastEndHistorical,
    storeId: ids.stores.eastEndOrganic,
    itemId: ids.items.kale,
    sourceDealId: null,
    title: "Past organic greens bundle",
    description: "Historical deal used for duplicate/reuse testing.",
    price: new Prisma.Decimal("7.99"),
    discountPct: 18,
    expiresAt: atDays(-10),
    isExpired: true,
    createdAt: atDays(-17),
    deletedAt: null,
  },
  {
    id: ids.deals.eastEndReusedActive,
    storeId: ids.stores.eastEndOrganic,
    itemId: ids.items.kale,
    sourceDealId: ids.deals.eastEndHistorical,
    title: "Past organic greens bundle (reused)",
    description: "Reused from historical deal with a fresh expiry.",
    price: new Prisma.Decimal("7.99"),
    discountPct: 18,
    expiresAt: atDays(5),
    isExpired: false,
    createdAt: atHours(-2),
    deletedAt: null,
  },
  {
    id: ids.deals.riverHalalSoftDeleted,
    storeId: ids.stores.riverHalalHub,
    itemId: ids.items.datesMedjool,
    sourceDealId: null,
    title: "Soft-deleted dates weekend promo",
    description: "Removed after owner corrected pricing.",
    price: new Prisma.Decimal("8.49"),
    discountPct: 12,
    expiresAt: atDays(2),
    isExpired: false,
    createdAt: atHours(-16),
    deletedAt: atHours(-6),
  },
];

export const deals = [...coreDeals, ...bulkExtraDeals];

export const alerts = [
  {
    id: ids.alerts.ninaStoreFollowLotus,
    shopperId: ids.shoppers.nina,
    storeId: ids.stores.lotus,
    itemId: null,
    type: "store_follow" as const,
    isActive: true,
    createdAt: atDays(-1),
  },
  {
    id: ids.alerts.ninaItemRestockLamb,
    shopperId: ids.shoppers.nina,
    storeId: ids.stores.crescent,
    itemId: ids.items.halalLambShoulder,
    type: "item_restock" as const,
    isActive: true,
    createdAt: atHours(-5),
  },
  {
    id: ids.alerts.jordanStoreFollowTokyo,
    shopperId: ids.shoppers.jordan,
    storeId: ids.stores.tokyoMart,
    itemId: null,
    type: "store_follow" as const,
    isActive: true,
    createdAt: atHours(-9),
  },
  {
    id: ids.alerts.jordanItemRestockKale,
    shopperId: ids.shoppers.jordan,
    storeId: ids.stores.eastEndOrganic,
    itemId: ids.items.kale,
    type: "item_restock" as const,
    isActive: true,
    createdAt: atHours(-4),
  },
];
