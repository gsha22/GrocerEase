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

export function parseCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx);
}

export function parseHours(value: unknown): { open: string; close: string } | null {
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

/**
 * Same rules as {@link validateStoreProfileCreate} — use before publishing so the
 * profile can go live on the directory without a round trip.
 */
export function validateStoreProfileReadyToPublish(input: {
  name: string;
  address: string;
  open: string;
  close: string;
  categories: string[];
}): { ok: true } | { ok: false; fieldErrors: Record<string, string> } {
  const validated = validateStoreProfileCreate({
    name: input.name,
    address: input.address,
    hours: { open: input.open, close: input.close },
    categories: input.categories,
  });
  if (!validated.ok) {
    return { ok: false, fieldErrors: validated.errors };
  }
  return { ok: true };
}

/** Fields allowed on PATCH; only keys present on the request body are validated and returned. */
export type StoreProfileValidatedPatch = {
  name?: string;
  address?: string;
  hours?: { open: string; close: string };
  categories?: string[];
  isPublished?: boolean;
};

export function validateStoreProfilePatch(
  body: Record<string, unknown>
): ValidationResult<StoreProfileValidatedPatch> {
  const errors: Record<string, string> = {};

  if ("name" in body) {
    const name = asTrimmedString(body.name);
    if (!name) errors.name = "Store name cannot be empty.";
  }
  if ("address" in body) {
    const address = asTrimmedString(body.address);
    if (!address) errors.address = "Address cannot be empty.";
  }
  if ("hours" in body) {
    const hours = parseHours(body.hours);
    if (!hours) {
      errors.hours =
        "Hours must include valid open and close times in HH:mm (24-hour).";
    }
  }
  if ("categories" in body) {
    if (!Array.isArray(body.categories)) {
      errors.categories = "Categories must be an array.";
    } else {
      const categories = parseCategories(body.categories);
      if (categories.length === 0) {
        errors.categories = "Select at least one specialty category.";
      } else if (categories.some((c) => !CATEGORY_ALLOWLIST.has(c))) {
        errors.categories = "One or more categories are invalid.";
      }
    }
  }
  if ("is_published" in body && typeof body.is_published !== "boolean") {
    errors.is_published = "is_published must be a boolean.";
  }
  if ("isPublished" in body && typeof body.isPublished !== "boolean") {
    errors.isPublished = "isPublished must be a boolean.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const data: StoreProfileValidatedPatch = {};
  if ("name" in body) data.name = asTrimmedString(body.name)!;
  if ("address" in body) data.address = asTrimmedString(body.address)!;
  if ("hours" in body) data.hours = parseHours(body.hours)!;
  if ("categories" in body) data.categories = parseCategories(body.categories);
  if (typeof body.isPublished === "boolean") {
    data.isPublished = body.isPublished;
  } else if (typeof body.is_published === "boolean") {
    data.isPublished = body.is_published;
  }

  return { ok: true, data };
}
