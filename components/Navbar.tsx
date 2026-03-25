import Link from "next/link";
import NavbarAuthLinks from "@/components/NavbarAuthLinks";

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

        <NavbarAuthLinks />
      </nav>

      {/* Mobile bottom nav is rendered separately — see MobileNav component */}
    </header>
  );
}
