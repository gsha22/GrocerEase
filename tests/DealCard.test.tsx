import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import DealCard, { sanitizeDescription } from "@/components/DealCard";

const baseDeal = {
  id: "d1",
  title: "Fresh Apples",
  description: null,
  price: "1.99",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

describe("sanitizeDescription", () => {
  it("returns null for null input", () => {
    expect(sanitizeDescription(null)).toBeNull();
  });

  it("returns null when description starts with seed phrase", () => {
    expect(sanitizeDescription("bulk-seeded deal for testing")).toBeNull();
  });

  it("matches seed phrase case-insensitively at the start", () => {
    expect(sanitizeDescription("Bulk-Seeded Deal")).toBeNull();
    expect(sanitizeDescription("BULK-SEEDED DEAL placeholder")).toBeNull();
  });

  it("suppresses descriptions with leading whitespace before the seed phrase", () => {
    expect(sanitizeDescription("  bulk-seeded deal placeholder")).toBeNull();
    expect(sanitizeDescription("\t Bulk-Seeded Deal")).toBeNull();
  });

  it("does not suppress a description that contains the phrase mid-sentence", () => {
    expect(sanitizeDescription("This item was a bulk-seeded deal")).toBe(
      "This item was a bulk-seeded deal",
    );
  });

  it("returns the description unchanged for real copy", () => {
    expect(sanitizeDescription("50% off organic bananas this week")).toBe(
      "50% off organic bananas this week",
    );
  });

  it("returns null for an empty string (treated as no description)", () => {
    expect(sanitizeDescription("")).toBeNull();
  });
});

describe("DealCard", () => {
  it("hides description when it starts with seed copy", () => {
    render(
      <DealCard
        deal={{ ...baseDeal, description: "bulk-seeded deal placeholder" }}
      />,
    );
    expect(screen.queryByText(/bulk-seeded deal/i)).not.toBeInTheDocument();
  });

  it("shows description when it is real shopper-facing copy", () => {
    render(
      <DealCard
        deal={{ ...baseDeal, description: "Buy 2 get 1 free on all citrus" }}
      />,
    );
    expect(
      screen.getByText("Buy 2 get 1 free on all citrus"),
    ).toBeInTheDocument();
  });

  it("renders the title when description is null", () => {
    render(<DealCard deal={{ ...baseDeal, description: null }} />);
    expect(screen.getByText("Fresh Apples")).toBeInTheDocument();
  });

  it("shows the store name when showStore is true and storeName is set", () => {
    render(
      <DealCard
        deal={{ ...baseDeal, storeName: "Lotus Market" }}
        showStore={true}
      />,
    );
    expect(screen.getByText("Lotus Market")).toBeInTheDocument();
  });

  it("hides the store name when showStore is false", () => {
    render(
      <DealCard
        deal={{ ...baseDeal, storeName: "Lotus Market" }}
        showStore={false}
      />,
    );
    expect(screen.queryByText("Lotus Market")).not.toBeInTheDocument();
  });
});
