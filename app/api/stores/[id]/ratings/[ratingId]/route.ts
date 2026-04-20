// Story 15: A shopper may delete their own rating only.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper-session";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; ratingId: string }> },
) {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;
  const { id: storeId, ratingId } = await ctx.params;

  const rating = await prisma.storeRating.findUnique({
    where: { id: ratingId },
    select: { id: true, shopperId: true, storeId: true },
  });
  if (!rating || rating.storeId !== storeId) {
    return NextResponse.json({ error: "Rating not found" }, { status: 404 });
  }
  if (rating.shopperId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only delete your own rating." },
      { status: 403 },
    );
  }

  await prisma.storeRating.delete({ where: { id: ratingId } });
  return NextResponse.json({ ok: true });
}
