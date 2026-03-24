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
    deals,
    meta: {
      totalDeals: deals.length,
      totalStores: storeIds.size,
    },
  });
}
