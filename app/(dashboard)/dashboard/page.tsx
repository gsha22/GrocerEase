// TODO: Story 8 (Post a Deal), Story 9 (Reuse Past Deals), Story 10 (Edit/Delete Post)

export default function DashboardPage() {
  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-[15px] text-gray-600 mt-1">
            Store Name — Neighborhood, PA
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/dashboard/deals"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            + New Deal
          </a>
          <a
            href="/dashboard/posts"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
          >
            + New Post
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Profile Views", value: "—", change: "No data yet" },
          { label: "Active Posts", value: "0", change: "Post to get started" },
          { label: "Active Deals", value: "0", change: "Create a deal" },
          { label: "Item Searches", value: "—", change: "No data yet" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-4"
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

      {/* Recent posts */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-semibold text-gray-800">
            Recent Posts
          </h2>
          <a
            href="/dashboard/posts"
            className="text-[13px] text-green-600 font-medium"
          >
            Manage all &rarr;
          </a>
        </div>

        {/* Empty state */}
        <div className="text-center py-12">
          <div className="text-[52px] mb-4">📝</div>
          <h3 className="text-[18px] font-semibold text-gray-800 mb-2">
            No posts yet
          </h3>
          <p className="text-[14px] text-gray-400 max-w-[300px] mx-auto">
            Start posting fresh updates and deals to attract shoppers to your
            store.
          </p>
        </div>
      </div>
    </div>
  );
}
