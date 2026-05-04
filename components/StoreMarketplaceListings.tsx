"use client";

import { useMemo } from "react";
import ListingPhoto from "@/components/marketplace/ListingPhoto";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { mapsSearchUrl } from "@/lib/marketplace/maps";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function StoreMarketplaceListings({ storeId, storeAddress }: { storeId: string; storeAddress: string }) {
  const listings = useMarketplaceStore((s) => s.listings);

  const storeListings = useMemo(
    () => listings.filter((l) => l.storeId === storeId),
    [listings, storeId],
  );

  if (storeListings.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-[17px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
        🛒 On Shelves Now
      </h2>
      <p className="text-[13px] text-gray-400 mb-4">
        Items currently posted by this store — visit in person to purchase.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {storeListings.map((item) => (
          <li
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
          >
            <div className="relative aspect-[4/3] w-full bg-stone-100">
              <ListingPhoto
                src={item.imageUrl}
                alt={item.itemName}
                seed={item.id}
                sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                className="object-cover"
              />
              {(item.isFreshToday || item.isSpecialDeal) && (
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {item.isFreshToday && (
                    <span className="rounded-full bg-lime-100/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime-900 ring-1 ring-lime-700/20">
                      Fresh
                    </span>
                  )}
                  {item.isSpecialDeal && (
                    <span className="rounded-full bg-amber-100/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-700/25">
                      Deal
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="text-[13px] font-semibold text-gray-900 leading-snug">{item.itemName}</p>
              {item.description && (
                <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              <p className="mt-auto pt-1 text-[15px] font-semibold text-emerald-800">
                {formatPrice(item.price)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-gray-400">
        Visit in person —{" "}
        <a
          href={mapsSearchUrl(storeAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          get directions
        </a>
      </p>
    </div>
  );
}
