import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  normalizeAlertsPayload,
  toRelativeTime,
} from "@/components/ItemAvailabilitySearch";
import ItemAvailabilitySearch from "@/components/ItemAvailabilitySearch";

// ---------------------------------------------------------------------------
// normalizeAlertsPayload
// ---------------------------------------------------------------------------

describe("normalizeAlertsPayload", () => {
  it("returns the array directly when payload is an array", () => {
    const alerts = [{ id: "1", itemId: "i1", storeId: "s1", type: "item_restock" }];
    expect(normalizeAlertsPayload(alerts)).toEqual(alerts);
  });

  it("returns the alerts property when payload is an object with alerts array", () => {
    const inner = [{ id: "2", itemId: "i2", storeId: "s2", type: "item_restock" }];
    expect(normalizeAlertsPayload({ alerts: inner })).toEqual(inner);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["object without alerts", { other: "data" }],
    ["non-array alerts property", { alerts: "not-an-array" }],
    ["empty array", []],
  ])("returns [] for %s", (_, payload) => {
    expect(normalizeAlertsPayload(payload as unknown)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// toRelativeTime
// ---------------------------------------------------------------------------

describe("toRelativeTime", () => {
  it("returns 'updated recently' for an invalid date string", () => {
    expect(toRelativeTime("not-a-date")).toBe("updated recently");
  });

  it("returns a minutes-relative string for a timestamp less than an hour ago", () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60_000).toISOString();
    const result = toRelativeTime(thirtyMinutesAgo);
    expect(result).toMatch(/minute/);
  });

  it("returns an hours-relative string for a timestamp several hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60_000).toISOString();
    const result = toRelativeTime(threeHoursAgo);
    expect(result).toMatch(/hour/);
  });

  it("returns a days-relative string for a timestamp more than 24 hours ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString();
    const result = toRelativeTime(twoDaysAgo);
    expect(result).toMatch(/day/);
  });

  it("returns a future minutes-relative string for a timestamp in the future", () => {
    const inTenMinutes = new Date(Date.now() + 10 * 60_000).toISOString();
    const result = toRelativeTime(inTenMinutes);
    expect(result).toMatch(/minute/);
  });
});

// ---------------------------------------------------------------------------
// ItemAvailabilitySearch component helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  storeId: "store-abc",
  storeName: "GreenMart",
  storeAddress: "123 Main St",
};

const mockItem = {
  id: "item-1",
  name: "Bok Choy",
  stock_count: 5,
  in_stock: true,
  store_id: "store-abc",
  store_name: "GreenMart",
  store_location: "123 Main St",
  last_updated: new Date(Date.now() - 60 * 60_000).toISOString(),
};

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering / search UI
// ---------------------------------------------------------------------------

