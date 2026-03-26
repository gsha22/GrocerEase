import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";
import { publishPostEvent } from "@/lib/post-events";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function postJson(post: {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: Date;
}) {
  return {
    id: post.id,
    itemName: post.itemName,
    note: post.note,
    createdAt: post.createdAt.toISOString(),
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const posts = await prisma.freshUpdate.findMany({
    where: { storeId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ posts: posts.map(postJson) });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: storeId } = await context.params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.item_name !== "string" || !body.item_name.trim()) {
    return NextResponse.json({ error: "item_name is required" }, { status: 400 });
  }

  const itemName = body.item_name.trim();
  const note =
    typeof body.note === "string" ? body.note.trim() || null : body.note == null ? null : undefined;
  if (note === undefined) {
    return NextResponse.json({ error: "note must be a string when provided" }, { status: 400 });
  }

  const post = await prisma.freshUpdate.create({
    data: {
      storeId,
      itemName,
      note,
    },
    select: {
      id: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  publishPostEvent({ type: "POST_UPDATE", storeId, postId: post.id });
  return NextResponse.json({ post: postJson(post) }, { status: 201 });
}
