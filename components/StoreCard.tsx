"use client";

import Image from "next/image";
import Link from "next/link";
import { getStoreCoverImageUrl, heroEmoji } from "@/lib/store-hero-images";

export { heroEmoji } from "@/lib/store-hero-images";

export interface StoreData {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  categories: string[];
  hours: unknown;
  distanceMiles?: number | null;
}

interface StoreCardProps {
  store: StoreData;
  neighborhood?: string;
}

export default function StoreCard({ store, neighborhood }: StoreCardProps) {
  const coverSrc = getStoreCoverImageUrl(store.id, store.categories);
  const emoji = heroEmoji(store.categories);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-4px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-[0_12px_40px_-8px_rgba(15,23,42,0.15)] active:translate-y-0 active:scale-[0.99]">
      <div className="relative h-[152px] w-full overflow-hidden bg-stone-200">
        <Image
          src={coverSrc}
          alt=""
          fill
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-900/65 via-stone-900/10 to-transparent"
          aria-hidden
        />
        <span className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-xl border border-white/35 bg-white/92 text-[22px] shadow-md backdrop-blur-[2px]">
          {emoji}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-display text-[17px] font-semibold leading-snug text-stone-900 group-hover:text-emerald-900">
          {store.name}
        </h2>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] text-stone-500">
          {store.distanceMiles != null && (
            <span className="font-semibold text-emerald-800 tabular-nums">
              {store.distanceMiles} mi
            </span>
          )}
          <span className="line-clamp-2">{neighborhood ?? store.address}</span>
        </p>
        {store.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {store.categories.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-emerald-900 ring-1 ring-emerald-800/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-center text-[13px] font-semibold text-stone-700 transition hover:bg-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            Get Directions
          </a>
          <Link
            href={`/stores/${store.id}`}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-[13px] font-semibold text-white transition hover:bg-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Store
          </Link>
        </div>
      </div>
    </div>
  );
}
