import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Story 5: DELETE /api/alerts/:id — Deactivate alert (shopper auth required)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const shopperId =
      req.headers.get("x-shopper-id") ?? req.nextUrl.searchParams.get("shopperId");
    if (!shopperId) {
      return NextResponse.json(
        { error: "shopperId is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing || existing.shopperId !== shopperId) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error("DELETE /api/alerts/:id error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
