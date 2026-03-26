/**
 * Verifies geocodeAddress behavior:
 * 1) Google returns OK → use API lat/lng
 * 2) Google fails or key missing → deterministic Pittsburgh fallback
 *
 * Mocked tests (always run):
 *   npm run test:geocode
 *
 * Optional live call against real Geocoding API (uses .env GOOGLE_MAPS_API_KEY):
 *   GEOCODE_LIVE_TEST=1 npm run test:geocode
 */

import "dotenv/config";
import { strict as assert } from "node:assert";

const SEWICKLEY_SAMPLE = "142 Beaver St, Sewickley, PA 15143";
const SEWICKLEY_FALLBACK = { lat: 40.5338, lng: -80.1854 };

async function withGeocodeEnv(
  env: { GOOGLE_MAPS_API_KEY?: string | undefined },
  fn: () => Promise<void>
) {
  const prev = process.env.GOOGLE_MAPS_API_KEY;
  try {
    if (env.GOOGLE_MAPS_API_KEY === undefined) {
      delete process.env.GOOGLE_MAPS_API_KEY;
    } else {
      process.env.GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
    }
    await fn();
  } finally {
    if (prev === undefined) {
      delete process.env.GOOGLE_MAPS_API_KEY;
    } else {
      process.env.GOOGLE_MAPS_API_KEY = prev;
    }
  }
}

function withMockFetch(mock: typeof fetch, fn: () => Promise<void>) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  return fn().finally(() => {
    globalThis.fetch = real;
  });
}

async function runMockedTests() {
  const { geocodeAddress } = await import("../lib/geocode-address");

  // Branch A: valid Google JSON response → use API coordinates (not fallback)
  await withGeocodeEnv({ GOOGLE_MAPS_API_KEY: "test-key-mocked" }, async () => {
    await withMockFetch(
      async () =>
        new Response(
          JSON.stringify({
            status: "OK",
            results: [
              {
                geometry: { location: { lat: 40.123456, lng: -79.987654 } },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ),
      async () => {
        const c = await geocodeAddress("any query string");
        assert.equal(c.lat, 40.123456);
        assert.equal(c.lng, -79.987654);
      }
    );
  });

  // Branch B: API key present but Google returns ZERO_RESULTS → fallback
  await withGeocodeEnv({ GOOGLE_MAPS_API_KEY: "test-key-mocked" }, async () => {
    await withMockFetch(
      async () =>
        new Response(
          JSON.stringify({ status: "ZERO_RESULTS", results: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        ),
      async () => {
        const c = await geocodeAddress(SEWICKLEY_SAMPLE);
        assert.equal(c.lat, SEWICKLEY_FALLBACK.lat);
        assert.equal(c.lng, SEWICKLEY_FALLBACK.lng);
      }
    );
  });

  // Branch C: no API key → fallback, fetch must not be used
  await withGeocodeEnv({ GOOGLE_MAPS_API_KEY: undefined }, async () => {
    await withMockFetch(
      async () => {
        throw new Error("fetch should not run when GOOGLE_MAPS_API_KEY is unset");
      },
      async () => {
        const c = await geocodeAddress(SEWICKLEY_SAMPLE);
        assert.equal(c.lat, SEWICKLEY_FALLBACK.lat);
        assert.equal(c.lng, SEWICKLEY_FALLBACK.lng);
      }
    );
  });

  // Branch D: HTTP error from Google → fallback
  await withGeocodeEnv({ GOOGLE_MAPS_API_KEY: "test-key-mocked" }, async () => {
    await withMockFetch(
      async () => new Response("Forbidden", { status: 403 }),
      async () => {
        const c = await geocodeAddress(SEWICKLEY_SAMPLE);
        assert.equal(c.lat, SEWICKLEY_FALLBACK.lat);
        assert.equal(c.lng, SEWICKLEY_FALLBACK.lng);
      }
    );
  });
}

async function runLiveTestIfRequested() {
  if (process.env.GEOCODE_LIVE_TEST !== "1") {
    return;
  }
  const key = process.env.GOOGLE_MAPS_API_KEY;
  assert.ok(key && key.length > 0, "GEOCODE_LIVE_TEST=1 requires GOOGLE_MAPS_API_KEY");

  const { geocodeAddress } = await import("../lib/geocode-address");
  const address = "6000 Forbes Ave, Pittsburgh, PA 15217";
  const c = await geocodeAddress(address);

  assert.ok(
    c.lat > 40.3 && c.lat < 40.55 && c.lng < -79.7 && c.lng > -80.2,
    `live geocode for "${address}" should land near Pittsburgh, got lat=${c.lat} lng=${c.lng}`
  );

  console.log(`Live Geocoding API OK: "${address}" -> lat=${c.lat}, lng=${c.lng}`);
}

async function main() {
  console.log("Running mocked geocode branch tests…");
  await runMockedTests();
  console.log("Mocked geocode branch tests passed.");

  if (process.env.GEOCODE_LIVE_TEST === "1") {
    console.log("Running live Geocoding API check (GEOCODE_LIVE_TEST=1)…");
    await runLiveTestIfRequested();
    console.log("Live geocode check passed.");
  } else {
    console.log(
      "Skip live API test (set GEOCODE_LIVE_TEST=1 to hit real Geocoding with GOOGLE_MAPS_API_KEY)."
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
