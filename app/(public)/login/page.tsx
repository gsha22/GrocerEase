// TODO: Story 6 (Secure Store Owner Login)

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-10 max-w-[420px] w-full shadow-md">
        <div className="font-display text-2xl font-semibold text-green-600 mb-1.5">
          LocalGrocer
        </div>
        <p className="text-[14px] text-gray-400 mb-7">
          Owner portal — manage your store&apos;s listings
        </p>

        {/* Email field */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@yourstore.com"
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
          />
        </div>

        {/* Password field */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="Your password"
            className="w-full px-3.5 py-2.5 rounded-md border-[1.5px] border-gray-200 text-[15px] text-gray-800 bg-white outline-none focus:border-green-400 transition-colors"
          />
          <div className="mt-2">
            <a href="#" className="text-[13px] text-green-600">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit */}
        <button className="w-full py-3 rounded-md text-[15px] font-semibold text-white bg-green-600 hover:bg-green-800 transition-colors mt-1">
          Sign in to dashboard
        </button>

        <hr className="border-gray-100 my-5" />

        <p className="text-center text-[13px] text-gray-400">
          New store owner?{" "}
          <a href="/dashboard/profile" className="text-green-600">
            Create your store &rarr;
          </a>
        </p>
      </div>
    </div>
  );
}
