import type { AddressSuggestResult } from "@/lib/address-suggest";

export type PhotonProperties = {
  osm_id?: number;
  osm_type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  locality?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  type?: string;
};

export type PhotonFeature = {
  geometry: { type: string; coordinates: [number, number] };
  properties: PhotonProperties;
};

export type PhotonResponse = {
  features?: PhotonFeature[];
};

/** Single-line mailing-style address for autofill */
export function formatPhotonDisplay(p: PhotonProperties): string {
  const line1 = [p.housenumber, p.street || p.name].filter(Boolean).join(" ").trim();
  const place =
    [p.locality, p.city].filter(Boolean).join(", ") || p.city || p.locality || "";
  const stateZip = [p.state, p.postcode].filter(Boolean).join(" ").trim();
  const parts = [line1 || p.name, place, stateZip, p.country].filter(
    (s) => typeof s === "string" && s.length > 0,
  );
  return parts.join(", ");
}

export function photonFeatureToResult(f: PhotonFeature, index: number): AddressSuggestResult {
  const [lon, lat] = f.geometry.coordinates;
  const p = f.properties;
  const displayName = formatPhotonDisplay(p);
  return {
    id: `photon-${p.osm_id ?? index}-${lat.toFixed(5)}-${lon.toFixed(5)}`,
    displayName: displayName.length > 0 ? displayName : `${lat}, ${lon}`,
    lat,
    lng: lon,
  };
}
