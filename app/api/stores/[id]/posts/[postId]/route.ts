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

  const existing = await prisma.freshUpdate.findFirst({
    where: { id: postId, storeId, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const post = await prisma.freshUpdate.update({
    where: { id: postId },
    data: parsed.data,
    select: {
      id: true,
      storeId: true,
      itemName: true,
      note: true,
      createdAt: true,
    },
  });

  broadcastPostEvent({
    storeId,
    postId,
    type: "POST_UPDATE",
  });

  return NextResponse.json({ post }, { status: 200 });
}

// Story 13: DELETE /stores/:id/posts/:post_id — soft delete only.
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: storeId, postId } = await context.params;

  const gate = await requireStoreOwnerForStore(storeId);
  if ("response" in gate) return gate.response;

  const existing = await prisma.freshUpdate.findFirst({
    where: { id: postId, storeId, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.freshUpdate.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  broadcastPostEvent({
    storeId,
    postId,
    type: "POST_DELETE",
  });

  return NextResponse.json({ ok: true });
}
