import StoreDirectory from "@/components/StoreDirectory";

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
        <a
          href="/map"
          className="px-4 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Map
        </a>
      </div>

      {/* Store directory with filters — Story 4 */}
      <StoreDirectory />
    </div>
  );
}
