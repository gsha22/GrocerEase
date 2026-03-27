import { NextRequest, NextResponse } from "next/server";
import { AlertType } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper-session";

// GET /api/alerts — List own active alerts (shopper session required)
export async function GET() {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const shopperId = gate.session.user.id;

  try {
    const alerts = await prisma.alert.findMany({
      where: { shopperId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json(
      { error: "Failed to list alerts" },
      { status: 500 }
    );
  }
}

// POST /api/alerts — Create alert (item_restock or store_follow)
export async function POST(req: NextRequest) {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const shopperId = gate.session.user.id;

  try {
    const body = (await req.json()) as {
      itemId?: string | null;
      storeId?: string | null;
      type?: string;
    };

    if (body.type !== AlertType.item_restock && body.type !== AlertType.store_follow) {
      return NextResponse.json(
        { error: "type must be item_restock or store_follow" },
        { status: 400 }
      );
    }

    if (body.type === AlertType.item_restock && !body.itemId) {
      return NextResponse.json(
        { error: "itemId is required for item_restock alerts" },
        { status: 400 }
      );
    }

    if (body.type === AlertType.store_follow && !body.storeId) {
      return NextResponse.json(
        { error: "storeId is required for store_follow alerts" },
        { status: 400 }
      );
    }

    const existing = await prisma.alert.findFirst({
      where: {
        shopperId,
        type: body.type,
        itemId: body.itemId ?? null,
        storeId: body.storeId ?? null,
      },
    });

    const alert = existing
      ? await prisma.alert.update({
          where: { id: existing.id },
          data: { isActive: true },
        })
      : await prisma.alert.create({
          data: {
            shopperId,
            type: body.type,
            itemId: body.itemId ?? null,
            storeId: body.storeId ?? null,
          },
        });

    return NextResponse.json(alert, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
