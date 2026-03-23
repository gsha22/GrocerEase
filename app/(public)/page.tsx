// Story 3: Discover Nearby Stores (geolocation, distance sorting, neighborhood fallback)
// Story 4: Filter Stores by Specialty (filter bar, AND logic)
// Story 12: Browse Without Account — no auth required
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PITTSBURGH_NEIGHBORHOODS,
  extractNeighborhood,
} from "@/lib/neighborhoods";
import StoreFilterBar, { type FilterKey } from "@/components/StoreFilterBar";
import StoreCard, { type StoreData } from "@/components/StoreCard";

export default function HomePage() {
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
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Guest banner — Story 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5 mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">
            Discover your neighborhood&apos;s best grocers
          </h3>
          <p className="text-[13px] text-gray-600 mt-1">
            Browse stores and deals without signing up. Create an account to set
            stock alerts.
          </p>
        </div>
        <Link
          href="/login"
          className="shrink-0 px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          Sign up for alerts &rarr;
        </Link>
      </div>

      {/* Manual neighborhood fallback — Story 3 */}
      {geoFailed && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-[13px] text-amber-800 font-medium mb-2">
            📍 We couldn&apos;t detect your location. Select your neighborhood:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PITTSBURGH_NEIGHBORHOODS).map((name) => (
              <button
                key={name}
                onClick={() => selectNeighborhood(name)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-amber-200 bg-white text-gray-700 hover:bg-amber-100 hover:border-amber-400 transition-colors cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Stores near you
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          {stores.length > 0
            ? `Showing ${stores.length} store${stores.length !== 1 ? "s" : ""} within 10 miles of ${locationLabel}`
            : loading
              ? `Searching near ${locationLabel}…`
              : "No stores found nearby"}
        </p>
      </div>

      {/* View toggle — Story 3 */}
      <div className="flex border border-gray-200 rounded-md overflow-hidden w-fit mb-5">
        <Link
          href="/"
          className="px-4 py-1.5 text-[13px] font-medium bg-green-600 text-white"
        >
          List
        </Link>
        <Link
          href="/map"
          className="px-4 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Map
        </Link>
      </div>

      {/* Filter chips — Story 4 */}
      <StoreFilterBar active={activeFilters} onChange={handleFilterChange} />

      {/* Store grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
              <div className="h-[140px] w-full bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-5 w-3/5 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-2/5 bg-gray-100 rounded animate-pulse mb-3" />
                <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-[52px] mb-4">🗺</div>
          <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
            No stores found
          </h3>
          <p className="text-[14px] text-gray-400 max-w-[300px] mx-auto">
            {activeFilters.size > 0
              ? "No stores match your filters. Try removing some filters."
              : "We don't have any registered stores in this area yet. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
