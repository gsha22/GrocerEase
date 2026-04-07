import { NextRequest, NextResponse } from "next/server";
import { runCredentialsSignIn } from "@/lib/credentials-sign-in-response";
import { isAuthRateLimited, requestIp } from "@/lib/rate-limit";
import { safeCallbackPath } from "@/lib/safe-callback-path";
import { writeAuthAuditLog } from "@/lib/auth-audit";

export async function POST(req: NextRequest) {
  const ip = requestIp(req);

  if (isAuthRateLimited(req, "owner-login")) {
    await writeAuthAuditLog({
      event: "login_attempt",
      outcome: "rate_limited",
      accountType: "owner",
      ipAddress: ip,
    });
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
  const callbackUrl = safeCallbackPath(body.callbackUrl);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const response = await runCredentialsSignIn(req, email, password, callbackUrl);

  await writeAuthAuditLog({
    event: "login_attempt",
    outcome: response.status === 200 ? "success" : "invalid_credentials",
    accountType: "owner",
    email,
    ipAddress: ip,
  });

  return response;
}
