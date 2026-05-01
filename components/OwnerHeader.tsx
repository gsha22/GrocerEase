"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const publicLinks = [
  { href: "/", label: "Discover Stores" },
  { href: "/map", label: "Map" },
  { href: "/deals", label: "Deals" },
] as const;

export default function OwnerHeader() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shrink-0">
      <nav
        className="mx-auto flex h-[58px] items-center gap-2 px-4 sm:px-6"
        aria-label="Owner portal navigation"
      >
        <Link
          href="/dashboard"
          className="font-display text-[20px] font-semibold text-green-600 tracking-tight sm:text-[22px] shrink-0"
        >
          Grocer<span className="text-green-200">Ease</span>
        </Link>
        <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider text-green-600/90 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
          Owner
        </span>

        <div className="hidden md:flex gap-0.5 flex-1 ml-4">
          {publicLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto min-w-0">
          {email && (
            <span
              className="hidden sm:block truncate max-w-[160px] lg:max-w-[220px] text-[12px] text-gray-400"
              title={email}
            >
              {email}
            </span>
          )}
          <Link
            href="/"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors shrink-0"
          >
            Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
