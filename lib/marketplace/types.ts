/** Client-side marketplace listing (demo / Vercel-friendly; not persisted to Prisma). */
export type MarketplaceListing = {
  id: string;
  shopName: string;
  shopAddress: string;
  itemName: string;
  description: string;
  /** Price in USD for display (e.g. 4.99) */
  price: number;
  imageUrl: string;
  isFreshToday: boolean;
  isSpecialDeal: boolean;
  updatedAt: string;
};

export type MarketplaceListingInput = Omit<
  MarketplaceListing,
  "id" | "updatedAt"
>;
