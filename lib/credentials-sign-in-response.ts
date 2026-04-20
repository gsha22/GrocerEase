import { Auth, skipCSRFCheck } from "@auth/core";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth";
import { getAuthSecret } from "@/lib/auth-secret";
import { safeCallbackPath } from "@/lib/safe-callback-path";

/**
 * Turns Auth.js Location into a same-origin path safe for client router.push
 * (never an external URL).
 */
export function safeRedirectPathForClient(
  locationHeader: string,
  requestOrigin: string,
  fallbackPath: string = "/dashboard",
): string {
  const loc = locationHeader.trim();
  if (!loc || loc.startsWith("//")) return fallbackPath;

  let absolute: string;
  if (loc.startsWith("http://") || loc.startsWith("https://")) {
    absolute = loc;
  } else {
    const path = loc.startsWith("/") ? loc : `/${loc}`;
    absolute = `${requestOrigin}${path}`;
  }

  try {
    const u = new URL(absolute);
    if (u.origin !== new URL(requestOrigin).origin) return fallbackPath;
    const out = `${u.pathname}${u.search}${u.hash}`;
    return out || fallbackPath;
  } catch {
    return fallbackPath;
  }
}

export type CredentialsAccountType = "owner" | "shopper";

export function buildCredentialsAuthRequest(
  req: NextRequest,
  email: string,
  password: string,
  callbackUrl: string,
  accountType: CredentialsAccountType = "owner",
) {
  const origin = req.nextUrl.origin;
  const url = new URL(`${origin}/api/auth/callback/credentials`);
  url.searchParams.set("callbackUrl", callbackUrl);

  return new Request(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, accountType }),
  });
}

/**
 * Maps Auth.js credentials callback to JSON + Set-Cookie.
 * Uses the sanitized redirect path passed to Auth.js so the client always gets
 * a stable `redirectUrl` (the Location header can differ by version).
 */
export function nextResponseFromCredentialsAuth(
  req: NextRequest,
  authRes: Response,
  successRedirectPath: string,
  role: "owner" | "shopper",
): NextResponse {
  const location = authRes.headers.get("Location") ?? "";

  if (
    location.includes("error=CredentialsSignin") ||
    location.includes("code=credentials")
  ) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (authRes.status === 302 || authRes.status === 303) {
    const res = NextResponse.json({
      ok: true,
      role,
      redirectUrl: successRedirectPath,
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
  callbackUrl: string,
  accountType: CredentialsAccountType = "owner",
  fallbackPath: string = "/dashboard",
): Promise<NextResponse> {
  const resolvedRedirect = safeCallbackPath(callbackUrl, fallbackPath);
  const authRequest = buildCredentialsAuthRequest(
    req,
    email,
    password,
    resolvedRedirect,
    accountType,
  );
  const authRes = await Auth(authRequest, {
    ...authConfig,
    secret: getAuthSecret(),
    skipCSRFCheck,
  });
  const role = accountType === "shopper" ? "shopper" : "owner";
  return nextResponseFromCredentialsAuth(req, authRes, resolvedRedirect, role);
}
