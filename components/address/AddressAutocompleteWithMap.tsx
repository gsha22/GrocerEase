"use client";

import type { AddressSuggestResult } from "@/lib/address-suggest";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const AddressPreviewMap = dynamic(() => import("./AddressPreviewMap"), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  fieldError?: string;
  placeholder?: string;
};

function splitDisplayName(full: string): { main: string; secondary: string } {
  const idx = full.indexOf(",");
  if (idx === -1) return { main: full, secondary: "" };
  return { main: full.slice(0, idx).trim(), secondary: full.slice(idx + 1).trim() };
}

const SUGGEST_DEBOUNCE_MS = 150;
/** Fire suggest requests as soon as there is any non-whitespace input (full query each time). */
const MIN_QUERY_LEN = 1;
const PREVIEW_DEBOUNCE_MS = 500;

export default function AddressAutocompleteWithMap({
  value,
  onChange,
  initialLat,
  initialLng,
  fieldError,
  placeholder = "Start typing your street address",
}: Props) {
  const listId = useId();
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() =>
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null,
  );
  const [suggestions, setSuggestions] = useState<AddressSuggestResult[]>([]);
  const [open, setOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    setSuggestLoading(true);
    setOpen(true);
    try {
      const res = await fetch(`/api/address/suggest?q=${encodeURIComponent(q)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const data = (await res.json()) as { results?: AddressSuggestResult[] };
      const results = Array.isArray(data.results) ? data.results : [];
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const showSuggestionList = mounted && open && (suggestions.length > 0 || suggestLoading);

  useLayoutEffect(() => {
    if (!showSuggestionList) {
      setDropdownRect(null);
      return;
    }
    const el = inputWrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [showSuggestionList, value]);

  const selectSuggestion = useCallback(
    (r: AddressSuggestResult) => {
      onChange(r.displayName);
      setCoords({ lat: r.lat, lng: r.lng });
      setSuggestions([]);
      setOpen(false);
    },
    [onChange],
  );

  const fetchServerPreview = useCallback(async (addr: string) => {
    setMapLoading(true);
    try {
      const res = await fetch("/api/address/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { lat?: number; lng?: number };
      if (typeof data.lat === "number" && typeof data.lng === "number") {
        setCoords({ lat: data.lat, lng: data.lng });
      }
    } finally {
      setMapLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = value.trim();
    if (t.length < 8) {
      if (t.length === 0) setCoords(null);
      return;
    }
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => {
      void fetchServerPreview(t);
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [value, fetchServerPreview]);

  const onInputChange = (next: string) => {
    onChange(next);
    const q = next.trim();
    if (q.length < MIN_QUERY_LEN) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
    suggestDebounceRef.current = setTimeout(() => {
      void fetchSuggestions(q);
    }, SUGGEST_DEBOUNCE_MS);
  };

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-medium text-gray-600">Address *</label>
      <div ref={inputWrapRef} className="relative z-20 overflow-visible">
        <input
          type="text"
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 250);
            const t = value.trim();
            if (t.length >= 10) void fetchServerPreview(t);
          }}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          className="w-full rounded-md border-[1.5px] border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-800 outline-none transition-colors focus:border-green-400"
          placeholder={placeholder}
        />
        {showSuggestionList && dropdownRect
          ? createPortal(
              <ul
                id={listId}
                role="listbox"
                style={{
                  position: "fixed",
                  top: dropdownRect.top,
                  left: dropdownRect.left,
                  width: dropdownRect.width,
                  zIndex: 9999,
                }}
                className="max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              >
                {suggestLoading && suggestions.length === 0 ? (
                  <li className="px-3 py-2.5 text-[13px] text-gray-400">Searching addresses…</li>
                ) : null}
                {suggestions.map((r) => {
                  const { main, secondary } = splitDisplayName(r.displayName);
                  return (
                    <li key={r.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        className="w-full px-3 py-2.5 text-left text-[13px] text-gray-800 hover:bg-green-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(r)}
                      >
                        <span className="font-medium text-gray-900">{main}</span>
                        {secondary ? (
                          <span className="mt-0.5 block text-[12px] leading-snug text-gray-500">
                            {secondary}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>,
              document.body,
            )
          : null}
      </div>
      {fieldError ? <p className="mt-1.5 text-[12px] text-red-700">{fieldError}</p> : null}
      {mounted ? (
        <p className="mt-1.5 text-[12px] text-gray-400">
          Suggestions update as you type — pick one to autofill and place the pin (OpenStreetMap via
          Photon; map tiles © OpenStreetMap).
        </p>
      ) : null}

      <div className="mt-3">
        {mapLoading && !coords ? (
          <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-[13px] text-gray-400">
            Locating on map…
          </div>
        ) : null}
        {coords ? <AddressPreviewMap lat={coords.lat} lng={coords.lng} /> : null}
        {!coords && !mapLoading ? (
          <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-[13px] text-gray-400">
            Pick an address from the dropdown, or keep typing — the map updates when the line looks
            complete.
          </div>
        ) : null}
      </div>
    </div>
  );
}
