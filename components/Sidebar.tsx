"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Owner portal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/dashboard/profile", label: "Store Profile", icon: "🏪" },
      { href: "/dashboard/posts", label: "Fresh Updates", icon: "📝" },
      { href: "/dashboard/deals", label: "Deals", icon: "🏷" },
      { href: "/dashboard/reports", label: "Reports", icon: "🚩" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-gray-200 bg-white sticky top-[58px] h-[calc(100vh-58px)]">
      <div className="flex-1 overflow-y-auto p-3 pb-2 flex flex-col gap-1">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 pt-3 pb-1.5">
              {section.label}
            </div>
            {section.items.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-green-50 text-green-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="text-lg w-[18px] h-[18px] flex items-center justify-center shrink-0">
                    {icon}
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
