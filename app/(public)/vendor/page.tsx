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

  // Prefer the storeId already in the JWT (fast path), but fall back to
  // an ownerId lookup so owners with a missing or stale storeId in their
  // token are not incorrectly locked out.
  const ownerStore = await prisma.store.findFirst({
    where: session.storeId
      ? { id: session.storeId, ownerId: session.user.id }
      : { ownerId: session.user.id },
    select: { id: true, name: true, address: true },
  });

  return (
    <Suspense fallback={<VendorFallback />}>
      <VendorDashboardClient ownerStore={ownerStore} />
    </Suspense>
  );
}
