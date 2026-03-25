export type StoreProfileInput = {
  name: string;
  address: string;
  hours: { open: string; close: string };
  categories: string[];
  isPublished: boolean;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

const CATEGORY_ALLOWLIST = new Set(["asian", "halal", "organic", "produce", "ebt"]);

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx);
}

function parseHours(value: unknown): { open: string; close: string } | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as { open?: unknown; close?: unknown };
  const open = asTrimmedString(raw.open);
  const close = asTrimmedString(raw.close);
  if (!open || !close) return null;

  const isValidTime = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
  if (!isValidTime(open) || !isValidTime(close)) return null;

  return { open, close };
}

export function validateStoreProfileCreate(body: unknown): ValidationResult<StoreProfileInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { form: "Invalid JSON body." } };
  }
  const input = body as Record<string, unknown>;
  const name = asTrimmedString(input.name);
  const address = asTrimmedString(input.address);
  const hours = parseHours(input.hours);
  const categories = parseCategories(input.categories);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Store name is required.";
  if (!address) errors.address = "Address is required.";
  if (!hours) errors.hours = "Hours are required (open and close, HH:mm).";
  if (categories.length === 0) errors.categories = "Select at least one specialty category.";
  if (categories.some((c) => !CATEGORY_ALLOWLIST.has(c))) {
    errors.categories = "One or more categories are invalid.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: name!,
      address: address!,
      hours: hours!,
      categories,
      isPublished: true,
    },
  };
}
