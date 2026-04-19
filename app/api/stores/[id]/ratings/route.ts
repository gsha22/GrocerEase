// Story 15: Shopper-facing store ratings.
// - GET is public; returns aggregate + paginated recent notes.
// - POST requires a shopper session; one rating per (store, shopper).
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireShopperSession } from "@/lib/require-shopper-session";

const PAGE_SIZE = 10;
const NOTE_MAX = 280;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: storeId } = await ctx.params;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10) || 1);

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const agg = await prisma.storeRating.aggregate({
    where: { storeId },
    _avg: { score: true },
    _count: { _all: true },
  });

  const ratings = await prisma.storeRating.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      score: true,
      note: true,
      createdAt: true,
      shopper: { select: { name: true } },
    },
  });

  const total = agg._count._all;
  const average =
    agg._avg.score != null ? Math.round(agg._avg.score * 10) / 10 : null;

  return NextResponse.json({
    average,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: page * PAGE_SIZE < total,
    ratings: ratings.map((r) => ({
      id: r.id,
      score: r.score,
      note: r.note,
      createdAt: r.createdAt,
      authorName: r.shopper.name,
    })),
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireShopperSession();
  if (!gate.ok) return gate.response;
  const { session } = gate;
  const { id: storeId } = await ctx.params;

  const body = await req.json().catch(() => null);
  const score = body?.score;
  const noteRaw = body?.note;

  if (
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5
  ) {
    return NextResponse.json(
      { error: "score must be an integer between 1 and 5" },
      { status: 400 },
    );
  }
  let note: string | null = null;
  if (noteRaw != null) {
    if (typeof noteRaw !== "string") {
      return NextResponse.json(
        { error: "note must be a string" },
        { status: 400 },
      );
    }
    const trimmed = noteRaw.trim();
    if (trimmed.length > NOTE_MAX) {
      return NextResponse.json(
        { error: `note too long (max ${NOTE_MAX} characters)` },
        { status: 400 },
      );
    }
    note = trimmed || null;
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  try {
    const rating = await prisma.storeRating.create({
      data: {
        storeId,
        shopperId: session.user.id,
        score,
        note,
      },
      select: { id: true, score: true, note: true, createdAt: true },
    });
    return NextResponse.json({ rating }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "You've already rated this store. Delete your rating first to submit a new one.",
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
