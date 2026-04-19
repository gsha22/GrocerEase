/** Opens Google Maps search for a street address (discovery-only; no in-app checkout). */
export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}
