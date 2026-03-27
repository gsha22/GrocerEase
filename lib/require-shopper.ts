import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireShopperSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (session.role !== "shopper") {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, shopperId: session.user.id };
}
