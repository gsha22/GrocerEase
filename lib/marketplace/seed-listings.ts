import type { MarketplaceListing } from "./types";

/** Fixed timestamps so server and client bundles stay aligned (no hydration drift). */
export const seedMarketplaceListings: MarketplaceListing[] = [
  {
    id: "mp-seed-001",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    shopName: "Lotus Asian Market",
    shopAddress: "5899 Forbes Ave, Pittsburgh, PA 15217",
    itemName: "Baby Bok Choy",
    description: "Crisp bunches from regional growers — perfect for stir-fry.",
    price: 2.49,
    imageUrl:
      "https://images.unsplash.com/photo-1592419049011-0b919ccd419d?w=800&q=80",
    isFreshToday: true,
    isSpecialDeal: true,
    updatedAt: "2026-04-14T10:00:00.000Z",
  },
  {
    id: "mp-seed-002",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    shopName: "Lotus Asian Market",
    shopAddress: "5899 Forbes Ave, Pittsburgh, PA 15217",
    itemName: "Shin Ramyun 4-Pack",
    description: "Spicy instant noodle multipack — pantry staple.",
    price: 4.99,
    imageUrl:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80",
    isFreshToday: false,
    isSpecialDeal: true,
    updatedAt: "2026-04-14T06:00:00.000Z",
  },
  {
    id: "mp-seed-003",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    shopName: "Crescent Halal Grocer",
    shopAddress: "202 Brownsville Rd, Pittsburgh, PA 15210",
    itemName: "Halal Lamb Shoulder",
    description: "Fresh halal-certified cuts for the weekend grill.",
    price: 12.99,
    imageUrl:
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
    isFreshToday: true,
    isSpecialDeal: false,
    updatedAt: "2026-04-14T08:00:00.000Z",
  },
  {
    id: "mp-seed-004",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6",
    shopName: "East End Organic Pantry",
    shopAddress: "6400 Penn Ave, Pittsburgh, PA 15206",
    itemName: "Organic Kale",
    description: "Locally grown kale bunches — wash and enjoy raw or cooked.",
    price: 3.29,
    imageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    isFreshToday: true,
    isSpecialDeal: false,
    updatedAt: "2026-04-14T04:00:00.000Z",
  },
  {
    id: "mp-seed-005",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
    shopName: "Tokyo Mart Shadyside",
    shopAddress: "5525 Walnut St, Pittsburgh, PA 15232",
    itemName: "Gochujang Paste",
    description: "Korean chili paste for bibimbap, stews, and marinades.",
    price: 5.49,
    imageUrl:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80",
    isFreshToday: false,
    isSpecialDeal: true,
    updatedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    id: "mp-seed-006",
    storeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
    shopName: "Three Rivers Organic Produce",
    shopAddress: "2401 Smallman St, Pittsburgh, PA 15222",
    itemName: "Oat Milk Unsweetened",
    description: "Dairy-free staple for coffee and baking.",
    price: 3.99,
    imageUrl:
      "https://images.unsplash.com/photo-1600788886242-5c96aa287b88?w=800&q=80",
    isFreshToday: false,
    isSpecialDeal: false,
    updatedAt: "2026-04-13T16:00:00.000Z",
  },
];
