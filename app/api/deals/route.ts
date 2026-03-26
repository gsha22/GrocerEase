import { NextResponse } from "next/server";
import { findActivePublishedDeals } from "@/lib/active-published-deals";

// Story 2 / 8: GET /api/deals — Active deals across published stores, soonest expiry first
export async function GET() {
  const deals = await findActivePublishedDeals();

  const storeIds = new Set(deals.map((d) => d.store.id));

  return NextResponse.json({
    deals: deals.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price != null ? d.price.toString() : null,
      discountPct: d.discountPct,
      expiresAt: d.expiresAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
      store: d.store,
    })),
    meta: {
      totalDeals: deals.length,
      totalStores: storeIds.size,
    },
  });
}
