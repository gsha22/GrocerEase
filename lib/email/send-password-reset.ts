import { escapeHtml } from "@/lib/email/escape-html";

export type PasswordResetEmailResult =
  | { ok: true; provider: "resend" | "sendgrid" | "skipped" }
  | { ok: false; provider: "resend" | "sendgrid"; error: string };

const SUBJECT = "Reset your GrocerEase password";

function buildHtml(ownerName: string, resetUrl: string): string {
  const name = escapeHtml(ownerName || "there");
  const safeUrl = escapeHtml(resetUrl);
  return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1c1917;">
  <p>Hi ${name},</p>
  <p>We received a request to reset the password for your GrocerEase store owner account.</p>
  <p><a href="${safeUrl}" style="color: #15803d; font-weight: 600;">Set a new password</a></p>
  <p style="font-size: 13px; color: #78716c;">This link expires in one hour. If you didn’t ask for this, you can ignore this email.</p>
  <p style="font-size: 13px; color: #78716c;">If the button doesn’t work, copy and paste this URL into your browser:<br /><span style="word-break: break-all;">${safeUrl}</span></p>
</body>
</html>`;
}

function parseEmailFromBrackets(from: string): string | null {
  const m = from.match(/<([^>]+)>/);
  if (m?.[1]) return m[1].trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim())) return from.trim();
  return null;
}

/**
 * Sends the password reset link via **Resend** (`RESEND_API_KEY`) or **SendGrid** (`SENDGRID_API_KEY`).
 * If neither is set, returns `skipped` (caller may log the URL only in development).
 */
export async function sendPasswordResetEmail(opts: {
  to: string;
  ownerName: string;
  resetUrl: string;
}): Promise<PasswordResetEmailResult> {
  const html = buildHtml(opts.ownerName, opts.resetUrl);
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const sendgridKey = process.env.SENDGRID_API_KEY?.trim();

  if (resendKey) {
    const from =
      process.env.EMAIL_FROM?.trim() || "GrocerEase <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject: SUBJECT,
          html,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Resend API error:", res.status, text);
        return { ok: false, provider: "resend", error: text || res.statusText };
      }
      return { ok: true, provider: "resend" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Resend request failed:", e);
      return { ok: false, provider: "resend", error: msg };
    }
  }

  if (sendgridKey) {
    const fromEmail =
      process.env.SENDGRID_FROM_EMAIL?.trim() ||
      (process.env.EMAIL_FROM ? parseEmailFromBrackets(process.env.EMAIL_FROM) : null);
    if (!fromEmail) {
      console.error(
        "SendGrid: set SENDGRID_FROM_EMAIL or EMAIL_FROM with a <email@domain.com> address.",
      );
      return {
        ok: false,
        provider: "sendgrid",
        error: "Missing SENDGRID_FROM_EMAIL or EMAIL_FROM for SendGrid.",
      };
    }
    const fromName = process.env.EMAIL_FROM_NAME?.trim() || "GrocerEase";
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: opts.to }] }],
          from: { email: fromEmail, name: fromName },
          subject: SUBJECT,
          content: [{ type: "text/html", value: html }],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("SendGrid API error:", res.status, text);
        return { ok: false, provider: "sendgrid", error: text || res.statusText };
      }
      return { ok: true, provider: "sendgrid" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("SendGrid request failed:", e);
      return { ok: false, provider: "sendgrid", error: msg };
    }
  }

  return { ok: true, provider: "skipped" };
}
