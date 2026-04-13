/** Public URLs for demo store photos in `public/stores/` (keyed by seeded store id). */
export const STORE_HERO_IMAGE_BY_ID: Readonly<Record<string, string>> = {
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1": "/stores/lotus.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2": "/stores/crescenthalal.jpeg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3": "/stores/threerivers.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4": "/stores/tokyo.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5": "/stores/riverhalal.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6": "/stores/eastend.jpg",
};

export function storeHeroImageSrc(storeId: string): string | null {
  return STORE_HERO_IMAGE_BY_ID[storeId] ?? null;
}