describe("ItemAvailabilitySearch — renders search UI", () => {
  it("renders the 'Search Inventory' heading", () => {
    render(<ItemAvailabilitySearch {...defaultProps} />);
    expect(screen.getByText("Search Inventory")).toBeInTheDocument();
  });

  it("renders the search input and button", () => {
    render(<ItemAvailabilitySearch {...defaultProps} />);
    expect(screen.getByPlaceholderText(/bok choy/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("disables the Search button when the query is empty", () => {
    render(<ItemAvailabilitySearch {...defaultProps} />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
  });

  it("enables the Search button when a query is typed", () => {
    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "milk" },
    });
    expect(screen.getByRole("button", { name: /search/i })).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------
// queryHint (useMemo) — empty state message
// ---------------------------------------------------------------------------

describe("ItemAvailabilitySearch — queryHint in empty state", () => {
  it("shows the trimmed query in the no-results message", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    const input = screen.getByPlaceholderText(/bok choy/i);
    fireEvent.change(input, { target: { value: "  tofu  " } });
    fireEvent.submit(input.closest("form")!);

    await screen.findByText(/no matches found for/i);
    expect(screen.getByText(/no matches found for/i).textContent).toContain("tofu");
  });

  it("does not show the no-results message before a search is performed", () => {
    render(<ItemAvailabilitySearch {...defaultProps} />);
    expect(screen.queryByText(/no matches found/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// runSearch
// ---------------------------------------------------------------------------

describe("ItemAvailabilitySearch — runSearch", () => {
  it("calls the correct API endpoint with query and location params", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    const input = screen.getByPlaceholderText(/bok choy/i);
    fireEvent.change(input, { target: { value: "spinach" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/stores/store-abc/items"),
      );
    });

    const [firstCallUrl] = (global.fetch as jest.Mock).mock.calls[0];
    expect(firstCallUrl).toContain("q=spinach");
    expect(firstCallUrl).toContain("location=");
  });

  it("displays results returned by the API", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockItem],
      } as Response)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "bok choy" },
    });
    fireEvent.submit(screen.getByPlaceholderText(/bok choy/i).closest("form")!);

    await screen.findByText("Bok Choy");
    expect(screen.getByText("In-Stock")).toBeInTheDocument();
  });

  it("shows no-results message when API returns an empty array", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "unicorn" },
    });
    fireEvent.submit(screen.getByPlaceholderText(/bok choy/i).closest("form")!);

    await screen.findByText(/no matches found/i);
  });

  it("clears results and shows no-results when the API response is not ok", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => null } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "nothing" },
    });
    fireEvent.submit(screen.getByPlaceholderText(/bok choy/i).closest("form")!);

    await screen.findByText(/no matches found/i);
  });

  it("does not fetch when the query is only whitespace", () => {
    global.fetch = jest.fn();
    render(<ItemAvailabilitySearch {...defaultProps} />);
    const input = screen.getByPlaceholderText(/bok choy/i);
    fireEvent.change(input, { target: { value: "   " } });
    // button stays disabled so submit won't fire naturally; simulate it anyway
    fireEvent.submit(input.closest("form")!);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// toggleNotify — alert creation and deletion
// ---------------------------------------------------------------------------

describe("ItemAvailabilitySearch — toggleNotify", () => {
  async function renderWithResult() {
    global.fetch = jest.fn()
      // runSearch
      .mockResolvedValueOnce({ ok: true, json: async () => [mockItem] } as Response)
      // useEffect alerts load (status 200, no alerts yet)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "bok choy" },
    });
    fireEvent.submit(screen.getByPlaceholderText(/bok choy/i).closest("form")!);
    await screen.findByText("Bok Choy");
  }

  it("shows 'Notify me' button for each result", async () => {
    await renderWithResult();
    expect(screen.getByRole("button", { name: /notify me/i })).toBeInTheDocument();
  });

  it("creates an alert when Notify me is clicked and user is authenticated", async () => {
    await renderWithResult();

    // toggleNotify: probe → 200, POST → ok
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "alert-new" }) } as Response);

    fireEvent.click(screen.getByRole("button", { name: /^notify me$/i }));

    await screen.findByRole("button", { name: /notify me: on/i });
  });

  it("shows auth prompt when unauthenticated user clicks Notify me", async () => {
    await renderWithResult();

    // toggleNotify probe returns 401
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: async () => null,
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: /^notify me$/i }));

    await screen.findByText(/log in as a shopper/i);
  });

  it("deletes an alert when Notify me: On is clicked", async () => {
    // Start with an active alert for the item
    global.fetch = jest.fn()
      // runSearch
      .mockResolvedValueOnce({ ok: true, json: async () => [mockItem] } as Response)
      // useEffect alert load — alert is ON
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => [{ id: "alert-1", itemId: "item-1", storeId: "store-abc", type: "item_restock" }],
      } as Response);

    render(<ItemAvailabilitySearch {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/bok choy/i), {
      target: { value: "bok choy" },
    });
    fireEvent.submit(screen.getByPlaceholderText(/bok choy/i).closest("form")!);
    await screen.findByRole("button", { name: /notify me: on/i });

    // toggleNotify: probe → 200, list → alert present, DELETE → ok
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ status: 200, ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "alert-1", itemId: "item-1", storeId: "store-abc", type: "item_restock" }],
      } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

    fireEvent.click(screen.getByRole("button", { name: /notify me: on/i }));

    await screen.findByRole("button", { name: /^notify me$/i });
  });
});
