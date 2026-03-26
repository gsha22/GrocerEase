import { NextRequest, NextResponse } from "next/server";
import { runCredentialsSignIn } from "@/lib/credentials-sign-in-response";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; callbackUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email : "";
  const email = rawEmail.trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const callbackUrl =
    typeof body.callbackUrl === "string" && body.callbackUrl.startsWith("/")
      ? body.callbackUrl
      : "/dashboard";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  return runCredentialsSignIn(req, email, password, callbackUrl);
}
