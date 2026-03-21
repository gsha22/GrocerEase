// TODO: Story 11 (Fresh Today — Owner), Story 10 (Edit or Delete a Post)

export default function ManagePostsPage() {
  return (
    <div className="max-w-[700px]">
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-medium text-gray-800 tracking-tight">
          Fresh Updates
        </h1>
        <p className="text-[15px] text-gray-600 mt-1.5">
          Post &ldquo;fresh today&rdquo; updates for shoppers to see
        </p>
      </div>

      {/* New post form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-[17px] font-semibold text-gray-800 mb-4">
          Post a fresh update
        </h2>
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Item name *
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. Bok Choy, Lamb Shoulder"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Note (optional)
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] bg-white outline-none focus:border-green-400 transition-colors"
            placeholder="e.g. Just arrived from local farm — very limited"
          />
        </div>
        <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors">
          Post update
        </button>
      </div>

      {/* Existing posts */}
      <h2 className="text-[17px] font-semibold text-gray-800 mb-4">
        Your posts
      </h2>

      {/* Placeholder post rows */}
      {[
        { icon: "🥬", title: "Bok Choy — Fresh today", meta: "Fresh Today · posted 1h ago" },
        { icon: "🥩", title: "Lamb Shoulder — Halal certified", meta: "Fresh Today · posted 2h ago" },
      ].map((post, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl mb-2 hover:border-gray-400 transition-colors"
        >
          <div className="text-2xl w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
            {post.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[15px] truncate">{post.title}</div>
            <div className="text-[12px] text-gray-400 mt-0.5">{post.meta}</div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600">
              Edit
            </button>
            <button className="px-3 py-1 rounded-md text-[12px] font-medium border border-gray-200 hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-colors text-gray-600">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
