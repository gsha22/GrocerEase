// TODO: Story 7 (Create a Store Profile)

import Link from "next/link";

export default function StoreProfileEditPage() {
  return (
    <div className="max-w-[600px]">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Owner portal
        </p>
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Store profile
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Shoppers see this on the directory and your store page.
        </p>
        <Link
          href="/"
          className="inline-flex mt-3 text-[13px] text-green-600 font-medium hover:text-green-800"
        >
          ← Back to site
        </Link>
      </div>

      {/* Store details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">
          Store details
        </h2>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Store name *
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. Sultan Bey International"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Address *
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="142 Beaver St, Sewickley, PA 15143"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Opening time *
            </label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Closing time *
            </label>
            <input
              type="time"
              defaultValue="20:00"
              className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-2">
          Specialty categories
        </h2>
        <p className="text-[14px] text-gray-400 mb-3.5">
          Select all that apply — shoppers filter by these
        </p>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors">
          Publish store profile &rarr;
        </button>
        <button className="px-5 py-2.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
          Save as draft
        </button>
      </div>
    </div>
  );
}
