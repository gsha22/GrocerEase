import { NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 20;

const globalStore = globalThis as typeof globalThis & {
  __authRateLimitStore?: Map<string, Bucket>;
};

const store = globalStore.__authRateLimitStore ?? new Map<string, Bucket>();
globalStore.__authRateLimitStore = store;

function requestIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  const realIp = req.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

export function isAuthRateLimited(req: NextRequest, scope: string): boolean {
  const now = Date.now();
  const key = `${scope}:${requestIp(req)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_ATTEMPTS) return true;
  current.count += 1;
  store.set(key, current);
  return false;
}
