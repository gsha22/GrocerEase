const HOUR_MS = 60 * 60 * 1000;

/** Public list only includes updates from the last 7 days. */
export const FRESH_UPDATE_PUBLIC_WINDOW_MS = 7 * 24 * HOUR_MS;

/** Updates older than this are flagged as stale in API and UI. */
export const FRESH_UPDATE_STALE_THRESHOLD_MS = 48 * HOUR_MS;

/**
 * Max rows returned for public Fresh Today (store page + public GET updates).
 * Owner `?all=true` lists are uncapped.
 */
export const FRESH_UPDATE_PUBLIC_LIST_LIMIT = 60;

export const MAX_ITEM_NAME_LEN = 200;
export const MAX_NOTE_LEN = 500;

export type ParsedFreshUpdatePost =
  | { ok: true; itemName: string; note: string | null }
  | { ok: false; error: string };

export type ParsedFreshUpdatePatch =
  | { ok: true; data: { itemName?: string; note?: string | null } }
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

/**
 * Validates JSON body for PATCH /api/stores/:id/posts/:postId.
 * Supports either `note` or `description` as the optional text field.
 */
export function parseFreshUpdatePatchBody(
  body: unknown,
): ParsedFreshUpdatePatch {
  if (body === null || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const o = body as Record<string, unknown>;
  const hasItemName = Object.prototype.hasOwnProperty.call(o, "item_name");
  const hasNote = Object.prototype.hasOwnProperty.call(o, "note");
  const hasDescription = Object.prototype.hasOwnProperty.call(o, "description");
  if (!hasItemName && !hasNote && !hasDescription) {
    return {
      ok: false,
      error: "Provide at least one of item_name, note, or description.",
    };
  }

  const data: { itemName?: string; note?: string | null } = {};

  if (hasItemName) {
    if (typeof o.item_name !== "string") {
      return { ok: false, error: "item_name must be a string." };
    }
    const itemName = o.item_name.trim();
    if (!itemName) {
      return { ok: false, error: "item_name cannot be empty." };
    }
    if (itemName.length > MAX_ITEM_NAME_LEN) {
      return {
        ok: false,
        error: `item_name must be at most ${MAX_ITEM_NAME_LEN} characters.`,
      };
    }
    data.itemName = itemName;
  }

  if (hasNote || hasDescription) {
    const raw = hasNote ? o.note : o.description;
    if (raw !== undefined && raw !== null && typeof raw !== "string") {
      return { ok: false, error: "note/description must be a string when provided." };
    }
    const text = typeof raw === "string" ? raw.trim() : "";
    if (text.length > MAX_NOTE_LEN) {
      return {
        ok: false,
        error: `note/description must be at most ${MAX_NOTE_LEN} characters.`,
      };
    }
    data.note = text.length > 0 ? text : null;
  }

  return { ok: true, data };
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

/** Props shape for `StoreFreshUpdatesFeed` — built on the server in `stores/[id]/page.tsx`. */
export type StoreFreshFeedItem = {
  id: string;
  itemName: string;
  note: string | null;
  createdAt: string;
  isStale: boolean;
};

/**
 * Maps enriched DB rows to JSON-serializable feed items for the public store page.
 * Keeps serialization logic testable without importing the server page into Jest.
 */
export function mapEnrichedFreshUpdatesToFeedItems<
  T extends {
    id: string;
    itemName: string;
    note: string | null;
    createdAt: Date;
    isStale: boolean;
  },
>(rows: T[]): StoreFreshFeedItem[] {
  return rows.map((update) => ({
    id: update.id,
    itemName: update.itemName,
    note: update.note,
    createdAt: update.createdAt.toISOString(),
    isStale: update.isStale,
  }));
}
