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

  const storeSelect = { id: true, name: true, address: true } as const;

  // Fast path: verify the JWT storeId belongs to this owner.
  // Fallback to ownerId when storeId is absent or stale — ownerId is
  // @unique on Store so findUnique is deterministic (one store per owner).
  const ownerStore =
    (session.storeId
      ? await prisma.store.findFirst({
          where: { id: session.storeId, ownerId: session.user.id },
          select: storeSelect,
        })
      : null) ??
    (await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      select: storeSelect,
    }));

  return (
    <Suspense fallback={<VendorFallback />}>
      <VendorDashboardClient ownerStore={ownerStore} />
    </Suspense>
  );
}
