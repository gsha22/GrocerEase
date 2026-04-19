"use client";

export const FILTER_OPTIONS = [
  { key: "asian", label: "Asian Groceries", icon: "\u{1F962}" },
  { key: "halal", label: "Halal", icon: "\u262A" },
  { key: "organic", label: "Organic", icon: "\u{1F33F}" },
  { key: "produce", label: "Produce", icon: "\u{1F966}" },
  { key: "ebt", label: "EBT Accepted", icon: "\u{1F4B3}" },
] as const;

export type FilterKey = (typeof FILTER_OPTIONS)[number]["key"];

interface StoreFilterBarProps {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
}

export default function StoreFilterBar({
  active,
  onChange,
}: StoreFilterBarProps) {
  function toggle(key: FilterKey) {
    const next = new Set(active);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  }

  function clearAll() {
    onChange(new Set());
  }

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
          Specialties
        </span>
        {active.size > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[12px] font-semibold text-emerald-800/80 transition hover:text-emerald-950"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 sm:flex-wrap sm:overflow-visible">
        {FILTER_OPTIONS.map(({ key, label, icon }) => {
          const isActive = active.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={isActive}
              className={`
                inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold
                transition-all duration-200 active:scale-[0.98]
                ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/25 ring-2 ring-emerald-700/30"
                    : "border border-stone-200/90 bg-white text-stone-600 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900"
                }
              `}
            >
              <span aria-hidden className="text-[15px] leading-none">
                {icon}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
