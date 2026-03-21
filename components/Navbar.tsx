import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav
        className="mx-auto flex items-center gap-0 px-6 h-[58px]"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-display text-[22px] font-semibold text-green-600 tracking-tight mr-10 shrink-0"
        >
          Local<span className="text-green-200">Grocer</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex gap-1 flex-1">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            Discover Stores
          </Link>
          <Link
            href="/map"
            className="px-3.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            Map
          </Link>
          <Link
            href="/deals"
            className="px-3.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            Deals
          </Link>
        </div>

        {/* Auth actions */}
        <div className="flex gap-2 items-center ml-auto">
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Mobile bottom nav is rendered separately — see MobileNav component */}
    </header>
  );
}
