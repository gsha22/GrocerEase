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

const MOCK_STORES = [
  {
    id: "1",
    name: "Grocery A",
    address: "123 Main St",
    lat: 40.5,
    lng: -80.1,
    categories: [],
    distanceMiles: 1.2,
  },
  {
    id: "2",
    name: "Market B",
    address: "456 Oak Ave",
    lat: 40.51,
    lng: -80.11,
    categories: [],
    distanceMiles: null,
  },
];

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

  it("renders the Store Map heading", async () => {
    render(<MapPage />);
    expect(screen.getByText(/Store Map/i)).toBeInTheDocument();
  });

  it("shows loading skeleton before fetch resolves", () => {
    jest.spyOn(global, "fetch").mockReturnValue(new Promise(() => {}));
    render(<MapPage />);
    expect(screen.getByText(/Loading map/i)).toBeInTheDocument();
  });

  it("shows placeholder text when no stores are found", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("store-map")).toBeInTheDocument();
    });
    expect(screen.getByText(/Finding stores near you/i)).toBeInTheDocument();
  });

  it("renders the StoreMap component after stores load", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByTestId("store-map")).toBeInTheDocument();
    });
  });

  it("fetches stores with user coords on geolocation success", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("lat=40.5"),
      );
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("lng=-80.1"),
    );
  });

  it("shows store count when stores are returned", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_STORES,
    } as Response);
    render(<MapPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/2 stores within 10 miles/i),
      ).toBeInTheDocument();
    });
  });

  it("renders store names and addresses in the list", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_STORES,
    } as Response);
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByText("Grocery A")).toBeInTheDocument();
    });
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Market B")).toBeInTheDocument();
    expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
  });

  it("shows distance badge only when distanceMiles is provided", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => MOCK_STORES,
    } as Response);
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByText("1.2 mi")).toBeInTheDocument();
    });
    // Market B has distanceMiles: null — no badge for it
    expect(screen.queryByText("null mi")).not.toBeInTheDocument();
  });

  it("falls back to fetch without coords when geolocation errors", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn(
          (
            _success: PositionCallback,
            error?: PositionErrorCallback | null,
          ) => {
            error?.({} as GeolocationPositionError);
          },
        ),
      },
    });
    render(<MapPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/stores");
    });
  });
});
