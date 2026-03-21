// TODO: Story 3 (Discover Nearby Stores — Map View)

export default function MapPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Store Map
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Find nearby stores on the map
        </p>
      </div>

      {/* Map placeholder */}
      <div className="w-full h-[400px] rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-3 mb-6 relative overflow-hidden">
        {/* Mock pins */}
        <div className="absolute top-[30%] left-[25%] text-[28px] cursor-pointer hover:scale-110 transition-transform">
          📍
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-md px-2 py-1 text-[12px] font-medium shadow-sm whitespace-nowrap">
            Store A (0.4 mi)
          </span>
        </div>
        <div className="absolute top-[45%] left-[55%] text-[28px] cursor-pointer hover:scale-110 transition-transform">
          📍
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-md px-2 py-1 text-[12px] font-medium shadow-sm whitespace-nowrap">
            Store B (1.2 mi)
          </span>
        </div>
        <div className="absolute top-[60%] left-[35%] text-[28px] cursor-pointer hover:scale-110 transition-transform">
          📍
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-md px-2 py-1 text-[12px] font-medium shadow-sm whitespace-nowrap">
            Store C (2.1 mi)
          </span>
        </div>

        <span className="absolute bottom-3.5 right-3.5 text-[12px] bg-white px-2 py-1 rounded border border-gray-200">
          Map view — 3 stores found
        </span>
      </div>

      <p className="text-[13px] text-gray-400 text-center">
        Map integration with Google Maps will replace this placeholder. Stores
        are sorted by distance from user&apos;s location using the Haversine
        formula.
      </p>
    </div>
  );
}
