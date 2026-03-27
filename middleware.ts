import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";

function isShopperToken(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token || typeof token === "string") return false;
  const t = token as JWT;
  return t.role === "shopper" || Boolean(t.shopperId);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
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

  const role = token.role as string | undefined;
  if (role === "shopper") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/shopper/account",
    "/shopper/account/:path*",
  ],
};
