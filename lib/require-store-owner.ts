import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireStoreOwnerForStore(storeId: string) {
  const session = await auth();
  if (!session?.user?.id || session.role !== "owner") {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return {
      response: NextResponse.json({ error: "Store not found" }, { status: 404 }),
    };
  }

  if (store.ownerId !== session.user.id) {
    return {
      response: NextResponse.json(
        { error: "You do not have permission for this store." },
        { status: 403 }
      ),
    };
  }

  return { session, store };
}
