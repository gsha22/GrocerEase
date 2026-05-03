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
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop",
  halal:
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1200&q=80&auto=format&fit=crop",
  organic:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop",
  produce:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80&auto=format&fit=crop",
  ebt:
    "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=1200&q=80&auto=format&fit=crop",
};

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588964895597-cfccd6bf2d18?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606787366850-de63301240b52?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490818387543-1baba5e638af?w=1200&q=80&auto=format&fit=crop",
];

function hashIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return modulo > 0 ? h % modulo : 0;
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
