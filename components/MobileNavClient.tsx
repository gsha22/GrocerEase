"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseItems = [
  { href: "/", label: "Discover", icon: "🗺" },
  { href: "/map", label: "Map", icon: "📍" },
  { href: "/deals", label: "Deals", icon: "🏷" },
] as const;

export default function MobileNavClient({
  accountKind,
}: {
  accountKind: "guest" | "owner" | "shopper";
}) {
  const pathname = usePathname();

  const accountHref =
    accountKind === "shopper"
      ? "/shopper/account"
      : accountKind === "owner"
        ? "/dashboard"
        : "/shopper/login";
  const accountLabel =
    accountKind === "shopper"
      ? "Account"
      : accountKind === "owner"
        ? "Owner"
        : "Account";
  const accountActive =
    (accountKind === "owner" &&
      (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) ||
    (accountKind === "shopper" &&
      (pathname === "/shopper/account" ||
        pathname.startsWith("/shopper/account/")));

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
        (accountKind === "guest" &&
          (pathname === "/shopper/login" ||
            pathname.startsWith("/shopper/login") ||
            pathname === "/shopper/signup" ||
            pathname.startsWith("/shopper/signup") ||
            pathname === "/login" ||
            pathname.startsWith("/login/") ||
            pathname === "/signup")),
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

