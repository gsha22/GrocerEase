const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Converts a Date into a human-friendly relative string such as "posted 2h ago".
 * Returns `null` when `date` is falsy.
 */
export function relativeTime(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();

  if (diff < MINUTE) return "posted just now";
  if (diff < HOUR) return `posted ${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `posted ${Math.floor(diff / HOUR)}h ago`;
  const days = Math.floor(diff / DAY);
  return `${days}d ago`;
}

const STALE_THRESHOLD_MS = 48 * HOUR;
const HIDDEN_THRESHOLD_MS = 7 * DAY;

/**
 * Returns `"fresh"` for updates within 48 h, `"stale"` for 48 h–7 d,
 * and `"hidden"` for anything older than 7 days.
 */
export function freshnessLevel(
  date: Date | string,
): "fresh" | "stale" | "hidden" {
  const d = typeof date === "string" ? new Date(date) : date;
  const age = Date.now() - d.getTime();
  if (age > HIDDEN_THRESHOLD_MS) return "hidden";
  if (age > STALE_THRESHOLD_MS) return "stale";
  return "fresh";
}
