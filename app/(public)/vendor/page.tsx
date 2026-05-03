import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  // Verify the store belongs to this owner — prevents a tampered storeId
  // in the JWT from granting access to another owner's store.
  const ownerStore = session.storeId
    ? await prisma.store.findFirst({
        where: { id: session.storeId, ownerId: session.user.id },
        select: { id: true, name: true, address: true },
      })
    : null;

  return (
    <Suspense fallback={<VendorFallback />}>
      <VendorDashboardClient ownerStore={ownerStore} />
    </Suspense>
  );
}
