import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Story 2: GET /api/deals — All active deals across all stores, sorted by expiry (soonest first)
export async function GET() {
  const now = new Date();

  const deals = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      isExpired: false,
      expiresAt: { gt: now },
      store: { isPublished: true },
    },
    orderBy: { expiresAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      discountPct: true,
      expiresAt: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

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
