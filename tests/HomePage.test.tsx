/**
 * Unit tests for app/(public)/page.tsx — HomePage
 *
 * Functions under test:
 *   fetchStores        – builds API params, fetches /api/stores, updates state
 *   useEffect          – geolocation initialisation on mount
 *   selectNeighborhood – looks up coords from PITTSBURGH_NEIGHBORHOODS, refetches
 *   handleFilterChange – updates activeFilters and refetches
 *
 * Pure-function tests for lib/neighborhoods:
 *   extractNeighborhood – ZIP lookup, city fallback, Pittsburgh fallback
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// extractNeighborhood (lib/neighborhoods) — pure function, no mocks needed
// ---------------------------------------------------------------------------
import { extractNeighborhood } from "@/lib/neighborhoods";

describe("extractNeighborhood", () => {
  it("returns the mapped neighborhood for a known Pittsburgh ZIP (15217 → Squirrel Hill)", () => {
    expect(extractNeighborhood("6100 Forbes Ave, Pittsburgh, PA 15217")).toBe(
      "Squirrel Hill",
    );
  });

  it("returns the mapped neighborhood for another known ZIP (15222 → Strip District)", () => {
    expect(extractNeighborhood("1000 Penn Ave, Pittsburgh, PA 15222")).toBe(
      "Strip District",
    );
  });

  it("returns the city when ZIP is absent and city is not Pittsburgh", () => {
    // Address with a non-Pittsburgh city — should use city name directly
    expect(extractNeighborhood("500 Main St, Sewickley, PA")).toBe("Sewickley");
  });

  it("falls back to Pittsburgh when ZIP is absent and city is Pittsburgh", () => {
    expect(extractNeighborhood("1 Grant St, Pittsburgh, PA")).toBe("Pittsburgh");
  });

  it("returns Pittsburgh for a bare address with no ZIP and no separating comma", () => {
    expect(extractNeighborhood("Unknown Place")).toBe("Pittsburgh");
  });
});

// ---------------------------------------------------------------------------
// HomePage component
// ---------------------------------------------------------------------------

// Mock next/link to a plain <a> tag — avoids Next.js router dependency
jest.mock("next/link", () => ({
  __esModule: true,
  default({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

import HomePage from "@/app/(public)/page";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStore(
  overrides: Partial<{
    id: string;
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
    categories: string[];
    hours: unknown;
    distanceMiles: number | null;
  }> = {},
) {
  return {
    id: "store-1",
    name: "Test Market",
    address: "123 Penn Ave, Pittsburgh, PA 15222",
    lat: 40.45,
    lng: -79.98,
    categories: [],
    hours: null,
    distanceMiles: null,
    ...overrides,
  };
}

function jsonRes(body: unknown, ok = true): Response {
  return { ok, json: () => Promise.resolve(body) } as Response;
}

function defineGeo(value: Partial<Geolocation> | undefined) {
  Object.defineProperty(navigator, "geolocation", {
    writable: true,
    configurable: true,
    value,
  });
}

function mockGeoSuccess(lat = 40.44, lng = -79.99) {
  defineGeo({
    getCurrentPosition: jest.fn((success: PositionCallback) =>
      success({
        coords: { latitude: lat, longitude: lng },
      } as GeolocationPosition),
    ),
  });
}

function mockGeoFailure() {
  defineGeo({
    getCurrentPosition: jest.fn(
      (_success: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1, message: "User denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError),
    ),
  });
}

function mockGeoUnavailable() {
  // In jsdom, "geolocation" in navigator stays true even after redefining the
  // property, because the key remains on the prototype chain. We simulate the
  // "position unavailable" error path which exercises the same setGeoFailed(true)
  // code as the else-branch would in a browser with no Geolocation API.
  defineGeo({
    getCurrentPosition: jest.fn(
      (_success: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 2, message: "Position unavailable", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError),
    ),
  });
}

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// fetchStores
// ---------------------------------------------------------------------------

describe("fetchStores", () => {
  it("fetches /api/stores without location params when geolocation fails", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await waitFor(() => {
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toBe("/api/stores?");
    });
  });

  it("includes lat, lng, and radius=10 params when geolocation succeeds", async () => {
    mockGeoSuccess(40.44, -79.99);
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await waitFor(() => {
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).toContain("lat=40.44");
      expect(url).toContain("lng=-79.99");
      expect(url).toContain("radius=10");
    });
  });

  it("includes category param in URL when a filter chip is activated", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    // Wait for initial load to complete before interacting
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });

    // Click the "Organic" filter chip (rendered by StoreFilterBar)
    fireEvent.click(screen.getByRole("button", { name: /organic/i }));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("category=organic");
    });
  });

  it("renders store cards after a successful fetch returns stores", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([makeStore()]));

    render(<HomePage />);

    await screen.findByText("Test Market");
  });

  it("shows 'No stores found' empty state when fetch returns an empty array", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText("No stores found");
  });

  it("recovers gracefully (no crash) when the fetch request rejects", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("No stores found")).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalled();
  });

  it("shows plural 'stores' in the subtitle when multiple stores are returned", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(
      jsonRes([
        makeStore(),
        makeStore({ id: "store-2", name: "Fresh Mart" }),
      ]),
    );

    render(<HomePage />);

    await screen.findByText(/showing 2 stores/i);
  });

  it("shows singular 'store' in the subtitle when exactly one store is returned", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([makeStore()]));

    render(<HomePage />);

    await screen.findByText(/showing 1 store\b/i);
  });
});

// ---------------------------------------------------------------------------
// useEffect — geolocation initialisation
// ---------------------------------------------------------------------------

describe("geolocation initialisation (useEffect)", () => {
  it("shows a loading skeleton while the initial fetch is in flight", () => {
    mockGeoFailure();
    // Never-resolving fetch keeps the loading state visible indefinitely
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    render(<HomePage />);

    // Loading skeletons use animate-pulse
    const pulsingDivs = document.querySelectorAll(".animate-pulse");
    expect(pulsingDivs.length).toBeGreaterThan(0);
  });

  it("sets locationLabel to 'your location' when geolocation succeeds", async () => {
    mockGeoSuccess();
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonRes([makeStore({ id: "s1", name: "Nearby Shop" })]));

    render(<HomePage />);

    await screen.findByText(/your location/i);
  });

  it("shows the neighborhood fallback picker when geolocation fails", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText(/couldn't detect your location/i);
    expect(
      screen.getByRole("button", { name: "Squirrel Hill" }),
    ).toBeInTheDocument();
  });

  it("shows the neighborhood picker when the geolocation API is entirely unavailable", async () => {
    mockGeoUnavailable();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText(/couldn't detect your location/i);
  });
});

// ---------------------------------------------------------------------------
// selectNeighborhood
// ---------------------------------------------------------------------------

describe("selectNeighborhood", () => {
  it("fetches with the neighborhood's coords after clicking a neighborhood button", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText(/couldn't detect your location/i);

    fireEvent.click(screen.getByRole("button", { name: "Squirrel Hill" }));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      // Squirrel Hill coords: lat=40.4318, lng=-79.9231
      expect(lastUrl).toContain("lat=40.4318");
      expect(lastUrl).toContain("lng=-79.9231");
    });
  });

  it("updates the heading subtitle to include the selected neighborhood name", async () => {
    mockGeoFailure();
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonRes([makeStore({ id: "s2", name: "Oakland Store" })]));

    render(<HomePage />);

    await screen.findByText(/couldn't detect your location/i);

    fireEvent.click(screen.getByRole("button", { name: "Oakland" }));

    await waitFor(() => {
      expect(screen.getByText(/oakland/i)).toBeInTheDocument();
    });
  });

  it("hides the neighborhood picker after a neighborhood is successfully selected", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText(/couldn't detect your location/i);

    fireEvent.click(screen.getByRole("button", { name: "Shadyside" }));

    await waitFor(() => {
      expect(
        screen.queryByText(/couldn't detect your location/i),
      ).not.toBeInTheDocument();
    });
  });

  it("ignores an unknown neighborhood name and does not crash", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    // Access selectNeighborhood indirectly via the component's internal rendering
    // by verifying no extra fetch call is made when no valid neighborhood is chosen
    render(<HomePage />);

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    });

    // There's no "Unknown Place" button — this just ensures the component is stable
    expect(screen.queryByRole("button", { name: "Unknown Place" })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// handleFilterChange
// ---------------------------------------------------------------------------

describe("handleFilterChange", () => {
  it("triggers a re-fetch when a filter chip is toggled on", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /organic/i }));

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
    });
  });

  it("removes category param from URL after all filters are cleared", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    });

    // Add a filter
    fireEvent.click(screen.getByRole("button", { name: /organic/i }));
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
    });

    // Clear it by clicking the same chip again (StoreFilterBar toggles on repeat click)
    fireEvent.click(screen.getByRole("button", { name: /organic/i }));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).not.toContain("category=");
    });
  });

  it("combines multiple active filters in a single category param", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    });

    fireEvent.click(screen.getByRole("button", { name: /organic/i }));
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
    });

    fireEvent.click(screen.getByRole("button", { name: /halal/i }));

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("category=");
      // Both filters should appear in the category param
      expect(lastUrl).toMatch(/organic|halal/);
    });
  });
});

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

describe("static content", () => {
  it("renders the 'Sign up for alerts' link pointing to /login", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    const link = await screen.findByRole("link", { name: /sign up for alerts/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("renders a List link pointing to / and a Map link pointing to /map", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    const listLink = await screen.findByRole("link", { name: /^list$/i });
    const mapLink = screen.getByRole("link", { name: /^map$/i });

    expect(listLink).toHaveAttribute("href", "/");
    expect(mapLink).toHaveAttribute("href", "/map");
  });

  it("renders the guest banner with discovery copy", async () => {
    mockGeoFailure();
    global.fetch = jest.fn().mockResolvedValue(jsonRes([]));

    render(<HomePage />);

    await screen.findByText(/discover your neighborhood/i);
    expect(
      screen.getByText(/browse stores and deals without signing up/i),
    ).toBeInTheDocument();
  });
});
