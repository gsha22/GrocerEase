import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPostEvent } from "@/lib/post-events";
import { parseFreshUpdatePatchBody } from "@/lib/fresh-updates";
import { requireStoreOwnerForStore } from "@/lib/require-store-owner";

interface RouteContext {
  params: Promise<{ id: string; postId: string }>;
}

// Story 13: PATCH /stores/:id/posts/:post_id — owner edits a post.
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: storeId, postId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const body = await request.json().catch(() => null);
  const parsed = parseFreshUpdatePatchBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await prisma.freshUpdate.updateMany({
    where: { id: postId, storeId, deletedAt: null },
    data: parsed.data,
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const post = await prisma.freshUpdate.findUnique({
    where: { id: postId },
    select: {
      id: true,
      storeId: true,
      itemName: true,
      note: true,
      createdAt: true,
      deletedAt: true,
    },
  });
  if (!post || post.storeId !== storeId || post.deletedAt !== null) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const responsePost = {
    id: post.id,
    storeId: post.storeId,
    itemName: post.itemName,
    note: post.note,
    createdAt: post.createdAt,
  };

  broadcastPostEvent({
    storeId,
    postId,
    type: "POST_UPDATE",
  });

  return NextResponse.json({ post: responsePost }, { status: 200 });
}

// Story 13: DELETE /stores/:id/posts/:post_id — soft delete only.
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: storeId, postId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const deleted = await prisma.freshUpdate.updateMany({
    where: { id: postId, storeId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  broadcastPostEvent({
    storeId,
    postId,
    type: "POST_DELETE",
  });

  return NextResponse.json({ ok: true });
}
