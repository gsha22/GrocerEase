import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function dealJson(deal: {
  id: string;
  title: string;
  description: string | null;
  price: Prisma.Decimal | null;
  discountPct: number | null;
  expiresAt: Date;
  isExpired: boolean;
  createdAt: Date;
  sourceDealId?: string | null;
}) {
  return {
    ...deal,
    price: deal.price != null ? deal.price.toString() : null,
    expiresAt: deal.expiresAt.toISOString(),
    createdAt: deal.createdAt.toISOString(),
  };
}

function parsePrice(raw: unknown): { ok: true; value: Prisma.Decimal } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "price is required" };
  }
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? parseFloat(raw)
        : NaN;
  if (!Number.isFinite(n)) {
    return { ok: false, error: "price must be a valid number" };
  }
  if (n <= 0) {
    return { ok: false, error: "price must be greater than zero" };
  }
  return { ok: true, value: new Prisma.Decimal(n.toFixed(2)) };
}

// Story 8: GET /api/stores/:id/deals — Active deals (expires_at > now, not expired)
// Story 9: GET ?all=true — All deals for this store (owner only, reuse flow)
export async function GET(request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const showAll = request.nextUrl.searchParams.get("all") === "true";
  const now = new Date();

  if (showAll) {
    const gate = await requireStoreOwnerForStore(storeId);
    if ("response" in gate) return gate.response;
  }

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
      price: true,
      discountPct: true,
      expiresAt: true,
      isExpired: true,
      createdAt: true,
      sourceDealId: true,
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    deals: deals.map((row) => {
      const { store, ...deal } = row;
      return {
        ...dealJson(deal),
        store,
      };
    }),
  });
}

// Story 8: POST — Create deal (owner only). Story 9: source_deal_id duplicates.
export async function POST(request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const now = new Date();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.source_deal_id) {
    const source = await prisma.deal.findFirst({
      where: { id: body.source_deal_id, storeId, deletedAt: null },
    });
    if (!source) {
      return NextResponse.json(
        { error: "Source deal not found or does not belong to this store" },
        { status: 400 },
      );
    }

    if (body.expires_at === undefined || body.expires_at === null || body.expires_at === "") {
      return NextResponse.json({ error: "expires_at is required" }, { status: 400 });
    }
    const expiresAt = new Date(body.expires_at as string);
    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "expires_at must be a valid date" }, { status: 400 });
    }
    if (expiresAt <= now) {
      return NextResponse.json({ error: "expires_at must be in the future" }, { status: 400 });
    }

    let price = source.price;
    if (body.price !== undefined && body.price !== null && body.price !== "") {
      const parsed = parsePrice(body.price);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      price = parsed.value;
    }
    if (price == null) {
      return NextResponse.json({ error: "price is required" }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        storeId,
        title:
          typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : source.title,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : source.description,
        price,
        discountPct:
          body.discount_pct !== undefined ? body.discount_pct ?? null : source.discountPct,
        expiresAt,
        sourceDealId: source.id,
        itemId: body.item_id ?? source.itemId,
        isExpired: false,
        expiryNotifiedAt: null,
      },
    });

    return NextResponse.json({ deal: dealJson(deal) }, { status: 201 });
  }

  const priceResult = parsePrice(body.price);
  if (!priceResult.ok) {
    return NextResponse.json({ error: priceResult.error }, { status: 400 });
  }

  if (typeof body.description !== "string" || !body.description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  const description = body.description.trim();

  if (body.expires_at === undefined || body.expires_at === null || body.expires_at === "") {
    return NextResponse.json({ error: "expires_at is required" }, { status: 400 });
  }
  const expiresAt = new Date(body.expires_at as string);
  if (Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ error: "expires_at must be a valid date" }, { status: 400 });
  }
  if (expiresAt <= now) {
    return NextResponse.json({ error: "expires_at must be in the future" }, { status: 400 });
  }

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : description.length > 80
        ? `${description.slice(0, 77)}...`
        : description;

  const deal = await prisma.deal.create({
    data: {
      storeId,
      title,
      description,
      price: priceResult.value,
      discountPct: body.discount_pct ?? null,
      expiresAt,
      itemId: body.item_id ?? null,
      isExpired: false,
      expiryNotifiedAt: null,
    },
  });

  return NextResponse.json({ deal: dealJson(deal) }, { status: 201 });
}
