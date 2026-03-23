import { prisma } from "@/lib/prisma";
import DealCard from "@/components/DealCard";

export default async function DealsPage() {
  const now = new Date();

  const deals = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      isExpired: false,
      expiresAt: { gt: now },
      store: { isPublished: true },
    },
    orderBy: { expiresAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      expiresAt: true,
      store: {
        select: { id: true, name: true },
      },
    },
  });

  const storeIds = new Set(deals.map((d) => d.store.id));

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals this week
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Active promotions at local stores &mdash; sorted by expiry date
        </p>
      </div>

      {deals.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="text-[13px] text-green-600 font-medium mb-4">
            {deals.length} active deal{deals.length !== 1 && "s"} &middot;{" "}
            {storeIds.size} store{storeIds.size !== 1 && "s"}
          </div>

          {deals.map((deal) => (
            <a key={deal.id} href={`/stores/${deal.store.id}`} className="block">
              <DealCard
                deal={{
                  id: deal.id,
                  title: deal.title,
                  description: deal.description,
                  expiresAt: deal.expiresAt.toISOString(),
                  storeName: deal.store.name,
                }}
                showStore
              />
            </a>
          ))}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-5">
      <div className="text-[52px] mb-4">🏷</div>
      <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
        No deals right now
      </h3>
      <p className="text-[14px] text-gray-400 max-w-[300px] mx-auto">
        Stores haven&apos;t posted any deals this week. Check back Monday
        &mdash; stores typically update their promotions then.
      </p>
    </div>
  );
}
