import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import StoreCard, { heroEmoji, type StoreData } from "@/components/StoreCard";

describe("heroEmoji", () => {
  it("returns category emoji for asian", () => {
    expect(heroEmoji(["asian"])).toBeTruthy();
  });

  it("returns first matching specialty emoji when multiple categories", () => {
    const e = heroEmoji(["produce", "halal"]);
    expect(e).toBeTruthy();
  });

  it("returns cart fallback when no known category", () => {
    expect(heroEmoji(["unknown"])).toBe("\u{1F6D2}");
  });

  it("matches case-insensitively", () => {
    expect(heroEmoji(["HALAL"])).toBeTruthy();
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
});
