import { Auth, skipCSRFCheck } from "@auth/core";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth";

function buildCredentialsAuthRequest(
  req: NextRequest,
  email: string,
  password: string,
  callbackUrl: string
) {
  const origin = req.nextUrl.origin;
  const url = new URL(`${origin}/api/auth/callback/credentials`);
  url.searchParams.set("callbackUrl", callbackUrl);

  return new Request(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; callbackUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const callbackUrl =
    typeof body.callbackUrl === "string" && body.callbackUrl.startsWith("/")
      ? body.callbackUrl
      : "/dashboard";

  if (!email.trim() || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const authRequest = buildCredentialsAuthRequest(
    req,
    email,
    password,
    callbackUrl
  );

  const authRes = await Auth(authRequest, {
    ...authConfig,
    skipCSRFCheck,
  });

  const location = authRes.headers.get("Location") ?? "";

  if (
    location.includes("error=CredentialsSignin") ||
    location.includes("code=credentials")
  ) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (authRes.status === 302 || authRes.status === 303) {
    const res = NextResponse.json({
      ok: true,
      redirectUrl: location.startsWith("http")
        ? location
        : `${req.nextUrl.origin}${location}`,
    });
    const rawCookies = authRes.headers.getSetCookie?.() ?? [];
    for (const cookie of rawCookies) {
      res.headers.append("Set-Cookie", cookie);
    }
    return res;
  }

  return new NextResponse(authRes.body, {
    status: authRes.status,
    headers: authRes.headers,
  });
}
