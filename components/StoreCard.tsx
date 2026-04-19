"use client";

import Image from "next/image";
import Link from "next/link";
import { getStoreCoverImageUrl } from "@/lib/store-hero-images";

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

const CATEGORY_EMOJI: Record<string, string> = {
  asian: "\u{1F962}",
  halal: "\u262A",
  organic: "\u{1F33F}",
  produce: "\u{1F966}",
  ebt: "\u{1F4B3}",
};

export function heroEmoji(categories: string[]): string {
  for (const cat of categories) {
    const emoji = CATEGORY_EMOJI[cat.toLowerCase()];
    if (emoji) return emoji;
  }
  return "\u{1F6D2}";
}

interface StoreCardProps {
  store: StoreData;
  neighborhood?: string;
}

export default function StoreCard({ store, neighborhood }: StoreCardProps) {
  const coverSrc = getStoreCoverImageUrl(store.id, store.categories);
  const emoji = heroEmoji(store.categories);

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-4px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-[0_12px_40px_-8px_rgba(15,23,42,0.15)] active:translate-y-0 active:scale-[0.99]"
    >
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
      </div>
    </Link>
  );
}
