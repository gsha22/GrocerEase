// Story 17: Shopper reports of incorrect or outdated store information.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper-session";

const REPORT_TYPES = [
  "out_of_stock",
  "incorrect_hours",
  "wrong_price",
  "other",
] as const;
type ReportType = (typeof REPORT_TYPES)[number];

const COMMENT_MAX = 280;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;
  const { id: storeId } = await ctx.params;

  const body = await req.json().catch(() => null);
  const type = body?.type;
  const commentRaw = body?.comment;

  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Invalid report type", allowed: REPORT_TYPES },
      { status: 400 },
    );
  }
  let comment: string | null = null;
  if (commentRaw != null) {
    if (typeof commentRaw !== "string") {
      return NextResponse.json(
        { error: "comment must be a string" },
        { status: 400 },
      );
    }
    const trimmed = commentRaw.trim();
    if (trimmed.length > COMMENT_MAX) {
      return NextResponse.json(
        { error: `comment too long (max ${COMMENT_MAX} characters)` },
        { status: 400 },
      );
    }
    comment = trimmed || null;
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  // Atomic check-then-create: Serializable isolation ensures two concurrent
  // POSTs can't both pass the "no recent duplicate" check and then both
  // insert. The loser aborts with a serialization failure (P2034), which we
  // translate to the same 429 the UI already handles.
  try {
    const report = await prisma.$transaction(
      async (tx) => {
        const recent = await tx.storeReport.findFirst({
          where: {
            storeId,
            shopperId: session.user.id,
            createdAt: { gt: since },
          },
          select: { id: true },
        });
        if (recent) return null;
        return tx.storeReport.create({
          data: {
            storeId,
            shopperId: session.user.id,
            type: type as ReportType,
            comment,
          },
          select: { id: true, type: true, comment: true, createdAt: true },
        });
      },
      { isolationLevel: "Serializable" },
    );

    if (!report) {
      return NextResponse.json(
        {
          error:
            "You've already reported this store in the last 24 hours. Thanks for helping keep info fresh.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2034"
    ) {
      return NextResponse.json(
        {
          error:
            "You've already reported this store in the last 24 hours. Thanks for helping keep info fresh.",
        },
        { status: 429 },
      );
    }
    throw e;
  }
}
