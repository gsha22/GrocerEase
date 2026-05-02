"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddressAutocompleteWithMap from "@/components/address/AddressAutocompleteWithMap";
import { validateStoreProfileReadyToPublish } from "@/lib/store-profile";

type StoreProfileInitial = {
  id: string;
  name: string;
  address: string;
  categories: string[];
  open: string;
  close: string;
  isPublished: boolean;
  lat?: number | null;
  lng?: number | null;
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
  const [saveSuccess, setSaveSuccess] = useState<"publish" | "draft" | null>(null);
  const [loading, setLoading] = useState(false);

  const isExisting = Boolean(initial?.id);
  const actionLabel = useMemo(() => storeProfileActionLabel(isExisting), [isExisting]);

  function toggleCategory(category: string) {
    setCategories((prev) => toggleCategoryKey(prev, category));
  }

  async function submit(publish: boolean) {
    setLoading(true);
    setFormError("");
    setSaveSuccess(null);
    setFieldErrors({});

    // Run publish-readiness validation only when actually publishing for the
    // first time. Re-publishing an already-live store (e.g. updating hours or
    // address) skips the gate so existing published owners are never blocked.
    const needsPublishValidation = publish && !initial?.isPublished;
    if (needsPublishValidation) {
      const preflight = validateStoreProfileReadyToPublish({
        name,
        address,
        open,
        close,
        categories,
      });
      if (!preflight.ok) {
        setFieldErrors(preflight.fieldErrors);
        const fieldList = Object.keys(preflight.fieldErrors)
          .map((k) => preflight.fieldErrors[k])
          .join(" ");
        setFormError(
          `Please fix the following before going live: ${fieldList}`,
        );
        setLoading(false);
        return;
      }
    }

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

      setSaveSuccess(publish ? "publish" : "draft");
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

        <AddressAutocompleteWithMap
          value={address}
          onChange={setAddress}
          initialLat={initial?.lat}
          initialLng={initial?.lng}
          fieldError={fieldErrors.address}
        />

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
      {saveSuccess === "publish" ? (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-900"
          role="status"
        >
          <p className="text-[14px] font-semibold">Your store profile is live</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-green-800/95">
            Your store profile is saved in the database. Shoppers can discover you on the public
            directory. Your listing also appears on your{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-green-800 underline decoration-green-600/50 underline-offset-2 hover:text-green-950"
            >
              owner dashboard
            </Link>
            . You can return here anytime to update hours, categories, or address.
          </p>
        </div>
      ) : null}
      {saveSuccess === "draft" ? (
        <div
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-900"
          role="status"
        >
          <p className="font-semibold">Draft saved</p>
          <p className="mt-1.5 leading-relaxed text-green-800/95">
            Your draft is saved in the database. Your store stays unpublished until you choose{" "}
            <span className="font-medium text-green-900">Update store profile</span>. When you
            publish, it will appear on the directory and your{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-green-800 underline decoration-green-600/50 underline-offset-2 hover:text-green-950"
            >
              dashboard
            </Link>
            .
          </p>
        </div>
      ) : null}

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
