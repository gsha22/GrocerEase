// Story 3: Discover Nearby Stores (geolocation, distance sorting, neighborhood fallback)
// Story 4: Filter Stores by Specialty (filter bar, AND logic)
// Story 12: Browse Without Account — no auth required
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  PITTSBURGH_NEIGHBORHOODS,
  extractNeighborhood,
} from "@/lib/neighborhoods";
import StoreFilterBar, { type FilterKey } from "@/components/StoreFilterBar";
import StoreCard, { type StoreData } from "@/components/StoreCard";

export default function HomePage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [locationLabel, setLocationLabel] = useState("Pittsburgh");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoFailed, setGeoFailed] = useState(false);

  const fetchStores = useCallback(
    async (filters: Set<FilterKey>, loc: { lat: number; lng: number } | null) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (loc) {
        params.set("lat", loc.lat.toString());
        params.set("lng", loc.lng.toString());
        params.set("radius", "10");
      }
      if (filters.size > 0) {
        params.set("category", Array.from(filters).join(","));
      }
      try {
        const res = await fetch(`/api/stores?${params.toString()}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setStores(data);
      } catch (err) {
        console.error("Failed to load stores:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(loc);
          setLocationLabel("your location");
          fetchStores(activeFilters, loc);
        },
        () => {
          setGeoFailed(true);
          fetchStores(activeFilters, null);
        }
      );
    } else {
      setGeoFailed(true);
      fetchStores(activeFilters, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectNeighborhood(name: string) {
    const loc = PITTSBURGH_NEIGHBORHOODS[name];
    if (!loc) return;
    setCoords(loc);
    setLocationLabel(name);
    setGeoFailed(false);
    fetchStores(activeFilters, loc);
  }

  function handleFilterChange(next: Set<FilterKey>) {
    setActiveFilters(next);
    fetchStores(next, coords);
  }

  return (
    <div className="relative mx-auto max-w-[1100px] px-4 pb-6 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
      {/* Ambient decoration */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-700/[0.03] blur-3xl sm:-left-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-lime-300/[0.06] blur-3xl"
        aria-hidden
      />

      {/* Hero — single primary CTA; sign-in lives in nav */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-100/80 bg-white p-6 shadow-[0_18px_50px_-12px_rgba(15,23,42,0.12)] ring-1 ring-stone-900/[0.04] sm:p-8">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-emerald-700/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800/80">
              Pittsburgh · Local first
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.75rem]">
              Discover what&apos;s fresh nearby
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-stone-600 sm:text-[15px]">
              Browse real neighborhood grocers, see deals, and check the{" "}
              <Link
                href="/browse"
                className="font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-2 transition hover:decoration-emerald-800"
              >
                live feed
              </Link>{" "}
              — discovery only, no checkout.{" "}
              {isAuthenticated ? (
                <>
                  Check your{" "}
                  <Link
                    href="/my-alerts"
                    className="font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-2 transition hover:decoration-emerald-800"
                  >
                    saved shops and alerts
                  </Link>{" "}
                  from the header.
                </>
              ) : (
                <>
                  Want alerts?{" "}
                  <Link
                    href="/sign-in"
                    className="font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-2 transition hover:decoration-emerald-800"
                  >
                    Sign in
                  </Link>{" "}
                  from the header.
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col">
            <Link
              href="/browse"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-800 px-8 text-[15px] font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 hover:shadow-xl active:scale-[0.98]"
            >
              Open local feed
            </Link>
            <Link
              href="/map"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 text-[14px] font-semibold text-stone-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/60 active:scale-[0.98]"
            >
              Open map view
            </Link>
          </div>
        </div>
      </div>

      {geoFailed && (
        <div className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
          <p className="text-[13px] font-semibold text-amber-950">
            We couldn&apos;t detect your location. Pick a neighborhood:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(PITTSBURGH_NEIGHBORHOODS).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => selectNeighborhood(name)}
                className="rounded-full border border-amber-200/90 bg-white px-3.5 py-2 text-[12px] font-semibold text-emerald-950 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 active:scale-[0.98]"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400">
            Explore
          </p>
          <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-stone-900 sm:text-[2rem]">
            Stores near you
          </h1>
          <p className="mt-1 text-[14px] text-stone-500 sm:text-[15px]">
            {stores.length > 0
              ? `${stores.length} store${stores.length !== 1 ? "s" : ""} within 10 miles of ${locationLabel}`
              : loading
                ? `Searching near ${locationLabel}…`
                : "No stores match your filters"}
          </p>
        </div>

        <div className="inline-flex rounded-2xl border border-stone-200/90 bg-stone-100/80 p-1 shadow-inner">
          <span className="rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-emerald-900 shadow-sm">
            List
          </span>
          <Link
            href="/map"
            className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-stone-600 transition hover:bg-white/80 hover:text-stone-900"
          >
            Map
          </Link>
        </div>
      </div>

      <StoreFilterBar active={activeFilters} onChange={handleFilterChange} />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"
            >
              <div className="h-[152px] w-full animate-pulse bg-gradient-to-br from-stone-100 to-stone-200/80" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 rounded-md bg-stone-100" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
                <div className="flex gap-2">
                  <div className="h-5 w-14 rounded-full bg-stone-100" />
                  <div className="h-5 w-14 rounded-full bg-stone-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white/80 px-6 py-16 text-center shadow-inner">
          <div className="text-[48px] leading-none">🗺</div>
          <h3 className="mt-4 font-display text-xl font-semibold text-stone-900">
            No stores here yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-stone-500">
            {activeFilters.size > 0
              ? "Try clearing a specialty filter or widen your search on the map."
              : "We don&apos;t have listings in this area. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              neighborhood={extractNeighborhood(store.address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
