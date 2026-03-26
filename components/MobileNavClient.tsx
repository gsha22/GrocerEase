"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseItems = [
  { href: "/", label: "Discover", icon: "🗺" },
  { href: "/map", label: "Map", icon: "📍" },
  { href: "/deals", label: "Deals", icon: "🏷" },
] as const;

export default function MobileNavClient({ authed }: { authed: boolean }) {
  const pathname = usePathname();

  const accountHref = authed ? "/dashboard" : "/login";
  const accountLabel = authed ? "Owner" : "Account";
  const accountActive =
    authed &&
    (pathname === "/dashboard" || pathname.startsWith("/dashboard/"));

  const items = [
    ...baseItems.map((item) => ({
      ...item,
      active: pathname === item.href,
    })),
    {
      href: accountHref,
      label: accountLabel,
      icon: "👤",
      active:
        accountActive ||
        (!authed && (pathname === "/login" || pathname.startsWith("/login/"))),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white py-2 sm:hidden">
      {items.map(({ href, label, icon, active }) => (
        <Link
          key={href + label}
          href={href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-[10px] ${
            active ? "text-green-600" : "text-gray-400"
          }`}
        >
          <span className="text-xl">{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  );
}

