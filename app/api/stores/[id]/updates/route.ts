import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";
import { publishPostEvent } from "@/lib/post-events";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Story 1: GET /api/stores/:id/updates — List fresh updates (newest first, 48h staleness)
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id: storeId } = await context.params;

  const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const FORTY_EIGHT_HOURS_AGO = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const updates = await prisma.freshUpdate.findMany({
    where: {
      storeId,
      deletedAt: null,
      createdAt: { gte: SEVEN_DAYS_AGO },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  const enriched = updates.map((u) => ({
    ...u,
    isStale: u.createdAt < FORTY_EIGHT_HOURS_AGO,
  }));

  return NextResponse.json({ updates: enriched });
}

// Story 11: POST /api/stores/:id/updates — Post a fresh update (item_name required)
export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id: storeId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await request.json().catch(() => null);
  if (!body || !body.item_name || typeof body.item_name !== "string") {
    return NextResponse.json(
      { error: "item_name is required" },
      { status: 400 },
    );
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const update = await prisma.freshUpdate.create({
    data: {
      storeId,
      itemName: body.item_name,
      note: body.note ?? null,
    },
  });

  publishPostEvent({ type: "POST_UPDATE", storeId, postId: update.id });
  return NextResponse.json({ update }, { status: 201 });
}
