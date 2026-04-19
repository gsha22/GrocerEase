import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const session = await auth();
  const authed = !!session?.user;
  const isShopper = session?.role === "shopper";
  const isOwner = authed && !isShopper;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav
        className="mx-auto flex h-[58px] items-center gap-2 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-display text-[20px] sm:text-[22px] font-semibold text-emerald-800 tracking-tight mr-2 sm:mr-10 shrink-0"
        >
          Grocer<span className="text-emerald-500">Ease</span>
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
            href="/browse"
            className="px-3.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            Local feed
          </Link>
          {isOwner && (
            <Link
              href="/vendor"
              className="px-3.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              Vendor
            </Link>
          )}
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

        {authed ? (
          <div className="hidden sm:flex flex-wrap gap-2 items-center justify-end ml-auto">
            {isOwner && (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
              >
                Manage store
              </Link>
            )}
            {isShopper && (
              <Link
                href="/my-alerts"
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
              >
                Saved shops
              </Link>
            )}
            <SignOutButton className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors" />
          </div>
        ) : (
          <div className="hidden sm:flex flex-wrap gap-2 items-center justify-end ml-auto">
            <Link
              href="/sign-in"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
            >
              List your store
            </Link>
          </div>
        )}

        {/* Compact mobile actions to avoid horizontal overflow */}
        {authed ? (
          <div className="sm:hidden ml-auto flex items-center gap-1.5 min-w-0">
            {isOwner && (
              <Link
                href="/dashboard"
                className="px-2.5 py-1 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-800 transition-colors whitespace-nowrap"
              >
                Store
              </Link>
            )}
            {isShopper && (
              <Link
                href="/my-alerts"
                className="px-2.5 py-1 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-800 transition-colors whitespace-nowrap"
              >
                Saved
              </Link>
            )}
            <SignOutButton className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap" />
          </div>
        ) : (
          <div className="sm:hidden ml-auto flex items-center gap-1.5 min-w-0">
            <Link
              href="/sign-in"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-2.5 py-1 rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-800 transition-colors whitespace-nowrap"
            >
              List
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav is rendered separately — see MobileNav component */}
    </header>
  );
}
