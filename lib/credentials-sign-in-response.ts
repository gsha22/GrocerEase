import { Auth, skipCSRFCheck } from "@auth/core";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth";

export function buildCredentialsAuthRequest(
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

/**
 * Maps Auth.js credentials callback Response to a JSON API response + session cookies.
 */
export function nextResponseFromCredentialsAuth(
  req: NextRequest,
  authRes: Response
): NextResponse {
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

export async function runCredentialsSignIn(
  req: NextRequest,
  email: string,
  password: string,
  callbackUrl: string
): Promise<NextResponse> {
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
  return nextResponseFromCredentialsAuth(req, authRes);
}
