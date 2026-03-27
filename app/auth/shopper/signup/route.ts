import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { runCredentialsSignIn } from "@/lib/credentials-sign-in-response";
import { isAuthRateLimited } from "@/lib/rate-limit";
import { validateSignupInput } from "@/lib/validate-owner-signup";

const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  if (isAuthRateLimited(req, "shopper-signup")) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateSignupInput(body, "/shopper/account");
  if (!validated.ok) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: validated.errors },
      { status: 400 }
    );
  }

  const { email, password, name, callbackUrl } = validated.data;

  const [existingShopper, existingOwner] = await Promise.all([
    prisma.shopper.findUnique({ where: { email }, select: { id: true } }),
    prisma.storeOwner.findUnique({ where: { email }, select: { id: true } }),
  ]);

  if (existingShopper || existingOwner) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let shopper;
  try {
    shopper = await prisma.shopper.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("POST /auth/shopper/signup create error:", e);
    return NextResponse.json(
      { error: "Could not create account. Try again." },
      { status: 500 }
    );
  }

  const signInRes = await runCredentialsSignIn(
    req,
    email,
    password,
    callbackUrl,
    "shopper",
    "/shopper/account"
  );
  const setCookies = signInRes.headers.getSetCookie?.() ?? [];
  const signInJson = (await signInRes.json().catch(() => null)) as {
    ok?: boolean;
    redirectUrl?: string;
  } | null;

  if (!signInJson?.ok || typeof signInJson.redirectUrl !== "string") {
    return NextResponse.json(
      {
        error:
          "Account was created but automatic sign-in failed. Please log in manually.",
        user: shopper,
      },
      { status: 201 }
    );
  }

  const res = NextResponse.json(
    {
      ok: true,
      redirectUrl: signInJson.redirectUrl,
      user: shopper,
    },
    { status: 201 }
  );

  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
