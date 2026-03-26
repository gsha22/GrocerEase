/**
 * Accepts only same-app relative paths for post-login redirects.
 * Rejects protocol-relative URLs (`//…`) and non-path values.
 */
export function safeCallbackPath(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "/dashboard";
  const t = raw.trim();
  if (!isSafeRelativeAppPath(t)) return "/dashboard";
  return t;
}

/** True for in-app paths safe to pass to `router.push` (not `//evil.com`). */
export function isSafeRelativeAppPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
