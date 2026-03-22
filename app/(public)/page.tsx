// Story 3: Discover Nearby Stores
// Story 4: Filter Stores by Specialty (UI wired, API filtering)
// Story 12: Browse Without Account — no auth required
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PITTSBURGH_NEIGHBORHOODS,
  extractNeighborhood,
} from "@/lib/neighborhoods";

type Store = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  hours: { open?: string; close?: string } | null;
  distanceMiles: number | null;
};

const FILTER_OPTIONS = [
  "Asian groceries",
  "Halal",
  "Organic",
  "Produce",
  "EBT Accepted",
];

const FILTER_ICONS: Record<string, string> = {
  "Asian groceries": "🥢",
  Halal: "☪",
  Organic: "🌿",
  Produce: "🥦",
  "EBT Accepted": "💳",
};

const STORE_EMOJIS = ["🥬", "🍜", "🥕", "🫒", "🍣", "🥩"];

export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState("Pittsburgh");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [geoFailed, setGeoFailed] = useState(false);

  const fetchStores = useCallback(
    async (filters: string[], loc: { lat: number; lng: number } | null) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (loc) {
        params.set("lat", loc.lat.toString());
        params.set("lng", loc.lng.toString());
        params.set("radius", "10");
      }
      if (filters.length > 0) {
        params.set("category", filters.join(","));
      }
      const res = await fetch(`/api/stores?${params.toString()}`);
      const data = await res.json();
      setStores(data);
      setLoading(false);
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

  function toggleFilter(filter: string) {
    const next = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];
    setActiveFilters(next);
    fetchStores(next, coords);
  }

  function clearFilters() {
    setActiveFilters([]);
    fetchStores([], coords);
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

      {/* Manual neighborhood fallback */}
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
                className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-amber-200 bg-white text-gray-700 hover:bg-amber-100 hover:border-amber-400 transition-colors"
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
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[13px] text-gray-400 flex items-center pr-1">
          Filter:
        </span>
        {FILTER_OPTIONS.map((label) => (
          <button
            key={label}
            onClick={() => toggleFilter(label)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] border-[1.5px] transition-colors ${
              activeFilters.includes(label)
                ? "bg-green-50 border-green-400 text-green-600 font-medium"
                : "text-gray-600 border-gray-200 bg-white hover:border-green-400 hover:text-green-600"
            }`}
          >
            {FILTER_ICONS[label]} {label}
          </button>
        ))}
        {activeFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="px-3.5 py-1.5 rounded-full text-[13px] border-[1.5px] border-coral-400 text-coral-400 hover:bg-coral-50 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Active filter summary */}
      {activeFilters.length > 0 && (
        <div className="text-[13px] text-green-600 bg-green-50 px-3 py-2 rounded-md mb-4">
          Showing stores matching:{" "}
          <strong>{activeFilters.join(", ")}</strong>
        </div>
      )}

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
            {activeFilters.length > 0
              ? "No stores match your filters. Try removing some filters."
              : "We don't have any registered stores in this area yet. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store, i) => (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-gray-400 transition-all"
            >
              <div className="h-[140px] w-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-5xl relative">
                {STORE_EMOJIS[i % STORE_EMOJIS.length]}
              </div>
              <div className="p-3.5">
                <div className="font-semibold text-[16px] text-gray-800 mb-1">
                  {store.name}
                </div>
                <div className="text-[13px] text-gray-400 mb-2.5 flex gap-3">
                  {store.distanceMiles !== null && (
                    <span>📍 {store.distanceMiles} mi</span>
                  )}
                  <span>{extractNeighborhood(store.address)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {store.categories.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        tag === "EBT Accepted"
                          ? "bg-amber-50 text-amber-800"
                          : tag === "Halal"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-green-50 text-green-800"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
