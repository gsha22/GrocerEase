import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  dateInputToIso,
  isoToDateInput,
  dealIsActive,
  formatDealMeta,
} from "@/app/(dashboard)/dashboard/deals/ManageDealsClient";
import type { ApiDeal } from "@/app/(dashboard)/dashboard/deals/ManageDealsClient";

// ---------------------------------------------------------------------------
// dateInputToIso
// ---------------------------------------------------------------------------

describe("dateInputToIso", () => {
  it("converts a YYYY-MM-DD string to an ISO timestamp at end of UTC day", () => {
    const result = dateInputToIso("2025-03-20");
    expect(result).toBe("2025-03-20T23:59:59.999Z");
  });

  it("uses UTC so the day is not shifted by local timezone", () => {
    const result = dateInputToIso("2025-01-01");
    expect(result).toBe("2025-01-01T23:59:59.999Z");
  });

  it("handles a leap day correctly", () => {
    const result = dateInputToIso("2024-02-29");
    expect(result).toBe("2024-02-29T23:59:59.999Z");
  });

  it("handles end-of-year date correctly", () => {
    const result = dateInputToIso("2025-12-31");
    expect(result).toBe("2025-12-31T23:59:59.999Z");
  });
});

// ---------------------------------------------------------------------------
// isoToDateInput
// ---------------------------------------------------------------------------

describe("isoToDateInput", () => {
  it("extracts YYYY-MM-DD from a full ISO string", () => {
    const result = isoToDateInput("2025-03-20T23:59:59.999Z");
    expect(result).toBe("2025-03-20");
  });

  it("returns the date portion only, stripping the time", () => {
    const result = isoToDateInput("2026-07-04T00:00:00.000Z");
    expect(result).toBe("2026-07-04");
  });
});

// ---------------------------------------------------------------------------
// dealIsActive
// ---------------------------------------------------------------------------

describe("dealIsActive", () => {
  const makeDeal = (overrides: Partial<ApiDeal> = {}): ApiDeal => ({
    id: "deal-1",
    title: "Test Deal",
    description: "Buy one get one",
    price: "4.99",
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(), // expires tomorrow
    isExpired: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it("returns true when deal is not expired and expiresAt is in the future", () => {
    const deal = makeDeal();
    expect(dealIsActive(deal)).toBe(true);
  });

  it("returns false when isExpired flag is true even if expiresAt is in the future", () => {
    const deal = makeDeal({ isExpired: true });
    expect(dealIsActive(deal)).toBe(false);
  });

  it("returns false when expiresAt is in the past even if isExpired flag is false", () => {
    const deal = makeDeal({
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      isExpired: false,
    });
    expect(dealIsActive(deal)).toBe(false);
  });

  it("returns false when both isExpired is true and expiresAt is in the past", () => {
    const deal = makeDeal({
      expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
      isExpired: true,
    });
    expect(dealIsActive(deal)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatDealMeta
// ---------------------------------------------------------------------------

describe("formatDealMeta", () => {
  const makeDeal = (overrides: Partial<ApiDeal> = {}): ApiDeal => ({
    id: "deal-2",
    title: "Sale",
    description: "Great deal",
    price: "9.99",
    expiresAt: "2025-03-20T23:59:59.999Z", // Thursday, Mar 20
    isExpired: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it("includes formatted price and expiry when both are present", () => {
    const result = formatDealMeta(makeDeal());
    expect(result).toContain("$9.99");
    expect(result).toContain("Expires");
    expect(result).toContain("Mar 20");
    expect(result).toContain(" · ");
  });

  it("omits price separator when price is null", () => {
    const result = formatDealMeta(makeDeal({ price: null }));
    expect(result).not.toContain("$");
    expect(result).not.toContain(" · ");
    expect(result).toContain("Expires");
  });

  it("omits price separator when price is empty string", () => {
    const result = formatDealMeta(makeDeal({ price: "" }));
    expect(result).not.toContain("$");
    expect(result).not.toContain(" · ");
  });

  it("shows formatted price for a whole-dollar amount", () => {
    const result = formatDealMeta(makeDeal({ price: "5.00" }));
    expect(result).toContain("$5.00");
  });
});

// ---------------------------------------------------------------------------
// ManageDealsClient component — rendering and interaction
// ---------------------------------------------------------------------------

import ManageDealsClient from "@/app/(dashboard)/dashboard/deals/ManageDealsClient";

const mockDeals: ApiDeal[] = [
  {
    id: "active-1",
    title: "Weekend Sale",
    description: "20% off produce",
    price: "0.00",
    expiresAt: new Date(Date.now() + 86_400_000 * 3).toISOString(),
    isExpired: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "past-1",
    title: "Old Deal",
    description: "Expired promo",
    price: "2.50",
    expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
    isExpired: true,
    createdAt: new Date().toISOString(),
  },
];

function setupFetchMock(deals: ApiDeal[] = mockDeals) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ deals }),
  } as Response);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ManageDealsClient component", () => {
  it("renders the 'Post a deal' form heading", async () => {
    setupFetchMock([]);
    render(<ManageDealsClient storeId="store-123" />);
    expect(screen.getByText("Post a deal")).toBeInTheDocument();
  });

  it("shows a loading indicator while deals are being fetched", () => {
    // Never-resolving fetch to keep the loading state visible
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    render(<ManageDealsClient storeId="store-123" />);
    expect(screen.getByText(/loading deals/i)).toBeInTheDocument();
  });

  it("shows 'No deals yet' when the store has no deals", async () => {
    setupFetchMock([]);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText(/no deals yet/i);
  });

  it("displays active deal titles after loading", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Weekend Sale");
  });

  it("shows error message when the load fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    } as Response);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Unauthorized");
  });

  it("shows a form validation error if expiry date is missing on submit", async () => {
    setupFetchMock([]);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText(/no deals yet/i);

    // Fill in price and description but leave expiry date blank
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 4\.99/i), {
      target: { value: "3.99" },
    });
    fireEvent.change(screen.getByPlaceholderText(/what shoppers get/i), {
      target: { value: "Buy 2 get 1 free" },
    });

    // Submit the form directly to bypass HTML5 constraint validation in jsdom
    const form = screen.getByRole("button", { name: /post deal/i }).closest("form")!;
    fireEvent.submit(form);
    expect(screen.getByText(/expiry date is required/i)).toBeInTheDocument();
  });

  it("shows an edit form when the Edit button is clicked on an active deal", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Weekend Sale");

    const editButton = screen.getByRole("button", { name: /^edit$/i });
    fireEvent.click(editButton);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("hides the edit form when Cancel is clicked", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Weekend Sale");

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("shows validation error in edit form when price is cleared and saved", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Weekend Sale");

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    // The edit form renders a "Price (USD)" label — use it to find the input
    const priceLabel = screen.getAllByText(/price \(usd\)/i)[1]; // second is the edit form label
    const priceInput = priceLabel.parentElement!.querySelector("input")!;
    fireEvent.change(priceInput, { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText(/price is required/i);
  });

  it("shows a reuse date input for expired/inactive deals", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Old Deal");

    // The past deal section should show a date input for the reuse feature
    const dateInputs = screen.getAllByDisplayValue("");
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it("shows an error when reuse is clicked without a date", async () => {
    setupFetchMock(mockDeals);
    render(<ManageDealsClient storeId="store-123" />);
    await screen.findByText("Old Deal");

    const reuseButton = screen.getByRole("button", { name: /reuse with new expiry/i });
    fireEvent.click(reuseButton);

    expect(
      screen.getByText(/choose a new expiry date before reusing/i),
    ).toBeInTheDocument();
  });
});
