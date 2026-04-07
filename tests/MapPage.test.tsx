import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import MapPage, { buildMapStoresApiUrl } from "@/app/(public)/map/page";

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () =>
    function FakeMap() {
      return <div data-testid="store-map">map</div>;
    },
}));

describe("buildMapStoresApiUrl", () => {
  it("returns bare URL without coords", () => {
    expect(buildMapStoresApiUrl(null, null)).toBe("/api/stores");
  });

  it("includes lat lng radius when coords provided", () => {
    const u = buildMapStoresApiUrl(40.44, -79.99);
    expect(u).toContain("lat=40.44");
    expect(u).toContain("lng=-79.99");
    expect(u).toContain("radius=10");
  });
});

describe("MapPage", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn((success: PositionCallback) => {
          success({
            coords: { latitude: 40.5, longitude: -80.1 },
          } as GeolocationPosition);
        }),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads map area and fetches stores", async () => {
    render(<MapPage />);
    expect(screen.getByText(/Store Map/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("store-map")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
