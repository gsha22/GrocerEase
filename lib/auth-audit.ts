import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export type AuditEvent = "login_attempt";
export type AuditOutcome = "success" | "invalid_credentials" | "rate_limited" | "error";

/**
 * One-way hash of a value for audit log correlation.
 * Allows querying "was this email targeted?" without storing plaintext PII in the audit table.
 */
export function hashForAudit(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Writes a single auth event to the audit log.
 * Failures are swallowed — the audit log must never break the auth flow.
 */
export async function writeAuthAuditLog({
  event,
  outcome,
  accountType,
  email,
  ownerId,
  ipAddress,
}: {
  event: AuditEvent;
  outcome: AuditOutcome;
  accountType: "owner" | "shopper";
  email?: string;
  ownerId?: string;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.authAuditLog.create({
      data: {
        event,
        outcome,
        accountType,
        emailHash: email ? hashForAudit(email) : null,
        ownerId: ownerId ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch {
    // Intentionally silent — audit log failures must not interrupt authentication.
  }
}
