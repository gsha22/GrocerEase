import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import MarketplaceBrowseClient from "@/components/marketplace/MarketplaceBrowseClient";

export const metadata: Metadata = {
  title: "Local feed",
  description:
    "Browse fresh inventory and specials from neighborhood grocers on GrocerEase — discovery only, no checkout.",
};

function BrowseFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-stone-500">
      <p className="animate-pulse text-sm font-medium">Loading local feed…</p>
    </div>
  );
}

export default async function BrowsePage() {
  const session = await auth();
  const showVendorDashboardLink = session?.role === "owner";
  const isShopper = session?.role === "shopper";

  return (
    <Suspense fallback={<BrowseFallback />}>
      <MarketplaceBrowseClient
        showVendorDashboardLink={showVendorDashboardLink}
        isShopper={isShopper}
      />
    </Suspense>
  );
}
