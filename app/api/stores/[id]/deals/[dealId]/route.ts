import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

interface RouteContext {
  params: Promise<{ id: string; dealId: string }>;
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
