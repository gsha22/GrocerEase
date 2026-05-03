"use client";

import Link from "next/link";
import ListingPhoto from "@/components/marketplace/ListingPhoto";
import { useMemo, useState } from "react";
import { mapsSearchUrl } from "@/lib/marketplace/maps";
import { useMarketplaceStore } from "@/stores/marketplace-store";

type Filter = "all" | "fresh" | "deal";

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "all", label: "All", hint: "Everything nearby" },
  { id: "fresh", label: "Fresh today", hint: "Just posted in stock" },
  { id: "deal", label: "Special deals", hint: "Promos worth a stop" },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

type Props = {
  /** Only store owner sessions may open the vendor dashboard for this feed */
  showVendorDashboardLink?: boolean;
  isShopper?: boolean;
};

export default function MarketplaceBrowseClient({
  showVendorDashboardLink = false,
  isShopper = false,
}: Props) {
  const listings = useMarketplaceStore((s) => s.listings);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "fresh") return listings.filter((l) => l.isFreshToday);
    if (filter === "deal") return listings.filter((l) => l.isSpecialDeal);
    return listings;
  }, [listings, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/90">
          GrocerEase · Local feed
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          What&apos;s on shelves near you
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Browse fresh listings and specials from neighborhood grocers. This is a{" "}
          <strong className="font-medium text-stone-800">discovery board</strong> only — visit
          the store in person. No cart, no checkout.
          {showVendorDashboardLink
            ? " If you keep this feed open in one tab and the vendor dashboard in another, updates sync automatically."
            : null}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          {showVendorDashboardLink ? (
            <Link
              href="/vendor"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/60"
            >
              Vendor dashboard →
            </Link>
          ) : (
            <p className="max-w-md text-left text-[13px] leading-relaxed text-stone-500">
              {isShopper
                ? "Posting to this feed is for store owner accounts. Neighbor accounts browse only."
                : "Posting to this feed is limited to signed-in store owners."}
            </p>
          )}
          <Link
            href="/"
            className="text-sm font-medium text-emerald-800 underline-offset-4 hover:underline"
          >
            Registered stores (map &amp; search)
          </Link>
        </div>
      </header>

      <div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        role="toolbar"
        aria-label="Filter listings"
      >
        <p className="text-sm text-stone-500">
          Showing{" "}
          <span className="font-semibold text-stone-800">{visible.length}</span> listing{visible.length !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              title={chip.hint}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === chip.id
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/15"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-emerald-400/60 hover:bg-emerald-50/50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white/80 px-6 py-16 text-center">
          <p className="text-lg font-medium text-stone-800">Nothing in this view yet</p>
          <p className="mt-2 text-sm text-stone-500">
            Try another filter, or ask a shop owner to add listings.
          </p>
          {showVendorDashboardLink ? (
            <Link
              href="/vendor"
              className="mt-6 inline-flex rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Open vendor dashboard
            </Link>
          ) : (
            <p className="mt-4 text-sm text-stone-500">
              {isShopper
                ? "Store teams manage this demo feed from the vendor tools when signed in with a business account."
                : (
                    <>
                      Store owners can{" "}
                      <Link
                        href="/sign-in?next=%2Fvendor"
                        className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                      >
                        sign in
                      </Link>{" "}
                      to post listings.
                    </>
                  )}
            </p>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-900/[0.04] transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full bg-stone-100">
                <ListingPhoto
                  src={item.imageUrl}
                  alt={item.itemName}
                  seed={item.id}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {item.isFreshToday ? (
                    <span className="rounded-full bg-lime-100/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-lime-900 ring-1 ring-lime-700/20">
                      Fresh
                    </span>
                  ) : null}
                  {item.isSpecialDeal ? (
                    <span className="rounded-full bg-amber-100/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-700/25">
                      Deal
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {item.shopName}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-stone-900">
                    {item.itemName}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                    {item.description}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-emerald-800">
                  {formatPrice(item.price)}
                </p>
                <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                  <a
                    href={mapsSearchUrl(item.shopAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Get directions
                  </a>
                  <a
                    href={mapsSearchUrl(`${item.shopName} ${item.shopAddress}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm font-semibold text-stone-800 transition hover:bg-white"
                  >
                    Visit store
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
