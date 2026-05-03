/**
 * Shared email regex used by both client-side forms and server-side validators.
 *
 * Requires an alphabetic TLD (≥2 chars), which rejects addresses like
 * user@fake (no TLD) and user@example.123 (numeric TLD).
 */
export const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?=[^@]*\.[a-zA-Z]{2,}$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
