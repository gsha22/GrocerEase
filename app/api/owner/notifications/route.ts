import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnerSession } from "@/lib/require-owner-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireOwnerSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;

  const notifications = await prisma.ownerNotification.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      deal: {
        select: {
          id: true,
          title: true,
          expiresAt: true,
        },
      },
    },
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireOwnerSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.ownerNotification.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.ownerNotification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
