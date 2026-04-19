// Story 17: Owner view of shopper-submitted reports for their own store.
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  out_of_stock: "Out of stock",
  incorrect_hours: "Hours wrong",
  wrong_price: "Price wrong",
  other: "Other",
};

function formatReportTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function DashboardReportsPage() {
  const session = await auth();
  const ownerId = session?.user?.id;

  const store = ownerId
    ? await prisma.store.findUnique({
        where: { ownerId },
        select: { id: true, name: true },
      })
    : null;

  if (!store) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-2xl font-semibold text-gray-800">
          Reports
        </h1>
        <p className="mt-4 text-[14px] text-gray-500">
          Create a store profile first to start receiving shopper reports.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-4 inline-block text-emerald-800 font-medium hover:underline"
        >
          Go to store profile →
        </Link>
      </div>
    );
  }

  const reports = await prisma.storeReport.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      comment: true,
      createdAt: true,
    },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-800">
          Reports
        </h1>
        <p className="mt-1 text-[14px] text-gray-500">
          Shoppers have flagged these about <strong>{store.name}</strong>. Use
          them as hints — they are anonymous.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-[15px] font-medium text-gray-700">No reports yet</p>
          <p className="mt-2 text-[13px] text-gray-500">
            When a shopper reports incorrect info for your store, it will appear
            here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-semibold text-emerald-900">
                  {TYPE_LABELS[r.type] ?? r.type}
                </span>
                <span className="text-[12px] text-gray-400 shrink-0">
                  {formatReportTime(r.createdAt)}
                </span>
              </div>
              {r.comment ? (
                <p className="mt-2 text-[14px] text-gray-700 leading-relaxed">
                  {r.comment}
                </p>
              ) : (
                <p className="mt-2 text-[13px] text-gray-400 italic">
                  No additional comment.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
