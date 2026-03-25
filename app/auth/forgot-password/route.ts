import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RESET_TTL_MS = 60 * 60 * 1000;

const GENERIC_MESSAGE =
  "If an account exists for that email, you will receive reset instructions shortly.";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = typeof body.email === "string" ? body.email.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = raw.toLowerCase();
  const owner = await prisma.storeOwner.findUnique({ where: { email } });

  if (owner) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordResetToken.deleteMany({ where: { ownerId: owner.id } });
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        ownerId: owner.id,
        expiresAt,
      },
    });
    // Token is persisted; email delivery would be wired here in production.
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
