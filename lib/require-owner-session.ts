import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireOwnerSession() {
  const session = await auth();
  if (!session?.user?.id || session.role !== "owner") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}
