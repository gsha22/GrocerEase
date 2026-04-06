/**
 * Tests map to `ManageFreshUpdatesClient.tsx` only (no extra behaviors).
 * Each case targets one function or one distinct branch: load (!res.ok + error
 * parsing), onSubmit, beginEdit/cancelEdit, saveEdit, deletePost.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageFreshUpdatesClient from "@/app/(dashboard)/dashboard/posts/ManageFreshUpdatesClient";

jest.mock("next/link", () => ({
  __esModule: true,
  default({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response;
}

const STORE_ID = "store-test-1";

const sampleUpdate = {
  id: "post-1",
  itemName: "Bok Choy",
  note: "Just in",
  createdAt: "2026-04-05T12:00:00.000Z",
  isStale: false,
};

describe("ManageFreshUpdatesClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe("load", () => {
    it("GETs /api/stores/:id/updates?all=true with AbortSignal; empty list shows copy and headings", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      expect(
        screen.getByRole("heading", { name: /post a fresh update/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /your recent updates/i }),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/no updates yet/i)).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/stores/${STORE_ID}/updates?all=true`,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it("renders rows from res.json().updates when res.ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [sampleUpdate] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Bok Choy")).toBeInTheDocument();
      });
    });

    it("when !res.ok, uses data.error when the JSON body has a non-empty string error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ error: "Not allowed" }, false),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Not allowed")).toBeInTheDocument();
      });
    });

    it("when !res.ok, falls back to the default message if error is missing", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({}, false));

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Could not load updates. Refresh the page or sign in again.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("onSubmit", () => {
    it("sets error Item name is required. if trim(itemName) is empty (no POST)", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText(/no updates yet/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /post update/i }));

      expect(screen.getByText("Item name is required.")).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("POSTs JSON body, clears fields, sets success, calls load again on res.ok", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse({ updates: [] }))
        .mockResolvedValueOnce(jsonResponse({}))
        .mockResolvedValueOnce(
          jsonResponse({
            updates: [
              {
                ...sampleUpdate,
                id: "new-post",
                itemName: "Lamb",
                note: "Halal",
              },
            ],
          }),
        );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText(/no updates yet/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/item name/i), "  Lamb  ");
      await user.type(screen.getByLabelText(/note \(optional\)/i), "  Halal  ");
      await user.click(screen.getByRole("button", { name: /post update/i }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Posted. Shoppers will see it on your store page right away.",
          ),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/item name/i)).toHaveValue("");
      expect(screen.getByLabelText(/note \(optional\)/i)).toHaveValue("");

      const postCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (c) =>
          c[0] === `/api/stores/${STORE_ID}/updates` &&
          c[1]?.method === "POST",
      );
      expect(postCalls).toHaveLength(1);
      expect(JSON.parse(postCalls[0][1].body as string)).toEqual({
        item_name: "Lamb",
        note: "Halal",
      });

      const getCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (c) => c[0] === `/api/stores/${STORE_ID}/updates?all=true`,
      );
      expect(getCalls.length).toBeGreaterThanOrEqual(2);
    });

    it("sets error from data.error when POST !res.ok", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse({ updates: [] }))
        .mockResolvedValueOnce(jsonResponse({ error: "Rate limited" }, false));

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText(/no updates yet/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/item name/i), "Spinach");
      await user.click(screen.getByRole("button", { name: /post update/i }));

      await waitFor(() => {
        expect(screen.getByText("Rate limited")).toBeInTheDocument();
      });
    });
  });

  describe("beginEdit and cancelEdit", () => {
    it("Edit copies row into edit fields; Cancel clears edit state and shows the row again", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [sampleUpdate] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Bok Choy")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(
        screen.getByRole("textbox", { name: /edit item name/i }),
      ).toHaveValue("Bok Choy");
      expect(screen.getByRole("textbox", { name: /edit note/i })).toHaveValue(
        "Just in",
      );

      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      expect(
        screen.queryByRole("textbox", { name: /edit item name/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Bok Choy")).toBeInTheDocument();
    });
  });

  describe("saveEdit", () => {
    it("sets error Item name is required. if trim(editItemName) is empty (no PATCH)", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [sampleUpdate] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Bok Choy")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^edit$/i }));
      await user.clear(screen.getByRole("textbox", { name: /edit item name/i }));
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(screen.getByText("Item name is required.")).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("PATCHes post, merges data.post into state, cancelEdit, success Post updated.", async () => {
      const user = userEvent.setup();
      const updated = {
        id: "post-1",
        itemName: "Baby Bok Choy",
        note: "Limited",
        createdAt: "2026-04-05T12:00:00.000Z",
      };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse({ updates: [sampleUpdate] }))
        .mockResolvedValueOnce(
          jsonResponse({
            post: updated,
          }),
        );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Bok Choy")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^edit$/i }));
      await user.clear(screen.getByRole("textbox", { name: /edit item name/i }));
      await user.type(
        screen.getByRole("textbox", { name: /edit item name/i }),
        "Baby Bok Choy",
      );
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(screen.getByText("Post updated.")).toBeInTheDocument();
      });

      expect(screen.getByText("Baby Bok Choy")).toBeInTheDocument();

      const patchCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (c) =>
          c[0] === `/api/stores/${STORE_ID}/posts/post-1` &&
          c[1]?.method === "PATCH",
      );
      expect(patchCalls).toHaveLength(1);
      expect(JSON.parse(patchCalls[0][1].body as string)).toEqual({
        item_name: "Baby Bok Choy",
        note: "Just in",
      });
    });
  });

  describe("deletePost", () => {
    it("returns before fetch when window.confirm is false", async () => {
      const user = userEvent.setup();
      jest.spyOn(window, "confirm").mockReturnValue(false);
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ updates: [sampleUpdate] }),
      );

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Bok Choy")).toBeInTheDocument();
      });

      const row = screen.getByText("Bok Choy").closest("li")!;
      await user.click(within(row).getByRole("button", { name: /^delete$/i }));

      expect(window.confirm).toHaveBeenCalledWith(
        "Delete this post? This cannot be undone.",
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("DELETE succeeds: filters post out, sets Post deleted.", async () => {
      const user = userEvent.setup();
      jest.spyOn(window, "confirm").mockReturnValue(true);
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(
          jsonResponse({
            updates: [
              sampleUpdate,
              { ...sampleUpdate, id: "post-2", itemName: "Spinach" },
            ],
          }),
        )
        .mockResolvedValueOnce(jsonResponse({}));

      render(<ManageFreshUpdatesClient storeId={STORE_ID} />);

      await waitFor(() => {
        expect(screen.getByText("Spinach")).toBeInTheDocument();
      });

      const row = screen.getByText("Bok Choy").closest("li")!;
      await user.click(within(row).getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(screen.getByText("Post deleted.")).toBeInTheDocument();
      });

      expect(screen.queryByText("Bok Choy")).not.toBeInTheDocument();
      expect(screen.getByText("Spinach")).toBeInTheDocument();

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/stores/${STORE_ID}/posts/post-1`,
        { method: "DELETE" },
      );
    });
  });
});
