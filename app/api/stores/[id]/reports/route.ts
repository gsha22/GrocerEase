// Story 17: Owner-scoped listing of reports for their own store.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/require-owner-session";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireOwnerSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;
  const { id: storeId } = await ctx.params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, ownerId: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (store.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await prisma.storeReport.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      comment: true,
      createdAt: true,
    },
    take: 100,
  });

  return NextResponse.json({ reports });
}
