"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import StoreFilterBar, { type FilterKey } from "./StoreFilterBar";
import StoreCard, { type StoreData } from "./StoreCard";

/** Builds the `/api/stores` URL including optional `category` (AND filters as CSV). */
export function buildStoreDirectoryFetchUrl(activeFilters: Set<FilterKey>): string {
  const params = new URLSearchParams();
  if (activeFilters.size > 0) {
    params.set("category", Array.from(activeFilters).join(","));
  }
  return `/api/stores${params.toString() ? `?${params}` : ""}`;
}

export default function StoreDirectory() {
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isPending, startTransition] = useTransition();
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchStores = useCallback((activeFilters: Set<FilterKey>) => {
    const url = buildStoreDirectoryFetchUrl(activeFilters);

    startTransition(async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const data: StoreData[] = await res.json();
        setStores(data);
      } catch (err) {
        console.error("Failed to load stores:", err);
      } finally {
        setInitialLoad(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchStores(filters);
  }, [filters, fetchStores]);

  function handleFilterChange(next: Set<FilterKey>) {
    setFilters(next);
  }

  return (
    <>
      <StoreFilterBar active={filters} onChange={handleFilterChange} />

      {initialLoad ? (
        <div className="text-center py-16 text-gray-400 text-[14px]">
          Loading stores&hellip;
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-[15px]">
            {filters.size > 0
              ? "No stores match the selected filters."
              : "No stores found."}
          </p>
          {filters.size > 0 && (
            <button
              onClick={() => setFilters(new Set())}
              className="mt-3 text-[13px] text-green-600 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {isPending && (
            <div className="text-[12px] text-gray-400 mb-2">Updating&hellip;</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
          <p className="text-[12px] text-gray-400 mt-4">
            {stores.length} store{stores.length !== 1 && "s"} found
            {filters.size > 0 && ` matching ${filters.size} filter${filters.size !== 1 ? "s" : ""}`}
          </p>
        </>
      )}
    </>
  );
}
