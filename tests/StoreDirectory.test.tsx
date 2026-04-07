import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StoreDirectory, {
  buildStoreDirectoryFetchUrl,
} from "@/components/StoreDirectory";

describe("buildStoreDirectoryFetchUrl", () => {
  it("returns bare /api/stores when no filters", () => {
    expect(buildStoreDirectoryFetchUrl(new Set())).toBe("/api/stores");
  });

  it("joins category keys with comma for AND semantics", () => {
    const url = buildStoreDirectoryFetchUrl(new Set(["halal", "organic"]));
    expect(url).toBe("/api/stores?category=halal%2Corganic");
  });
});

describe("StoreDirectory", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(async (input) => {
      const u = String(input);
      if (u.includes("category=")) {
        return {
          ok: true,
          json: async () => [],
        } as Response;
      }
      return {
        ok: true,
        json: async () => [
          {
            id: "1",
            name: "Test Mart",
            address: "1 Main St",
            lat: 40,
            lng: -80,
            categories: ["organic"],
            hours: {},
            distanceMiles: 1.2,
          },
        ],
      } as Response;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads and displays store cards after initial fetch", async () => {
    render(<StoreDirectory />);
    await waitFor(() => {
      expect(screen.getByText("Test Mart")).toBeInTheDocument();
    });
    expect(screen.getByText(/1 store found/i)).toBeInTheDocument();
  });

  it("shows empty copy when API returns no rows with active filters", async () => {
    const user = userEvent.setup();
    render(<StoreDirectory />);
    await waitFor(() => screen.getByText("Test Mart"));
    await user.click(screen.getByRole("button", { name: /halal/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/No stores match the selected filters/i),
      ).toBeInTheDocument();
    });
  });
});
