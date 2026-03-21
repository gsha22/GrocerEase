// TODO: Story 3 (Discover Nearby Stores), Story 4 (Filter by Specialty), Story 12 (Browse Without Account)

export default function HomePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Guest banner — Story 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5 mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">
            Discover your neighborhood&apos;s best grocers
          </h3>
          <p className="text-[13px] text-gray-600 mt-1">
            Browse stores and deals without signing up. Create an account to set
            stock alerts.
          </p>
        </div>
        <a
          href="/login"
          className="shrink-0 px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          Sign up for alerts &rarr;
        </a>
      </div>

      {/* Page header */}
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Stores near you
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Showing stores within 10 miles
        </p>
      </div>

      {/* Map / List toggle — Story 3 */}
      <div className="flex border border-gray-200 rounded-md overflow-hidden w-fit mb-5">
        <button className="px-4 py-1.5 text-[13px] font-medium bg-green-600 text-white">
          List
        </button>
        <button className="px-4 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          Map
        </button>
      </div>

      {/* Filter chips — Story 4 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-[13px] text-gray-400 flex items-center pr-1">
          Filter:
        </span>
        {["🥢 Asian groceries", "☪ Halal", "🌿 Organic", "🥦 Produce", "💳 EBT Accepted"].map(
          (label) => (
            <button
              key={label}
              className="px-3.5 py-1.5 rounded-full text-[13px] text-gray-600 border-[1.5px] border-gray-200 bg-white hover:border-green-400 hover:text-green-600 transition-colors"
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Store card grid — Story 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder store cards */}
        {[
          {
            emoji: "🥬",
            name: "Store Name",
            distance: "0.4 mi",
            neighborhood: "Neighborhood",
            tags: ["Halal", "Middle Eastern"],
            fresh: "Fresh today: placeholder items",
          },
          {
            emoji: "🍜",
            name: "Store Name",
            distance: "1.2 mi",
            neighborhood: "Neighborhood",
            tags: ["Asian groceries", "Produce"],
            fresh: "Fresh today: placeholder items",
          },
          {
            emoji: "🥕",
            name: "Store Name",
            distance: "2.1 mi",
            neighborhood: "Neighborhood",
            tags: ["Organic", "Produce"],
            fresh: "No updates in 7 days",
          },
        ].map((store, i) => (
          <a
            key={i}
            href="/stores/placeholder"
            className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-gray-400 transition-all"
          >
            <div className="h-[140px] w-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-5xl relative">
              {store.emoji}
              <span className="absolute top-2.5 right-2.5 bg-green-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Updated today
              </span>
            </div>
            <div className="p-3.5">
              <div className="font-semibold text-[16px] text-gray-800 mb-1">
                {store.name}
              </div>
              <div className="text-[13px] text-gray-400 mb-2.5 flex gap-3">
                <span>📍 {store.distance}</span>
                <span>{store.neighborhood}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {store.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-[12px] text-green-600 font-medium border-t border-gray-100 pt-2.5 flex items-center gap-1.5">
                🌿 {store.fresh}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
