"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Discover", icon: "🗺" },
  { href: "/map", label: "Map", icon: "📍" },
  { href: "/deals", label: "Deals", icon: "🏷" },
  { href: "/login", label: "Account", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white py-2 sm:hidden">
      {items.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-[10px] ${
              active ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
