/**
 * Story 16 — Map category filters (#120)
 *
 * Covers the UI + URL-wiring contract of the filter bar on /map:
 *   - buildMapStoresApiUrl serializes selected categories as a comma-separated
 *     `category=` query param and omits the param when nothing is selected.
 *   - The map page renders the filter chips and the store-card category tags.
 *   - Toggling a chip refetches /api/stores with the category param.
 *   - The empty header copy distinguishes "no filters at all" from
 *     "filters selected but no match".
 *
 * Tracking issue: #129
 */
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import MapPage, { buildMapStoresApiUrl } from "@/app/(public)/map/page";

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () =>
    function FakeMap() {
      return <div data-testid="store-map">map</div>;
    },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

function mockGeolocationSuccess() {
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
}

const ASIAN_STORE = {
  id: "asian-1",
  name: "Lotus Asian Market",
  address: "100 Penn Ave",
  lat: 40.5,
  lng: -80.1,
  categories: ["asian"],
  distanceMiles: 0.5,
};

describe("buildMapStoresApiUrl — categories", () => {
  it("omits the category param when none are selected", () => {
    expect(buildMapStoresApiUrl(40.44, -79.99, new Set())).not.toContain(
      "category=",
    );
  });

  it("joins multiple categories with commas", () => {
    const url = buildMapStoresApiUrl(
      40.44,
      -79.99,
      new Set(["asian", "halal"]) as Set<"asian" | "halal">,
    );
    expect(url).toContain("category=asian%2Chalal");
  });

  it("serializes category only, even without coords", () => {
    const url = buildMapStoresApiUrl(
      null,
      null,
      new Set(["produce"]) as Set<"produce">,
    );
    expect(url).toBe("/api/stores?category=produce");
  });
});

describe("MapPage — category filter UI", () => {
  beforeEach(() => {
    mockGeolocationSuccess();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [ASIAN_STORE],
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders a row of category filter chips", async () => {
    render(<MapPage />);
    await waitFor(() =>
      expect(screen.getByTestId("store-map")).toBeInTheDocument(),
    );
    // At minimum the four primary discovery categories from the issue.
    expect(
      screen.getByRole("button", { name: /asian/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /halal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /produce/i }),
    ).toBeInTheDocument();
  });

  it("shows category tags on each store card under the map", async () => {
    render(<MapPage />);
    await waitFor(() => {
      expect(screen.getByText("Lotus Asian Market")).toBeInTheDocument();
    });
    // The card surfaces the 'asian' tag from ASIAN_STORE.categories
    expect(screen.getAllByText("asian").length).toBeGreaterThan(0);
  });

  it("refetches /api/stores with category=asian when the Asian chip is toggled", async () => {
    const fetchMock = global.fetch as jest.Mock;
    render(<MapPage />);
    await waitFor(() =>
      expect(screen.getByTestId("store-map")).toBeInTheDocument(),
    );
    fetchMock.mockClear();

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /asian/i }));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("category=asian"),
      );
    });
  });

  it("shows the filtered empty-state copy when no stores match", async () => {
    const fetchMock = global.fetch as jest.Mock;
    // First call returns one store (initial load); after filter selection,
    // return an empty array to simulate "no matches".
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [ASIAN_STORE],
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

    render(<MapPage />);
    await waitFor(() =>
      expect(screen.getByText("Lotus Asian Market")).toBeInTheDocument(),
    );

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /halal/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No stores match the selected filters/i),
      ).toBeInTheDocument();
    });
  });
});
