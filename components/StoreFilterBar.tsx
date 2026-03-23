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
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-[13px] text-gray-400 flex items-center pr-1">
        Filter:
      </span>

      {FILTER_OPTIONS.map(({ key, label, icon }) => {
        const isActive = active.has(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            aria-pressed={isActive}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px]
              border-[1.5px] transition-colors cursor-pointer select-none
              ${
                isActive
                  ? "border-green-400 bg-green-50 text-green-800 font-medium"
                  : "border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-600"
              }
            `}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
            {isActive && (
              <span
                aria-label={`Remove ${label} filter`}
                className="ml-0.5 text-green-600 hover:text-green-800"
              >
                &times;
              </span>
            )}
          </button>
        );
      })}

      {active.size > 0 && (
        <button
          onClick={clearAll}
          className="text-[12px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
