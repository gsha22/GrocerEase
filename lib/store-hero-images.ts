/**
 * Curated Unsplash storefront imagery — deterministic per store for list + profile.
 */

// Per-store photos uploaded to public/store-photos/. Keyed by store ID.
// Only populated for stores that have a real photo; all others fall through to
// the category-based Unsplash covers below.
const STORE_PHOTO: Record<string, string> = {
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1": "/store-photos/lotus.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2": "/store-photos/crescenthalal.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3": "/store-photos/threerivers.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4": "/store-photos/tokyo.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5": "/store-photos/riverhalal.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6": "/store-photos/eastend.jpg",
};

const CATEGORY_COVER: Record<string, string> = {
  asian:
    "https://images.unsplash.com/photo-1562802378-063ec186a863?w=1200&q=80&auto=format&fit=crop",
  halal:
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80&auto=format&fit=crop",
  organic:
    "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1200&q=80&auto=format&fit=crop",
  produce:
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&q=80&auto=format&fit=crop",
  ebt:
    "https://images.unsplash.com/photo-1543168256-418811576931?w=1200&q=80&auto=format&fit=crop",
};

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=1200&q=80&auto=format&fit=crop",
];

function hashIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return modulo > 0 ? h % modulo : 0;
}

const CATEGORY_EMOJI: Record<string, string> = {
  asian: "\u{1F962}",
  halal: "☪",
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

export function getStoreCoverImageUrl(storeId: string, categories: string[]): string {
  const local = STORE_PHOTO[storeId];
  if (local) return local;

  for (const c of categories) {
    const url = CATEGORY_COVER[c.toLowerCase()];
    if (url) return url;
  }
  return FALLBACK_COVERS[hashIndex(storeId, FALLBACK_COVERS.length)] ?? FALLBACK_COVERS[0];
}
