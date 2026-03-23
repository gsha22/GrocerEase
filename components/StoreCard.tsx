import Link from "next/link";

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

function heroEmoji(categories: string[]): string {
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
  return (
    <Link
      href={`/stores/${store.id}`}
      className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-gray-400 transition-all"
    >
      <div className="h-[140px] w-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-5xl">
        {heroEmoji(store.categories)}
      </div>
      <div className="p-3.5">
        <div className="font-semibold text-[16px] text-gray-800 mb-1">
          {store.name}
        </div>
        <div className="text-[13px] text-gray-400 mb-2.5 flex gap-3">
          {store.distanceMiles != null && (
            <span>📍 {store.distanceMiles} mi</span>
          )}
          <span>{neighborhood ?? store.address}</span>
        </div>
        {store.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {store.categories.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-medium capitalize"
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
