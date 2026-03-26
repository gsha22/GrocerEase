import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireShopperSession() {
  const session = await auth();
  if (!session?.user?.id || session.role !== "shopper") {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Sign in as a shopper to use this feature. Create a shopper account or log in.",
        },
        { status: 401 }
      ),
    };
  }
  return { ok: true as const, session };
}
