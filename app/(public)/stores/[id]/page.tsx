// TODO: Story 1 (Fresh Today — Shopper), Story 2 (Deals This Week — Shopper)

export default function StoreProfilePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-5">
        <a href="/" className="text-green-600 hover:underline">
          Discover Stores
        </a>
        <span className="text-gray-200">›</span>
        <span>Store Name</span>
      </div>

      {/* Profile hero */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start gap-6 mb-6">
        <div className="text-[56px] w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 border-2 border-green-100">
          🥬
        </div>
        <div>
          <h1 className="font-display text-[26px] font-semibold text-gray-800">
            Store Name
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">
            📍 123 Example St, Pittsburgh, PA &middot; 0.4 mi away
          </p>
          <div className="flex gap-2 items-center mt-2 text-[13px]">
            <span className="text-green-600 font-medium">Open now</span>
            <span className="text-gray-400">&middot; Closes 8 PM</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Halal", "Middle Eastern", "EBT Accepted"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fresh Today section — Story 1 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🌿 Fresh Today
        </h2>
        {[
          { name: "Item Name", note: "Brief description of the item", time: "posted 1h ago" },
          { name: "Item Name", note: "Brief description of the item", time: "posted 2h ago" },
          { name: "Item Name", note: "Brief description of the item", time: "posted 5h ago" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <div className="font-medium text-[15px]">{item.name}</div>
              <div className="text-[13px] text-gray-400 mt-0.5">{item.note}</div>
            </div>
            <span className="text-[12px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2 shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* Deals This Week — Story 2 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
          🏷 Deals This Week
        </h2>
        {[
          { emoji: "🥩", title: "30% off placeholder item", desc: "Deal description", expiry: "Expires Saturday" },
          { emoji: "🍅", title: "Buy 2, get 1 free — placeholder", desc: "Deal description", expiry: "Expires Thursday" },
        ].map((deal, i) => (
          <div
            key={i}
            className="flex gap-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-100 mb-2.5 last:mb-0"
          >
            <span className="text-[22px]">{deal.emoji}</span>
            <div>
              <div className="font-semibold text-[15px] text-gray-800">
                {deal.title}
              </div>
              <div className="text-[13px] text-gray-600 mt-0.5">
                {deal.desc}
              </div>
              <div className="text-[12px] text-amber-400 font-medium mt-1">
                {deal.expiry}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
