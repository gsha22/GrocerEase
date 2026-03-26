import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper-session";

// DELETE /api/alerts/:id — Deactivate alert (shopper session required)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const shopperId = gate.session.user.id;

  try {
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
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
