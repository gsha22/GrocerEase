const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Formats a decimal price string as USD (e.g. "4.99" → "$4.99").
 */
export function formatPriceUsd(price: string | null | undefined): string | null {
  if (price == null || price === "") return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/**
 * Formats an expiry date as "Expires Thursday, Mar 20".
 */
export function formatExpiry(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = DAY_NAMES[d.getDay()];
  const month = MONTH_NAMES[d.getMonth()];
  return `Expires ${day}, ${month} ${d.getDate()}`;
}

/**
 * Returns true when the deal expires within the next 24 hours.
 */
export function isUrgent(expiresAt: Date | string): boolean {
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const hoursLeft = (d.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft <= 24;
}

/**
 * Returns a short "Ends Mon"-style label for urgent deals.
 */
export function urgentLabel(expiresAt: Date | string): string {
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const shortDay = DAY_NAMES[d.getDay()].slice(0, 3);
  return `Ends ${shortDay}`;
}
