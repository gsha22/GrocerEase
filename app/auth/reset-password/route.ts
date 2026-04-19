import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-reset-token";
import { isAuthRateLimited } from "@/lib/rate-limit";

const BCRYPT_ROUNDS = 12;

function validatePassword(password: string): string | null {
  if (password.length < 8) return "be at least 8 characters";
  if (!/[a-zA-Z]/.test(password)) return "include at least one letter";
  if (!/[0-9]/.test(password)) return "include at least one number";
  return null;
}

/** Complete owner password reset using a one-time token from email (or dev console). */
export async function POST(req: NextRequest) {
  if (isAuthRateLimited(req, "reset-password")) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const token = typeof o.token === "string" ? o.token.trim() : "";
  const password = typeof o.password === "string" ? o.password : "";
  const confirmPassword = typeof o.confirmPassword === "string" ? o.confirmPassword : "";

  if (!token || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Token, password, and confirmPassword are required." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match.", fieldErrors: { confirmPassword: "Must match password." } },
      { status: 400 },
    );
  }

  const pwdErr = validatePassword(password);
  if (pwdErr) {
    return NextResponse.json(
      { error: `Password must ${pwdErr}.`, fieldErrors: { password: `Password must ${pwdErr}.` } },
      { status: 400 },
    );
  }

  const tokenHash = hashResetToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await prisma.$transaction([
      prisma.storeOwner.update({
        where: { id: row.ownerId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: row.id } }),
    ]);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("POST /auth/reset-password transaction error:", e);
    }
    return NextResponse.json({ error: "Could not update password. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Password updated. You can sign in with your new password." });
}
