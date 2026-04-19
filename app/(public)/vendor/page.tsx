import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import VendorDashboardClient from "@/components/marketplace/VendorDashboardClient";

export const metadata: Metadata = {
  title: "Vendor dashboard",
  description:
    "Post fresh inventory and specials for your grocery store on GrocerEase. Listings appear instantly on the public feed.",
};

function VendorFallback() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-stone-500">
      <p className="animate-pulse text-sm font-medium">Loading vendor tools…</p>
    </div>
  );
}

export default async function VendorPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/vendor");
  }
  if (session.role === "shopper") {
    redirect("/shopper/account?notice=owner-only");
  }

  return (
    <Suspense fallback={<VendorFallback />}>
      <VendorDashboardClient />
    </Suspense>
  );
}
