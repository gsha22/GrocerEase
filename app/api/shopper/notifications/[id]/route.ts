import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper";

/** PATCH /api/shopper/notifications/:id — mark read ({ "read": true }) or unread ({ "read": false }). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const { id } = await params;
  const row = await prisma.shopperNotification.findUnique({ where: { id } });
  if (!row || row.shopperId !== gate.shopperId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let read = true;
  try {
    const body = (await req.json().catch(() => null)) as { read?: unknown } | null;
    if (body && typeof body.read === "boolean") read = body.read;
  } catch {
    /* default read true */
  }

  const updated = await prisma.shopperNotification.update({
    where: { id },
    data: { readAt: read ? new Date() : null },
  });

  return NextResponse.json({
    id: updated.id,
    readAt: updated.readAt?.toISOString() ?? null,
  });
}
