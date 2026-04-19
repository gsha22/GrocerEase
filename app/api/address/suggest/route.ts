import { NextRequest, NextResponse } from "next/server";
import type { AddressSuggestResult } from "@/lib/address-suggest";
import { photonFeatureToResult, type PhotonResponse } from "@/lib/photon-address";
import { requireOwnerSession } from "@/lib/require-owner-session";

const PHOTON = "https://photon.komoot.io/api/";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

async function fetchPhotonSuggestions(q: string): Promise<AddressSuggestResult[]> {
  const url = new URL(PHOTON);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "10");
  url.searchParams.set("lang", "en");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const data = (await res.json()) as PhotonResponse;
  const features = Array.isArray(data.features) ? data.features : [];
  return features.map((f, i) => photonFeatureToResult(f, i));
}

async function fetchNominatimFallback(q: string): Promise<AddressSuggestResult[]> {
  const url = new URL(NOMINATIM);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "us");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "GrocerEase/1.0 (address autocomplete)",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    place_id?: number;
    osm_id?: number;
    lat: string;
    lon: string;
    display_name: string;
  }>;

  return data.map((r, i) => ({
    id: `osm-${r.place_id ?? r.osm_id ?? i}-${r.lat}-${r.lon}`,
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));
}

/**
 * Google-style address suggestions: Photon (Komoot) first, Nominatim if Photon is empty.
 */
export async function GET(req: NextRequest) {
  const gate = await requireOwnerSession();
  if (!gate.ok) return gate.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] satisfies AddressSuggestResult[] });
  }

  try {
    let results = await fetchPhotonSuggestions(q);
    if (results.length === 0) {
      results = await fetchNominatimFallback(q);
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] satisfies AddressSuggestResult[] });
  }
}
