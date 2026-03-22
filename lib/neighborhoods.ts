export const PITTSBURGH_NEIGHBORHOODS: Record<
  string,
  { lat: number; lng: number }
> = {
  "Downtown Pittsburgh": { lat: 40.4406, lng: -79.9959 },
  "Squirrel Hill": { lat: 40.4318, lng: -79.9231 },
  "Strip District": { lat: 40.4525, lng: -79.9781 },
  "Shadyside": { lat: 40.4557, lng: -79.9339 },
  "Oakland": { lat: 40.4416, lng: -79.9569 },
  "Lawrenceville": { lat: 40.4674, lng: -79.9606 },
  "South Side": { lat: 40.4283, lng: -79.9693 },
  "East Liberty": { lat: 40.4619, lng: -79.9253 },
  "Bloomfield": { lat: 40.4611, lng: -79.9489 },
  "Sewickley": { lat: 40.5338, lng: -80.1854 },
  "McKees Rocks": { lat: 40.4656, lng: -80.0659 },
  "Millvale": { lat: 40.4806, lng: -79.9783 },
  "Edgeworth": { lat: 40.5515, lng: -80.1875 },
};

const ZIP_TO_NEIGHBORHOOD: Record<string, string> = {
  "15143": "Sewickley",
  "15222": "Strip District",
  "15233": "North Side",
  "15217": "Squirrel Hill",
  "15232": "Shadyside",
  "15213": "Oakland",
  "15201": "Lawrenceville",
  "15203": "South Side",
  "15206": "East Liberty",
  "15224": "Bloomfield",
  "15209": "Millvale",
  "15136": "McKees Rocks",
  "15212": "North Side",
  "15219": "Downtown",
  "15260": "Oakland",
};

export function extractNeighborhood(address: string): string {
  // Try to match a ZIP code and look it up
  const zipMatch = address.match(/\b(\d{5})\b/);
  if (zipMatch && ZIP_TO_NEIGHBORHOOD[zipMatch[1]]) {
    return ZIP_TO_NEIGHBORHOOD[zipMatch[1]];
  }

  // Fallback: if the city isn't "Pittsburgh", use it directly (e.g. "Edgeworth")
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const city = parts[1].replace(/\s+PA.*$/, "").trim();
    if (city.toLowerCase() !== "pittsburgh") return city;
  }

  return "Pittsburgh";
}
