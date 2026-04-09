import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import StoreCard, { heroEmoji, type StoreData } from "@/components/StoreCard";

describe("heroEmoji", () => {
  it("returns the chopstick bowl emoji for asian", () => {
    expect(heroEmoji(["asian"])).toBe("\u{1F962}");
  });

  it("returns the first matching emoji when multiple categories are given", () => {
    // "produce" maps to 🥦 (\u{1F966}); "halal" maps to ☪ (\u262A)
    // Since "produce" is listed first it wins
    expect(heroEmoji(["produce", "halal"])).toBe("\u{1F966}");
  });

  it("returns cart fallback when no known category", () => {
    expect(heroEmoji(["unknown"])).toBe("\u{1F6D2}");
  });

  it("matches case-insensitively", () => {
    expect(heroEmoji(["HALAL"])).toBe("\u262A");
  });

  it("returns cart for empty categories", () => {
    expect(heroEmoji([])).toBe("\u{1F6D2}");
  });
});

describe("StoreCard", () => {
  const base: StoreData = {
    id: "s1",
    name: "Lotus Market",
    address: "100 Oak Ave, Pittsburgh, PA",
    lat: 40.44,
    lng: -79.99,
    categories: ["asian", "produce"],
    hours: {},
    distanceMiles: 0.8,
  };

  it("links to the store profile", () => {
    render(<StoreCard store={base} neighborhood="Shadyside" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/stores/s1");
  });

  it("shows store name and neighborhood when provided", () => {
    render(<StoreCard store={base} neighborhood="Shadyside" />);
    expect(screen.getByText("Lotus Market")).toBeInTheDocument();
    expect(screen.getByText(/Shadyside/)).toBeInTheDocument();
  });

  it("falls back to address when neighborhood is not provided", () => {
    render(<StoreCard store={base} />);
    expect(screen.getByText(/100 Oak Ave/)).toBeInTheDocument();
  });

  it("renders the distance when distanceMiles is set", () => {
    render(<StoreCard store={base} />);
    expect(screen.getByText(/0\.8 mi/)).toBeInTheDocument();
  });

  it("omits the distance when distanceMiles is null", () => {
    const noDistance: StoreData = { ...base, distanceMiles: null };
    render(<StoreCard store={noDistance} />);
    expect(screen.queryByText(/mi/)).not.toBeInTheDocument();
  });

  it("renders a tag for each category", () => {
    render(<StoreCard store={base} />);
    expect(screen.getByText("asian")).toBeInTheDocument();
    expect(screen.getByText("produce")).toBeInTheDocument();
  });

  it("renders no category tags when categories list is empty", () => {
    const noTags: StoreData = { ...base, categories: [] };
    render(<StoreCard store={noTags} />);
    expect(screen.queryByText("asian")).not.toBeInTheDocument();
  });
});
