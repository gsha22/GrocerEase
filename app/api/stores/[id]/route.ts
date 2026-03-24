import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Story 3: GET /api/stores/:id — Get single store profile
// Story 12: No auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      freshUpdates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      deals: {
        where: {
          deletedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!store || !store.isPublished) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

// Story 7: PATCH /api/stores/:id — Update store profile (owner only)
export async function PATCH() {
  return NextResponse.json({ message: "TODO: Update store" }, { status: 501 });
}
