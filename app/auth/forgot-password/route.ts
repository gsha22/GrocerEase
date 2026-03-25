import { NextRequest, NextResponse } from "next/server";

/**
 * Password reset is tracked for a future issue; this endpoint stays stable for the UI.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = typeof body.email === "string" ? body.email.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error:
        "Password reset is not available yet. This feature will be added in a future update.",
      code: "NOT_IMPLEMENTED",
    },
    { status: 501 }
  );
}
