import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-secret";

function isShopperToken(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token || typeof token === "string") return false;
  const t = token as JWT;
  return t.role === "shopper" || Boolean(t.shopperId);
}

// Mirror @auth/core's useSecureCookies logic: check the actual request protocol.
// x-forwarded-proto is set by Vercel/proxies; fall back to the request URL protocol.
function getSessionCookieName(req: NextRequest): string {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    req.nextUrl.protocol.replace(":", "");
  const secure = proto === "https";
  return `${secure ? "__Secure-" : ""}authjs.session-token`;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: getAuthSecret(),
    cookieName: getSessionCookieName(req),
  });
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard") || path.startsWith("/vendor")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    if (isShopperToken(token)) {
      const dest = new URL("/shopper/account", req.url);
      dest.searchParams.set("notice", "owner-only");
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  if (path.startsWith("/shopper/account")) {
    if (!token) {
      const loginUrl = new URL("/shopper/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    if (!isShopperToken(token)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (token && typeof token !== "string") {
    const role = (token as JWT).role as string | undefined;
    if (role === "shopper") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor",
    "/vendor/:path*",
    "/shopper/account",
    "/shopper/account/:path*",
  ],
};
