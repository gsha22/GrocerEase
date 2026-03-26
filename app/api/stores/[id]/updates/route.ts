import { NextRequest, NextResponse } from "next/server";
import {
  enrichFreshUpdatesWithStale,
  FRESH_UPDATE_PUBLIC_LIST_LIMIT,
  FRESH_UPDATE_PUBLIC_WINDOW_MS,
  parseFreshUpdatePostBody,
} from "@/lib/fresh-updates";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Story 1: GET /api/stores/:id/updates — List fresh updates (newest first, 48h staleness)
// Story 11: GET ?all=true — All non-deleted updates (owner only)
export async function GET(request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const showAll = request.nextUrl.searchParams.get("all") === "true";
  const now = new Date();

  if (showAll) {
    const gate = await requireStoreOwnerForStore(storeId);
    if ("response" in gate) return gate.response;
  }

  const windowStart = showAll
    ? null
    : new Date(now.getTime() - FRESH_UPDATE_PUBLIC_WINDOW_MS);

  const updates = await prisma.freshUpdate.findMany({
    where: {
      storeId,
      deletedAt: null,
      ...(windowStart ? { createdAt: { gte: windowStart } } : {}),
    },
    orderBy: { createdAt: "desc" },
    ...(showAll ? {} : { take: FRESH_UPDATE_PUBLIC_LIST_LIMIT }),
    select: {
      id: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  const enriched = enrichFreshUpdatesWithStale(updates, now);

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
  const parsed = parseFreshUpdatePostBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const update = await prisma.freshUpdate.create({
    data: {
      storeId,
      itemName: parsed.itemName,
      note: parsed.note,
    },
  });

  return NextResponse.json({ update }, { status: 201 });
}
