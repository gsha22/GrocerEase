// Story 3: Discover Nearby Stores (geolocation, distance sorting, neighborhood fallback)
// Story 4: Filter Stores by Specialty (filter bar, AND logic)
// Story 12: Browse Without Account — no auth required
import { auth } from "@/auth";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return <HomePageClient isAuthenticated={isAuthenticated} />;
}
