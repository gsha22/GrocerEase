"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/dashboard/profile", label: "Store", icon: "🏪" },
  { href: "/dashboard/posts", label: "Updates", icon: "📝" },
  { href: "/dashboard/deals", label: "Deals", icon: "🏷" },
  { href: "/", label: "Site", icon: "🗺" },
] as const;

export default function OwnerMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white py-2 px-1"
      aria-label="Owner quick navigation"
    >
      {items.map(({ href, label, icon }) => {
        const active =
          href === "/"
            ? false
            : href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md min-w-0 flex-1 max-w-[4.5rem] ${
              active ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[9px] font-medium truncate w-full text-center">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
