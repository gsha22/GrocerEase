"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function NavbarAuthLinks() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex gap-2 items-center ml-auto">
        <span className="h-8 w-20 rounded-md bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-wrap gap-2 items-center justify-end ml-auto">
        <Link
          href="/dashboard"
          className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-800 transition-colors"
        >
          Owner portal
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
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
  );
}
