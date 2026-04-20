import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/password-reset-token";
import { isAuthRateLimited, requestIp } from "@/lib/rate-limit";

const RESET_TTL_MS = 60 * 60 * 1000;

const GENERIC_MESSAGE =
  "If an account exists for that email, password reset instructions will follow shortly.";

function hasEmailProvider(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() || process.env.SENDGRID_API_KEY?.trim(),
  );
}

/**
 * Owner password reset request. Always returns the same message to avoid email enumeration.
 * Sends mail via Resend or SendGrid when configured; otherwise logs the reset URL in development only.
 */
export async function POST(req: NextRequest) {
  if (isAuthRateLimited(req, "forgot-password")) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!raw) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const owner = await prisma.storeOwner.findUnique({
    where: { email: raw },
    select: { id: true, name: true },
  });

  if (owner) {
    const { raw: tokenRaw, hash } = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordResetToken.deleteMany({ where: { ownerId: owner.id } });
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hash,
        ownerId: owner.id,
        expiresAt,
      },
    });

    const base =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${base}/login/reset?token=${encodeURIComponent(tokenRaw)}`;

    const emailResult = await sendPasswordResetEmail({
      to: raw,
      ownerName: owner.name,
      resetUrl,
    });

    if (emailResult.ok && emailResult.provider !== "skipped") {
      if (process.env.NODE_ENV === "development") {
        console.info(
          `[password-reset] sent via ${emailResult.provider} ip=${requestIp(req)} owner=${owner.id}`,
        );
      }
    } else if (!emailResult.ok) {
      console.error(
        `[password-reset] email failed (${emailResult.provider}): ${emailResult.error}`,
      );
      if (process.env.NODE_ENV === "development") {
        console.info(`[password-reset] fallback dev log resetUrl=${resetUrl}`);
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.info(
          `[password-reset] no RESEND_API_KEY or SENDGRID_API_KEY; dev log only ip=${requestIp(req)} owner=${owner.id} resetUrl=${resetUrl}`,
        );
      } else if (!hasEmailProvider()) {
        console.warn(
          "[password-reset] No email provider configured; user will not receive a reset link. Set RESEND_API_KEY or SENDGRID_API_KEY.",
        );
      }
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE }, { status: 200 });
}
