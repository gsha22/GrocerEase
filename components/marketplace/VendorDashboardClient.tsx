"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import ListingPhoto from "@/components/marketplace/ListingPhoto";
import Link from "next/link";
import type { MarketplaceListingInput } from "@/lib/marketplace/types";
import { useMarketplaceStore } from "@/stores/marketplace-store";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);
}

interface OwnerStore {
  id: string;
  name: string;
  address: string;
}

interface VendorDashboardClientProps {
  ownerStore: OwnerStore | null;
}

export default function VendorDashboardClient({ ownerStore }: VendorDashboardClientProps) {
  const listings = useMarketplaceStore((s) => s.listings);
  const addListing = useMarketplaceStore((s) => s.addListing);
  const updateListing = useMarketplaceStore((s) => s.updateListing);
  const deleteListing = useMarketplaceStore((s) => s.deleteListing);

  const blankForm = (): MarketplaceListingInput => ({
    storeId: ownerStore?.id,
    shopName: ownerStore?.name ?? "",
    shopAddress: ownerStore?.address ?? "",
    itemName: "",
    description: "",
    price: 0,
    imageUrl: "",
    isFreshToday: false,
    isSpecialDeal: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MarketplaceListingInput>(blankForm);
  const [message, setMessage] = useState<string | null>(null);

  const allSorted = useMemo(
    () => [...listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [listings],
  );

  // Show listings that match by storeId (current format) or, for legacy
  // listings that predate the storeId field, fall back to shopName matching.
  const ownedListings = useMemo(
    () =>
      ownerStore
        ? allSorted.filter(
            (l) =>
              l.storeId === ownerStore.id ||
              (!l.storeId && l.shopName === ownerStore.name),
          )
        : [],
    [allSorted, ownerStore],
  );

  const startEdit = useCallback(
    (id: string) => {
      const row = listings.find((l) => l.id === id);
      if (!row) return;
      setEditingId(id);
      setForm({
        shopName: row.shopName,
        shopAddress: row.shopAddress,
        itemName: row.itemName,
        description: row.description,
        price: row.price,
        imageUrl: row.imageUrl,
        isFreshToday: row.isFreshToday,
        isSpecialDeal: row.isSpecialDeal,
      });
      setMessage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [listings],
  );

  const clearForm = useCallback(() => {
    setEditingId(null);
    setForm(blankForm());
    setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerStore]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.shopName.trim() || !form.shopAddress.trim() || !form.itemName.trim()) {
      setMessage("Shop name, address, and item name are required.");
      return;
    }
    const payload: MarketplaceListingInput = {
      ...form,
      storeId: ownerStore?.id,
      shopName: form.shopName.trim(),
      shopAddress: form.shopAddress.trim(),
      itemName: form.itemName.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || PLACEHOLDER_IMAGE,
      price: Math.max(0, Number(form.price) || 0),
    };
    const wasEditing = Boolean(editingId);
    if (editingId) {
      updateListing(editingId, payload);
    } else {
      addListing(payload);
    }
    clearForm();
    setMessage(
      wasEditing
        ? "Listing updated — it appears instantly on the local feed."
        : "Listing published — shoppers see it on the feed right away.",
    );
  };

  // Hard-block: no ownerStore means no verified store for this owner.
  // Showing all listings as a fallback would be a cross-tenant data leak.
  if (!ownerStore) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium text-stone-500">
          No store is linked to your account. Contact support to get set up.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/90">
          GrocerEase · Vendor
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900">
          {ownerStore.name}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Add or edit what&apos;s fresh and what&apos;s on special. Listings are{" "}
          <strong className="font-medium text-stone-800">saved in this browser</strong> (they stay
          after refresh or when you come back). Changes sync to the{" "}
          <Link href="/browse" className="font-semibold text-emerald-800 underline-offset-2 hover:underline">
            public browse feed
          </Link>{" "}
          and other open tabs. No checkout, delivery, or cart.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-900/[0.04]">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {editingId ? "Edit listing" : "Add listing"}
          </h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-stone-100 bg-stone-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Posting for
              </p>
              <p className="mt-0.5 text-sm font-semibold text-stone-900">{ownerStore.name}</p>
              <p className="text-xs text-stone-500">{ownerStore.address}</p>
            </div>
            <label className="block text-sm font-medium text-stone-700">
              Item name
              <input
                required
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-700/15"
                value={form.itemName}
                onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
                placeholder="Baby Bok Choy"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Description
              <textarea
                rows={3}
                className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-700/15"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short note for shoppers (no ordering here)."
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                Price (USD)
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-700/15"
                  value={form.price || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Image URL
                <input
                  type="url"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-700/15"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://…"
                />
              </label>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-stone-100 bg-stone-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  className="size-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  checked={form.isFreshToday}
                  onChange={(e) => setForm((f) => ({ ...f, isFreshToday: e.target.checked }))}
                />
                Mark as Fresh Today
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  className="size-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  checked={form.isSpecialDeal}
                  onChange={(e) => setForm((f) => ({ ...f, isSpecialDeal: e.target.checked }))}
                />
                Mark as Special Deal
              </label>
            </div>
            {message ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-700/15">
                {message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                {editingId ? "Save changes" : "Publish listing"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-900/[0.04]">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            Active inventory
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {ownedListings.length} listing{ownedListings.length !== 1 ? "s" : ""} · same data as{" "}
            <Link href="/browse" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
              /browse
            </Link>
          </p>

          <div className="mt-6 max-h-[520px] overflow-auto rounded-xl border border-stone-100">
            <table className="min-w-full divide-y divide-stone-100 text-left text-sm">
              <thead className="sticky top-0 bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {ownedListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-400">
                      No listings yet — add one above.
                    </td>
                  </tr>
                ) : (
                  ownedListings.map((row) => (
                    <tr key={row.id} className="align-middle hover:bg-stone-50/50">
                      <td className="px-4 py-3">
                        <div className="relative size-12 overflow-hidden rounded-lg bg-stone-100">
                          <ListingPhoto
                            src={row.imageUrl}
                            alt={row.itemName}
                            seed={row.id}
                            variant="thumb"
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-900">{row.itemName}</td>
                      <td className="max-w-[140px] truncate px-4 py-3 text-stone-600">
                        {row.shopName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-emerald-800">
                        {formatPrice(row.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.isFreshToday ? (
                            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-900">
                              Fresh
                            </span>
                          ) : null}
                          {row.isSpecialDeal ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                              Deal
                            </span>
                          ) : null}
                          {!row.isFreshToday && !row.isSpecialDeal ? (
                            <span className="text-stone-400">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(row.id)}
                            className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Remove "${row.itemName}" from the board?`)) {
                                deleteListing(row.id);
                                if (editingId === row.id) clearForm();
                              }
                            }}
                            className="rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
