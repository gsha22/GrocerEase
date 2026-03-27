import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper";

const TAKE = 50;

/** GET /api/shopper/notifications — inbox items for the logged-in shopper (newest first). */
export async function GET() {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const rows = await prisma.shopperNotification.findMany({
    where: { shopperId: gate.shopperId },
    orderBy: { createdAt: "desc" },
    take: TAKE,
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      readAt: true,
      createdAt: true,
      store: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    notifications: rows.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      store: n.store,
    })),
  });
}
