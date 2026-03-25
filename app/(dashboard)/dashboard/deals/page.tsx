// TODO: Story 8 (Post a Deal with Expiry), Story 9 (Reuse Past Deals)

export default function ManageDealsPage() {
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

      {/* New deal form — Story 8 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">
          Post a deal
        </h2>
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Deal title *
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. 30% off fresh lamb cuts"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Description
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="Any conditions or details"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Expiry date *
          </label>
          <input
            type="date"
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
          />
        </div>
        <p className="text-[12px] text-gray-400 mb-4">
          Deals auto-hide when they expire — no cleanup needed.
        </p>
        <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors">
          Post deal
        </button>
      </div>

      {/* Existing deals */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800">
          Your deals
        </h2>
        <span className="text-[13px] text-gray-400">
          Reuse past deals to save time
        </span>
      </div>

      {/* Placeholder deal rows */}
      {[
        {
          icon: "🏷",
          title: "30% off fresh lamb cuts",
          meta: "Deal · Expires Thu Mar 20",
          active: true,
        },
        {
          icon: "🍅",
          title: "Buy 2 get 1 canned tomatoes",
          meta: "Deal · Expired Mar 14 — hidden from shoppers",
          active: false,
        },
      ].map((deal, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl mb-2 transition-colors shadow-sm ${
            deal.active ? "hover:border-gray-400" : "opacity-50"
          }`}
        >
          <div className="text-2xl w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
            {deal.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`font-medium text-[15px] truncate ${
                !deal.active ? "line-through" : ""
              }`}
            >
              {deal.title}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5">{deal.meta}</div>
          </div>
          {deal.active && (
            <div className="flex gap-1.5 shrink-0">
              <button className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600">
                Edit
              </button>
              <button className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-colors text-gray-600">
                Delete
              </button>
            </div>
          )}
          {!deal.active && (
            <button className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors text-gray-600 shrink-0">
              Reuse
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
