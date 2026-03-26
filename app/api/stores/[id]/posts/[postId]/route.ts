import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";
import { publishPostEvent } from "@/lib/post-events";

interface RouteContext {
  params: Promise<{ id: string; postId: string }>;
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: storeId, postId } = await context.params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const post = await prisma.freshUpdate.findFirst({
    where: { id: postId, storeId, deletedAt: null },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const patch: { itemName?: string; note?: string | null } = {};

  if (body.item_name !== undefined) {
    if (typeof body.item_name !== "string" || !body.item_name.trim()) {
      return NextResponse.json({ error: "item_name must be a non-empty string" }, { status: 400 });
    }
    patch.itemName = body.item_name.trim();
  }

  if (body.note !== undefined) {
    if (body.note === null) {
      patch.note = null;
    } else if (typeof body.note === "string") {
      patch.note = body.note.trim() || null;
    } else {
      return NextResponse.json({ error: "note must be a string or null" }, { status: 400 });
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields provided for update" }, { status: 400 });
  }

  const updated = await prisma.freshUpdate.update({
    where: { id: postId },
    data: patch,
    select: {
      id: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  publishPostEvent({ type: "POST_UPDATE", storeId, postId });
  return NextResponse.json({ post: postJson(updated) });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: storeId, postId } = await context.params;
  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const post = await prisma.freshUpdate.findFirst({
    where: { id: postId, storeId, deletedAt: null },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.freshUpdate.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  publishPostEvent({ type: "POST_DELETE", storeId, postId });
  return NextResponse.json({ ok: true });
}
