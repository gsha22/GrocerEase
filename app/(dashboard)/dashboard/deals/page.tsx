import { auth } from "@/auth";
import OwnerDealExpiryAlerts from "@/components/OwnerDealExpiryAlerts";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ManageDealsClient from "./ManageDealsClient";

export default async function ManageDealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!session.storeId) {
    return (
      <div className="max-w-[700px]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals
        </h1>
        <p className="text-[15px] text-gray-600 mt-4">
          Complete your store profile first, then you can post deals.
        </p>
      </div>
    );
  }

  const alerts = await prisma.ownerNotification.findMany({
    where: {
      ownerId: session.user.id,
      readAt: null,
      kind: "deal_expiring_soon",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-[700px]">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Create promotions shoppers see on your store and the deals feed.
        </p>
      </div>

      <OwnerDealExpiryAlerts
        initial={alerts.map((a) => ({ id: a.id, message: a.message }))}
      />
      <ManageDealsClient storeId={session.storeId} />
    </div>
  );
}
