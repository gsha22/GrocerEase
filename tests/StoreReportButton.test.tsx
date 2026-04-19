/**
 * Story 17 — Report incorrect info (#121)
 *
 * Covers the shopper-facing report button:
 *   - Non-shopper viewers see the sign-in CTA instead of the form.
 *   - Shoppers can open the form, pick a type chip, and submit.
 *   - Submit POSTs to /api/stores/:id/report with the selected type.
 *   - Successful submit swaps in the "Thanks — your report was submitted" ack.
 *   - A 429 duplicate response surfaces the server's friendly error message.
 *
 * Tracking issue: #130
 */
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import StoreReportButton from "@/components/StoreReportButton";

jest.mock("next/link", () => ({
  __esModule: true,
  default({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

describe("StoreReportButton — viewer role gating", () => {
  it("shows a sign-in CTA for logged-out viewers", () => {
    render(<StoreReportButton storeId="store-1" viewerRole={null} />);
    const link = screen.getByRole("link", { name: /sign in as a shopper/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toContain("/shopper/login");
    expect(link.getAttribute("href")).toContain("callbackUrl=");
  });

  it("shows a sign-in CTA for owner viewers (wrong account type)", () => {
    render(<StoreReportButton storeId="store-1" viewerRole="owner" />);
    expect(
      screen.getByRole("link", { name: /sign in as a shopper/i }),
    ).toBeInTheDocument();
  });

  it("renders the report trigger for shoppers", () => {
    render(<StoreReportButton storeId="store-1" viewerRole="shopper" />);
    expect(
      screen.getByRole("button", { name: /report incorrect info/i }),
    ).toBeInTheDocument();
  });
});

describe("StoreReportButton — shopper flow", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("submits the selected type and shows the acknowledgement", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response);

    render(<StoreReportButton storeId="store-42" viewerRole="shopper" />);
    await userEvent.click(
      screen.getByRole("button", { name: /report incorrect info/i }),
    );

    // Select a non-default chip to prove `type` flows through.
    await userEvent.click(screen.getByRole("button", { name: /hours wrong/i }));

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /send report/i }),
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/stores/store-42/report",
        expect.objectContaining({ method: "POST" }),
      );
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({ type: "incorrect_hours" });

    expect(
      await screen.findByText(/thanks — your report was submitted/i),
    ).toBeInTheDocument();
  });

  it("surfaces the server error on 429 dedupe", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: "You already reported this store recently. Try again later.",
      }),
    } as Response);

    render(<StoreReportButton storeId="store-42" viewerRole="shopper" />);
    await userEvent.click(
      screen.getByRole("button", { name: /report incorrect info/i }),
    );

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /send report/i }),
      );
    });

    expect(
      await screen.findByText(/already reported this store recently/i),
    ).toBeInTheDocument();
    // Still in form, not acknowledged.
    expect(
      screen.queryByText(/thanks — your report was submitted/i),
    ).not.toBeInTheDocument();
  });
});
