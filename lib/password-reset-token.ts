import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

/** Returns raw token (send to user) and hash (store in DB). */
export function generatePasswordResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = hashResetToken(raw);
  return { raw, hash };
}

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}
