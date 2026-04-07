"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StoreProfileInitial = {
  id: string;
  name: string;
  address: string;
  categories: string[];
  open: string;
  close: string;
  isPublished: boolean;
} | null;

type FieldErrors = Record<string, string>;

export const STORE_PROFILE_CATEGORY_OPTIONS = [
  { key: "asian", label: "Asian groceries" },
  { key: "halal", label: "Halal" },
  { key: "organic", label: "Organic" },
  { key: "produce", label: "Produce" },
  { key: "ebt", label: "EBT Accepted" },
];

export function toggleCategoryKey(prev: string[], category: string): string[] {
  return prev.includes(category)
    ? prev.filter((c) => c !== category)
    : [...prev, category];
}

export function buildStoreProfilePayload(
  name: string,
  address: string,
  open: string,
  close: string,
  categories: string[],
  isExisting: boolean,
  publish: boolean,
) {
  return {
    name,
    address,
    hours: { open, close },
    categories,
    ...(isExisting ? { isPublished: publish } : {}),
  };
}

export function storeProfileSaveTarget(
  isExisting: boolean,
  storeId: string | undefined,
): { endpoint: string; method: "PATCH" | "POST" } {
  if (isExisting && storeId) {
    return { endpoint: `/api/stores/${storeId}`, method: "PATCH" };
  }
  return { endpoint: "/api/stores", method: "POST" };
}

export function storeProfileActionLabel(isExisting: boolean): string {
  return isExisting ? "Update store profile" : "Publish store profile";
}

export default function StoreProfileForm({ initial }: { initial: StoreProfileInitial }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [open, setOpen] = useState(initial?.open ?? "08:00");
  const [close, setClose] = useState(initial?.close ?? "20:00");
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>("");
  const [savedMessage, setSavedMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isExisting = Boolean(initial?.id);
  const actionLabel = useMemo(() => storeProfileActionLabel(isExisting), [isExisting]);

  function toggleCategory(category: string) {
    setCategories((prev) => toggleCategoryKey(prev, category));
  }

  async function submit(publish: boolean) {
    setLoading(true);
    setFormError("");
    setSavedMessage("");
    setFieldErrors({});

    const payload = buildStoreProfilePayload(
      name,
      address,
      open,
      close,
      categories,
      isExisting,
      publish,
    );

    const { endpoint, method } = storeProfileSaveTarget(isExisting, initial?.id);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as
        | {
            error?: string;
            fieldErrors?: FieldErrors;
            store?: { id: string };
          }
        | null;

      if (!res.ok) {
        setFieldErrors(json?.fieldErrors ?? {});
        setFormError(json?.error ?? "Failed to save profile.");
        return;
      }

      setSavedMessage(publish ? "Store profile published." : "Store profile saved as draft.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Store details</h2>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Store name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. Sultan Bey International"
          />
          {fieldErrors.name && <p className="text-[12px] text-red-700 mt-1.5">{fieldErrors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Address *</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="142 Beaver St, Sewickley, PA 15143"
          />
          {fieldErrors.address && (
            <p className="text-[12px] text-red-700 mt-1.5">{fieldErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Opening time *</label>
            <input
              type="time"
              value={open}
              onChange={(e) => setOpen(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Closing time *</label>
            <input
              type="time"
              value={close}
              onChange={(e) => setClose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>
        </div>
        {fieldErrors.hours && <p className="text-[12px] text-red-700 mt-1.5">{fieldErrors.hours}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-2">Specialty categories</h2>
        <p className="text-[14px] text-gray-400 mb-3.5">Select all that apply - shoppers filter by these</p>
        <div className="flex flex-wrap gap-2">
          {STORE_PROFILE_CATEGORY_OPTIONS.map((option) => {
            const active = categories.includes(option.key);
            return (
              <button
                type="button"
                key={option.key}
                onClick={() => toggleCategory(option.key)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] border-[1.5px] transition-colors ${
                  active
                    ? "text-green-700 border-green-500 bg-green-50"
                    : "text-gray-600 border-gray-200 bg-white hover:border-green-400 hover:text-green-600"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {fieldErrors.categories && (
          <p className="text-[12px] text-red-700 mt-1.5">{fieldErrors.categories}</p>
        )}
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
          {formError}
        </div>
      )}
      {savedMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-800">
          {savedMessage}
        </div>
      )}

      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => submit(true)}
          className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : `${actionLabel} ->`}
        </button>
        {isExisting && (
          <button
            type="button"
            disabled={loading}
            onClick={() => submit(false)}
            className="px-5 py-2.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Save as draft
          </button>
        )}
      </div>
    </>
  );
}
