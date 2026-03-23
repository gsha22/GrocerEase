import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Story 2: GET /api/stores/:id/deals — Active deals sorted by expiry (soonest first)
// Story 9: GET /api/stores/:id/deals?all=true — All deals (for owner reuse flow)
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { id: storeId } = await context.params;
  const showAll = request.nextUrl.searchParams.get("all") === "true";

  const now = new Date();

  const deals = await prisma.deal.findMany({
    where: {
      storeId,
      deletedAt: null,
      ...(showAll ? {} : { expiresAt: { gt: now }, isExpired: false }),
    },
    orderBy: { expiresAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      discountPct: true,
      expiresAt: true,
      isExpired: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ deals });
}

// Story 8: POST /api/stores/:id/deals — Create deal with expiry validation
// Story 9: POST with source_deal_id duplicates an existing deal
export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id: storeId } = await context.params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Story 9: Duplicate from source deal
  if (body.source_deal_id) {
    const source = await prisma.deal.findFirst({
      where: { id: body.source_deal_id, storeId },
    });
    if (!source) {
      return NextResponse.json(
        { error: "Source deal not found or does not belong to this store" },
        { status: 400 },
      );
    }

    const expiresAt = body.expires_at ? new Date(body.expires_at) : null;
    if (!expiresAt || expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "A future expires_at date is required" },
        { status: 400 },
      );
    }

    const deal = await prisma.deal.create({
      data: {
        storeId,
        title: body.title ?? source.title,
        description: body.description ?? source.description,
        discountPct: body.discount_pct ?? source.discountPct,
        expiresAt,
        sourceDealId: source.id,
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  }

  // Standard deal creation
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const expiresAt = body.expires_at ? new Date(body.expires_at) : null;
  if (!expiresAt || expiresAt <= new Date()) {
    return NextResponse.json(
      { error: "A future expires_at date is required" },
      { status: 400 },
    );
  }

  const deal = await prisma.deal.create({
    data: {
      storeId,
      title: body.title,
      description: body.description ?? null,
      discountPct: body.discount_pct ?? null,
      expiresAt,
    },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
