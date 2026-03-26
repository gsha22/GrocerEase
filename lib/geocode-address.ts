import { PITTSBURGH_NEIGHBORHOODS } from "@/lib/neighborhoods";

type Coordinates = { lat: number; lng: number };

function deterministicGeocode(address: string): Coordinates {
  const normalized = address.trim().toLowerCase();
  for (const [name, coords] of Object.entries(PITTSBURGH_NEIGHBORHOODS)) {
    if (normalized.includes(name.toLowerCase())) {
      return coords;
    }
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }

  const latOffset = ((hash % 7000) - 3500) / 100000;
  const lngOffset = (((hash >> 13) % 7000) - 3500) / 100000;

  return {
    lat: 40.4406 + latOffset,
    lng: -79.9959 + lngOffset,
  };
}

/**
 * Resolves an address to lat/lng. Tries Google Geocoding when `GOOGLE_MAPS_API_KEY` is set;
 * on any failure (missing key, HTTP error, ZERO_RESULTS, quota, network), falls back to a
 * deterministic Pittsburgh-area approximation so owners can still publish. Logs when fallback
 * is used so bad addresses or API issues are visible in server logs.
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("geocodeAddress: no GOOGLE_MAPS_API_KEY; using deterministic fallback");
    return deterministicGeocode(address);
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("address", address);
  endpoint.searchParams.set("key", apiKey);

  try {
    const res = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(
        `geocodeAddress: Google HTTP ${res.status}; using deterministic fallback`
      );
      return deterministicGeocode(address);
    }

    const data = (await res.json()) as {
      status?: string;
      results?: Array<{
        geometry?: { location?: { lat?: number; lng?: number } };
      }>;
    };

    const location = data.results?.[0]?.geometry?.location;
    if (
      data.status === "OK" &&
      typeof location?.lat === "number" &&
      typeof location?.lng === "number"
    ) {
      return { lat: location.lat, lng: location.lng };
    }

    console.warn(
      `geocodeAddress: Google status=${data.status ?? "unknown"}; using deterministic fallback`
    );
  } catch (error) {
    console.error("geocodeAddress failed; using deterministic fallback", error);
  }

  return deterministicGeocode(address);
}
