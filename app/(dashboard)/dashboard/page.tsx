import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function addressShortLine(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }
  return address;
}

export default async function DashboardPage() {
  const session = await auth();
  const ownerId = session?.user?.id;

  const store = ownerId
    ? await prisma.store.findUnique({
        where: { ownerId },
        select: { name: true, address: true },
      })
    : null;

  const subtitle = store
    ? addressShortLine(store.address)
    : "Add your store profile to reach shoppers";

  return (
    <div className="max-w-[1100px]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
            {store?.name ?? "Your dashboard"}
          </h1>
          <p className="text-[15px] text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/deals"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors text-center"
          >
            + New deal
          </Link>
          <Link
            href="/dashboard/posts"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors text-center"
          >
            + Fresh update
          </Link>
        </div>
      </div>

      {!store && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-950">
          <span className="font-medium">No store on file yet.</span>{" "}
          <Link
            href="/dashboard/profile"
            className="text-green-700 font-medium underline-offset-2 hover:underline"
          >
            Complete your store profile
          </Link>{" "}
          to publish listings.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Profile views", value: "—", change: "No data yet" },
          { label: "Active posts", value: "0", change: "Post to get started" },
          { label: "Active deals", value: "0", change: "Create a deal" },
          { label: "Item searches", value: "—", change: "No data yet" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="text-[12px] text-gray-400 font-medium uppercase tracking-wider mb-1.5">
              {stat.label}
            </div>
            <div className="font-display text-[28px] font-medium text-gray-800">
              {stat.value}
            </div>
            <div className="text-[12px] text-gray-400 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-semibold text-gray-800">
            Recent updates
          </h2>
          <Link
            href="/dashboard/posts"
            className="text-[13px] text-green-600 font-medium hover:text-green-800"
          >
            Manage all →
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="text-[52px] mb-4">📝</div>
          <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
            No posts yet
          </h3>
          <p className="text-[14px] text-gray-400 max-w-[300px] mx-auto mb-4">
            Share what&apos;s fresh today so nearby shoppers choose your store.
          </p>
          <Link
            href="/dashboard/posts"
            className="inline-flex px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors"
          >
            Post an update
          </Link>
        </div>
      </div>
    </div>
  );
}
