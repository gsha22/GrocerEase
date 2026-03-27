import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper";

/** DELETE /api/alerts/:id — set isActive false for the logged-in shopper */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const { id } = await params;
  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing || existing.shopperId !== gate.shopperId) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({
    id: alert.id,
    isActive: alert.isActive,
    type: alert.type,
    storeId: alert.storeId,
    itemId: alert.itemId,
  });
}
