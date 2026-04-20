/**
 * Story 15 — Shopper ratings (#119)
 *
 * Covers the ratings panel on the store profile:
 *   - Aggregate header renders average + total when ratings exist, and a
 *     "no ratings yet" copy otherwise.
 *   - Logged-out viewers see the sign-in CTA.
 *   - Shoppers without an existing rating can pick stars, submit, and see
 *     their rating appear in the "Your rating" card.
 *   - Shoppers with an existing rating can delete it, which hits
 *     DELETE /api/stores/:id/ratings/:ratingId and restores the form.
 *
 * Tracking issue: #128
 */
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StoreRatingsPanel from "@/components/StoreRatingsPanel";

jest.mock("next/link", () => ({
  __esModule: true,
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

const EMPTY_SUMMARY = {
  average: null,
  total: 0,
  ratings: [],
  hasMore: false,
};

const POPULATED_SUMMARY = {
  average: 4.3,
  total: 12,
  ratings: [
    {
      id: "r-1",
      score: 5,
      note: "Best produce in Bloomfield.",
      createdAt: "2026-04-01T12:00:00.000Z",
      authorName: "Alex",
    },
  ],
  hasMore: false,
};

describe("StoreRatingsPanel — aggregate header", () => {
  it("shows 'no ratings yet' when average is null", () => {
    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole={null}
        initialSummary={EMPTY_SUMMARY}
        initialOwnRating={null}
      />,
    );
    expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
  });

  it("shows the average and total when ratings exist", () => {
    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole={null}
        initialSummary={POPULATED_SUMMARY}
        initialOwnRating={null}
      />,
    );
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText(/12 ratings/i)).toBeInTheDocument();
    expect(screen.getByText(/best produce in bloomfield/i)).toBeInTheDocument();
  });
});

describe("StoreRatingsPanel — viewer-role gating", () => {
  it("shows a sign-in CTA for logged-out viewers", () => {
    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole={null}
        initialSummary={EMPTY_SUMMARY}
        initialOwnRating={null}
      />,
    );
    const link = screen.getByRole("link", { name: /sign in as a shopper/i });
    expect(link.getAttribute("href")).toContain("/shopper/login");
  });

  it("shows the same CTA for owner viewers", () => {
    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole="owner"
        initialSummary={EMPTY_SUMMARY}
        initialOwnRating={null}
      />,
    );
    expect(
      screen.getByRole("link", { name: /sign in as a shopper/i }),
    ).toBeInTheDocument();
  });
});

describe("StoreRatingsPanel — shopper submit flow", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POSTs the selected score and renders 'Your rating' on success", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return {
            ok: true,
            json: async () => ({
              rating: { id: "new-1", score: 4, note: "solid" },
            }),
          } as Response;
        }
        return { ok: true, json: async () => POPULATED_SUMMARY } as Response;
      },
    );

    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole="shopper"
        initialSummary={EMPTY_SUMMARY}
        initialOwnRating={null}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /4 stars/i }));
    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /submit rating/i }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/your rating/i)).toBeInTheDocument();
    });
    expect(screen.getByText("4/5")).toBeInTheDocument();

    const postCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeTruthy();
    expect(postCall?.[0]).toBe("/api/stores/s1/ratings");
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      score: 4,
    });
  });

  it("deletes the shopper's own rating via DELETE", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "DELETE") {
          return { ok: true, json: async () => ({}) } as Response;
        }
        return { ok: true, json: async () => EMPTY_SUMMARY } as Response;
      },
    );

    render(
      <StoreRatingsPanel
        storeId="s1"
        viewerRole="shopper"
        initialSummary={POPULATED_SUMMARY}
        initialOwnRating={{ id: "mine-1", score: 5, note: "love it" }}
      />,
    );

    expect(screen.getByText(/your rating/i)).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /delete my rating/i }),
      );
    });

    const deleteCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "DELETE",
    );
    expect(deleteCall?.[0]).toBe("/api/stores/s1/ratings/mine-1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /submit rating/i }),
      ).toBeInTheDocument();
    });
  });
});
