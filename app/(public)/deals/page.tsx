// TODO: Story 2 (Deals This Week — Shopper)

export default function DealsPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Deals this week
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Active promotions at local stores — sorted by expiry date
        </p>
      </div>

      <div className="text-[13px] text-green-600 font-medium mb-4">
        3 active deals &middot; 2 stores
      </div>

      {/* Deal cards */}
      {[
        {
          emoji: "🥩",
          title: "30% off fresh lamb cuts",
          store: "Store Name · 0.4 mi",
          expiry: "Expires Thursday, Mar 20",
          urgent: true,
        },
        {
          emoji: "🍜",
          title: "Shin Ramen — buy 3 get 1 free",
          store: "Store Name · 1.2 mi",
          expiry: "Expires Friday, Mar 21",
          urgent: false,
        },
        {
          emoji: "🥕",
          title: "Organic produce bundle — $12 value for $8",
          store: "Store Name · 2.1 mi",
          expiry: "Expires Saturday, Mar 22",
          urgent: false,
        },
      ].map((deal, i) => (
        <div
          key={i}
          className="flex gap-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-100 mb-3"
        >
          <span className="text-[22px]">{deal.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="font-semibold text-[15px] text-gray-800">
                {deal.title}
              </div>
              {deal.urgent && (
                <span className="bg-red-50 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Ends Thu
                </span>
              )}
            </div>
            <div className="text-[13px] text-gray-600 mt-0.5">
              {deal.store}
            </div>
            <div className="text-[12px] text-amber-400 font-medium mt-1">
              {deal.expiry}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
