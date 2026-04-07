import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import HomePage, { buildHomeStoresSearchParams } from "@/app/(public)/page";

describe("buildHomeStoresSearchParams", () => {
  it("adds lat lng radius when location is set", () => {
    const p = buildHomeStoresSearchParams(new Set(), {
      lat: 40.44,
      lng: -79.99,
    });
    expect(p.get("lat")).toBe("40.44");
    expect(p.get("lng")).toBe("-79.99");
    expect(p.get("radius")).toBe("10");
  });

  it("adds category when filters non-empty", () => {
    const p = buildHomeStoresSearchParams(
      new Set(["halal", "organic"]),
      null,
    );
    expect(p.get("category")).toBe("halal,organic");
    expect(p.has("lat")).toBe(false);
  });

  it("combines geo and category", () => {
    const p = buildHomeStoresSearchParams(new Set(["ebt"]), {
      lat: 1,
      lng: 2,
    });
    expect(p.get("category")).toBe("ebt");
    expect(p.get("lat")).toBe("1");
  });
});

describe("HomePage", () => {
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

  it("renders directory heading and triggers store fetch", async () => {
    render(<HomePage />);
    expect(screen.getByText(/Stores near you/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const call = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(call).toContain("/api/stores?");
    expect(call).toContain("lat=");
  });
});
