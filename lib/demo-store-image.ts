/**
 * Demo-only: maps seeded store ids (see prisma/fixtures.ts) to files under public/images/stores/.
 * Unknown ids return null so the UI keeps the emoji fallback.
 */
const DEMO_STORE_IMAGES: Record<string, string> = {
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1": "/images/stores/lotus.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2": "/images/stores/crescenthalal.jpeg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3": "/images/stores/threerivers.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4": "/images/stores/tokyo.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5": "/images/stores/riverhalal.jpg",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6": "/images/stores/eastend.jpg",
};

export function demoStoreImageSrc(storeId: string): string | null {
  return DEMO_STORE_IMAGES[storeId] ?? null;
}
