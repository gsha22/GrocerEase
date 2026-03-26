const HOUR_MS = 60 * 60 * 1000;

/** Public list only includes updates from the last 7 days. */
export const FRESH_UPDATE_PUBLIC_WINDOW_MS = 7 * 24 * HOUR_MS;

/** Updates older than this are flagged as stale in API and UI. */
export const FRESH_UPDATE_STALE_THRESHOLD_MS = 48 * HOUR_MS;

const MAX_ITEM_NAME_LEN = 200;
const MAX_NOTE_LEN = 500;

export type ParsedFreshUpdatePost =
  | { ok: true; itemName: string; note: string | null }
  | { ok: false; error: string };

/**
 * Validates JSON body for POST /api/stores/:id/updates.
 */
export function parseFreshUpdatePostBody(body: unknown): ParsedFreshUpdatePost {
  if (body === null || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const o = body as Record<string, unknown>;
  const rawName = o.item_name;
  if (rawName === undefined || rawName === null) {
    return { ok: false, error: "item_name is required." };
  }
  if (typeof rawName !== "string") {
    return { ok: false, error: "item_name must be a string." };
  }
  const itemName = rawName.trim();
  if (!itemName) {
    return { ok: false, error: "item_name cannot be empty." };
  }
  if (itemName.length > MAX_ITEM_NAME_LEN) {
    return {
      ok: false,
      error: `item_name must be at most ${MAX_ITEM_NAME_LEN} characters.`,
    };
  }

  let note: string | null = null;
  if (o.note !== undefined && o.note !== null) {
    if (typeof o.note !== "string") {
      return { ok: false, error: "note must be a string when provided." };
    }
    const t = o.note.trim();
    if (t.length > MAX_NOTE_LEN) {
      return {
        ok: false,
        error: `note must be at most ${MAX_NOTE_LEN} characters.`,
      };
    }
    note = t.length > 0 ? t : null;
  }

  return { ok: true, itemName, note };
}

export function enrichFreshUpdatesWithStale<T extends { createdAt: Date }>(
  rows: T[],
  now: Date,
  staleThresholdMs: number = FRESH_UPDATE_STALE_THRESHOLD_MS,
): (T & { isStale: boolean })[] {
  const nowMs = now.getTime();
  return rows.map((u) => ({
    ...u,
    isStale: nowMs - u.createdAt.getTime() > staleThresholdMs,
  }));
}
