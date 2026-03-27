import { NextRequest, NextResponse } from "next/server";
import { runCredentialsSignIn } from "@/lib/credentials-sign-in-response";
import { isAuthRateLimited } from "@/lib/rate-limit";
import { safeCallbackPath } from "@/lib/safe-callback-path";

export async function POST(req: NextRequest) {
  if (isAuthRateLimited(req, "shopper-login")) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: { email?: string; password?: string; callbackUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const email = rawEmail.trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const callbackUrl = safeCallbackPath(
    body.callbackUrl,
    "/shopper/account"
  );

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  return runCredentialsSignIn(
    req,
    email,
    password,
    callbackUrl,
    "shopper",
    "/shopper/account"
  );
}
