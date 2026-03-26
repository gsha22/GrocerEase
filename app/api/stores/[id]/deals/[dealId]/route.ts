import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

interface RouteContext {
  params: Promise<{ id: string; dealId: string }>;
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
  sourceDealId: string | null;
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

/** Edit deal fields (owner only). */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: storeId, dealId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await prisma.deal.findFirst({
    where: { id: dealId, storeId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const patch: Prisma.DealUpdateInput = {};
  const now = new Date();

  if (body.price !== undefined) {
    const price = parsePrice(body.price);
    if (!price.ok) {
      return NextResponse.json({ error: price.error }, { status: 400 });
    }
    patch.price = price.value;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return NextResponse.json({ error: "description must be a string" }, { status: 400 });
    }
    patch.description = body.description.trim() || null;
  }

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }
    patch.title = body.title.trim();
  }

  if (body.expires_at !== undefined) {
    const expiresAt = new Date(body.expires_at as string);
    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "expires_at must be a valid date" }, { status: 400 });
    }
    if (expiresAt <= now) {
      return NextResponse.json({ error: "expires_at must be in the future" }, { status: 400 });
    }
    patch.expiresAt = expiresAt;
    patch.isExpired = false;
    patch.expiryNotifiedAt = null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields provided for update" }, { status: 400 });
  }

  const updated = await prisma.deal.update({
    where: { id: dealId },
    data: patch,
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
    },
  });

  return NextResponse.json({ deal: dealJson(updated) });
}

/** Soft-delete a deal before natural expiry (owner only). */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: storeId, dealId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, storeId, deletedAt: null },
  });
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  await prisma.deal.update({
    where: { id: dealId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
