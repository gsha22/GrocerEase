// Story 3: Discover Nearby Stores — Map View
// Story 12: No auth required
// Story 16: Category filter on map view (reuses /api/stores?category=)
"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import StoreFilterBar, { type FilterKey } from "@/components/StoreFilterBar";

// Leaflet requires window — load only on client
const StoreMap = dynamic(() => import("@/components/StoreMap"), { ssr: false });

type Store = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  distanceMiles: number | null;
};

const PITTSBURGH_CENTER: [number, number] = [40.4406, -79.9959];

export function buildMapStoresApiUrl(
  lat: number | null,
  lng: number | null,
  categories: Set<FilterKey> = new Set(),
): string {
  const params = new URLSearchParams();
  if (lat !== null && lng !== null) {
    params.set("lat", lat.toString());
    params.set("lng", lng.toString());
    params.set("radius", "10");
  }
  if (categories.size > 0) {
    params.set("category", Array.from(categories).join(","));
  }
  return `/api/stores${params.toString() ? `?${params}` : ""}`;
}

export default function MapPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [center, setCenter] = useState<[number, number]>(PITTSBURGH_CENTER);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());

  const loadStores = useCallback(
    async (
      lat: number | null,
      lng: number | null,
      filters: Set<FilterKey>,
    ) => {
      setLoading(true);
      try {
        const res = await fetch(buildMapStoresApiUrl(lat, lng, filters));
        const data = await res.json();
        setStores(data);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCoords(loc);
          setCenter([loc.lat, loc.lng]);
          loadStores(loc.lat, loc.lng, activeFilters);
        },
        () => loadStores(null, null, activeFilters)
      );
    } else {
      loadStores(null, null, activeFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltersChange(next: Set<FilterKey>) {
    setActiveFilters(next);
    loadStores(coords?.lat ?? null, coords?.lng ?? null, next);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Store Map
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          {loading
            ? "Finding stores near you…"
            : stores.length === 0
              ? activeFilters.size > 0
                ? "No stores match the selected filters."
                : "No stores within 10 miles."
              : `${stores.length} store${stores.length === 1 ? "" : "s"} within 10 miles`}
        </p>
      </div>

      {/* Category filters — Story 16 */}
      <StoreFilterBar active={activeFilters} onChange={handleFiltersChange} />

      {/* View toggle */}
      <div className="flex border border-gray-200 rounded-md overflow-hidden w-fit mb-5">
        <Link
          href="/"
          className="px-4 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          List
        </Link>
        <Link
          href="/map"
          className="px-4 py-1.5 text-[13px] font-medium bg-green-600 text-white"
        >
          Map
        </Link>
      </div>

      {/* Map */}
      <div className="w-full h-[500px] rounded-2xl border border-gray-200 overflow-hidden mb-6">
        {loading ? (
          <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-[14px]">
            Loading map…
          </div>
        ) : (
          <StoreMap stores={stores} center={center} />
        )}
      </div>

      {/* Store list below map */}
      {stores.length > 0 && (
        <div className="space-y-2">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="flex items-center gap-4 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
            >
              <div className="text-2xl w-11 h-11 rounded-md bg-green-50 flex items-center justify-center shrink-0">
                🏪
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[15px]">{store.name}</div>
                <div className="text-[12px] text-gray-400 mt-0.5 truncate">
                  {store.address}
                </div>
                {store.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {store.categories.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {store.distanceMiles !== null && (
                <span className="text-[13px] text-green-600 font-medium shrink-0">
                  {store.distanceMiles} mi
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
