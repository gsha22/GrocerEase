// Story 3: Discover Nearby Stores — Map View
// Story 12: No auth required
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

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
): string {
  const params = new URLSearchParams();
  if (lat !== null && lng !== null) {
    params.set("lat", lat.toString());
    params.set("lng", lng.toString());
    params.set("radius", "10");
  }
  return `/api/stores${params.toString() ? `?${params}` : ""}`;
}

export default function MapPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [center, setCenter] = useState<[number, number]>(PITTSBURGH_CENTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores(lat: number | null, lng: number | null) {
      const res = await fetch(buildMapStoresApiUrl(lat, lng));
      const data = await res.json();
      setStores(data);
      setLoading(false);
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setCenter(loc);
          loadStores(loc[0], loc[1]);
        },
        () => loadStores(null, null)
      );
    } else {
      loadStores(null, null);
    }
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Store Map
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          {stores.length > 0
            ? `${stores.length} stores within 10 miles`
            : "Finding stores near you…"}
        </p>
      </div>

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
