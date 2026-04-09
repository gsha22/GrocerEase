import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import StoreFreshUpdatesFeed from "@/components/StoreFreshUpdatesFeed";

jest.mock("../lib/time", () => ({
  relativeTime: () => "posted 1h ago",
}));

describe("StoreFreshUpdatesFeed", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ updates: [] }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty state when there are no updates", () => {
    render(
      <StoreFreshUpdatesFeed storeId="s1" initialUpdates={[]} />,
    );
    expect(screen.getByText("No recent updates")).toBeInTheDocument();
    expect(
      screen.getByText(/hasn't posted any inventory updates/i),
    ).toBeInTheDocument();
  });

  it("renders item names and relative time for each update", () => {
    render(
      <StoreFreshUpdatesFeed
        storeId="s1"
        initialUpdates={[
          {
            id: "1",
            itemName: "Daikon",
            note: "Limited",
            createdAt: new Date().toISOString(),
            isStale: false,
          },
        ]}
      />,
    );
    expect(screen.getByText("Daikon")).toBeInTheDocument();
    expect(screen.getByText("Limited")).toBeInTheDocument();
    expect(screen.getByText("posted 1h ago")).toBeInTheDocument();
  });

  it("applies stale styling class when isStale is true", () => {
    const { container } = render(
      <StoreFreshUpdatesFeed
        storeId="s1"
        initialUpdates={[
          {
            id: "1",
            itemName: "Old item",
            note: null,
            createdAt: new Date().toISOString(),
            isStale: true,
          },
        ]}
      />,
    );
    const row = container.querySelector(".opacity-40");
    expect(row).toBeTruthy();
  });

  it("does not render a note element when note is null", () => {
    const { container } = render(
      <StoreFreshUpdatesFeed
        storeId="s1"
        initialUpdates={[
          {
            id: "1",
            itemName: "Spinach",
            note: null,
            createdAt: new Date().toISOString(),
            isStale: false,
          },
        ]}
      />,
    );
    // The note sub-div is only rendered when note is truthy
    const noteEl = container.querySelector(".text-gray-400.mt-0\\.5");
    expect(noteEl).toBeNull();
  });

  it("does not clear existing updates when fetch returns an error response", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    const esInstances: Array<{
      url: string;
      listeners: Record<string, () => void>;
    }> = [];
    const orig = global.EventSource;
    global.EventSource = class MockES {
      listeners: Record<string, () => void> = {};
      constructor(public url: string) {
        esInstances.push(this);
      }
      addEventListener(type: string, fn: () => void) {
        this.listeners[type] = fn;
      }
      removeEventListener() {}
      close() {}
    } as unknown as typeof EventSource;

    render(
      <StoreFreshUpdatesFeed
        storeId="s2"
        initialUpdates={[
          {
            id: "1",
            itemName: "Existing item",
            note: null,
            createdAt: new Date().toISOString(),
            isStale: false,
          },
        ]}
      />,
    );

    // Fire the SSE event — the fetch will return ok:false
    esInstances[0].listeners["post-event"]();

    // Existing updates must still be visible
    await waitFor(() => {
      expect(screen.getByText("Existing item")).toBeInTheDocument();
    });

    global.EventSource = orig;
  });

  it("reloads updates when fetch returns new data", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        updates: [
          {
            id: "2",
            itemName: "After reload",
            note: null,
            createdAt: new Date().toISOString(),
            isStale: false,
          },
        ],
      }),
    } as Response);

    const esInstances: Array<{
      url: string;
      listeners: Record<string, () => void>;
    }> = [];
    const orig = global.EventSource;
    global.EventSource = class MockES {
      listeners: Record<string, () => void> = {};
      constructor(public url: string) {
        esInstances.push(this);
      }
      addEventListener(type: string, fn: () => void) {
        this.listeners[type] = fn;
      }
      removeEventListener() {}
      close() {}
    } as unknown as typeof EventSource;

    render(
      <StoreFreshUpdatesFeed
        storeId="store-x"
        initialUpdates={[
          {
            id: "1",
            itemName: "Before",
            note: null,
            createdAt: new Date().toISOString(),
            isStale: false,
          },
        ]}
      />,
    );

    const inst = esInstances[0];
    expect(inst.url).toContain("/api/stores/store-x/posts/events");
    inst.listeners["post-event"]();

    await waitFor(() => {
      expect(screen.getByText("After reload")).toBeInTheDocument();
    });

    global.EventSource = orig;
  });
});
