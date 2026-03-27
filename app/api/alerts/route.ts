import { NextRequest, NextResponse } from "next/server";
import { AlertType } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper";

function serializeAlert(row: {
  id: string;
  shopperId: string;
  itemId: string | null;
  storeId: string | null;
  type: AlertType;
  isActive: boolean;
  createdAt: Date;
  store: { id: string; name: string } | null;
  item: { id: string; name: string } | null;
}) {
  return {
    id: row.id,
    shopperId: row.shopperId,
    itemId: row.itemId,
    storeId: row.storeId,
    type: row.type,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    store: row.store,
    item: row.item,
  };
}

/** GET /api/alerts — active alerts for the logged-in shopper */
export async function GET() {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const alerts = await prisma.alert.findMany({
    where: { shopperId: gate.shopperId, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      store: { select: { id: true, name: true } },
      item: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    alerts: alerts.map(serializeAlert),
  });
}

/** POST /api/alerts — create store_follow or item_restock (session shopper only) */
export async function POST(req: NextRequest) {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const typeRaw = body.type;
  if (typeRaw !== AlertType.item_restock && typeRaw !== AlertType.store_follow) {
    return NextResponse.json(
      { error: "type must be item_restock or store_follow" },
      { status: 400 },
    );
  }
  const type = typeRaw as AlertType;

  if (type === AlertType.store_follow) {
    const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required for store_follow alerts" },
        { status: 400 },
      );
    }

    const store = await prisma.store.findFirst({
      where: { id: storeId, isPublished: true },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found or not published" }, { status: 400 });
    }

    const existing = await prisma.alert.findFirst({
      where: {
        shopperId: gate.shopperId,
        type: AlertType.store_follow,
        storeId,
        itemId: null,
      },
    });

    const alert = existing
      ? await prisma.alert.update({
          where: { id: existing.id },
          data: { isActive: true },
          include: {
            store: { select: { id: true, name: true } },
            item: { select: { id: true, name: true } },
          },
        })
      : await prisma.alert.create({
          data: {
            shopperId: gate.shopperId,
            type: AlertType.store_follow,
            storeId,
            itemId: null,
          },
          include: {
            store: { select: { id: true, name: true } },
            item: { select: { id: true, name: true } },
          },
        });

    return NextResponse.json(serializeAlert(alert), { status: 201 });
  }

  const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!storeId || !itemId) {
    return NextResponse.json(
      { error: "storeId and itemId are required for item_restock alerts" },
      { status: 400 },
    );
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, storeId },
    include: { store: { select: { isPublished: true } } },
  });
  if (!item || !item.store.isPublished) {
    return NextResponse.json(
      { error: "Item not found or store is not published" },
      { status: 400 },
    );
  }

  const existing = await prisma.alert.findFirst({
    where: {
      shopperId: gate.shopperId,
      type: AlertType.item_restock,
      storeId,
      itemId,
    },
  });

  const alert = existing
    ? await prisma.alert.update({
        where: { id: existing.id },
        data: { isActive: true },
        include: {
          store: { select: { id: true, name: true } },
          item: { select: { id: true, name: true } },
        },
      })
    : await prisma.alert.create({
        data: {
          shopperId: gate.shopperId,
          type: AlertType.item_restock,
          storeId,
          itemId,
        },
        include: {
          store: { select: { id: true, name: true } },
          item: { select: { id: true, name: true } },
        },
      });

  return NextResponse.json(serializeAlert(alert), { status: 201 });
}
