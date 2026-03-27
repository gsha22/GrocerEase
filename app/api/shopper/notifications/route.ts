import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;
const MAX_SKIP = 5_000;

function clampInt(raw: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, max);
}

/** GET /api/shopper/notifications — inbox (newest first). Query: ?take=&skip= for pagination. */
export async function GET(req: NextRequest) {
  const gate = await requireShopperSession();
  if ("response" in gate) return gate.response;

  const take = clampInt(
    req.nextUrl.searchParams.get("take"),
    DEFAULT_TAKE,
    MAX_TAKE,
  );
  const skip = clampInt(req.nextUrl.searchParams.get("skip"), 0, MAX_SKIP);

  const rows = await prisma.shopperNotification.findMany({
    where: { shopperId: gate.shopperId },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      kind: true,
      title: true,
      body: true,
      readAt: true,
      createdAt: true,
      store: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    notifications: rows.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      store: n.store,
    })),
    hasMore: rows.length === take,
    skip,
    take,
  });
}
