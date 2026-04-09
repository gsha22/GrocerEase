import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  STORE_PROFILE_CATEGORY_OPTIONS,
  buildStoreProfilePayload,
  storeProfileActionLabel,
  storeProfileSaveTarget,
  toggleCategoryKey,
} from "@/app/(dashboard)/dashboard/profile/StoreProfileForm";
import StoreProfileForm from "@/app/(dashboard)/dashboard/profile/StoreProfileForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("toggleCategoryKey", () => {
  it("adds a category when absent", () => {
    expect(toggleCategoryKey([], "organic")).toEqual(["organic"]);
  });

  it("removes a category when present", () => {
    expect(toggleCategoryKey(["organic", "halal"], "organic")).toEqual([
      "halal",
    ]);
  });
});

describe("buildStoreProfilePayload", () => {
  it("omits isPublished for new stores", () => {
    const p = buildStoreProfilePayload(
      "N",
      "Addr",
      "09:00",
      "17:00",
      ["ebt"],
      false,
      true,
    );
    expect(p).toEqual({
      name: "N",
      address: "Addr",
      hours: { open: "09:00", close: "17:00" },
      categories: ["ebt"],
    });
    expect("isPublished" in p).toBe(false);
  });

  it("includes isPublished when updating existing store", () => {
    const p = buildStoreProfilePayload(
      "N",
      "Addr",
      "09:00",
      "17:00",
      [],
      true,
      false,
    );
    expect(p).toMatchObject({ isPublished: false });
  });
});

describe("storeProfileSaveTarget", () => {
  it("POSTs to collection for new profile", () => {
    expect(storeProfileSaveTarget(false, undefined)).toEqual({
      endpoint: "/api/stores",
      method: "POST",
    });
  });

  it("PATCHes specific store when id exists", () => {
    expect(storeProfileSaveTarget(true, "abc")).toEqual({
      endpoint: "/api/stores/abc",
      method: "PATCH",
    });
  });

  it("falls back to POST when isExisting is true but storeId is undefined", () => {
    expect(storeProfileSaveTarget(true, undefined)).toEqual({
      endpoint: "/api/stores",
      method: "POST",
    });
  });
});

describe("storeProfileActionLabel", () => {
  it("uses publish wording for new stores", () => {
    expect(storeProfileActionLabel(false)).toContain("Publish");
  });

  it("uses update wording for existing stores", () => {
    expect(storeProfileActionLabel(true)).toContain("Update");
  });
});

describe("STORE_PROFILE_CATEGORY_OPTIONS", () => {
  it("lists five specialty keys used in filters", () => {
    const keys = STORE_PROFILE_CATEGORY_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(
      expect.arrayContaining(["asian", "halal", "organic", "produce", "ebt"]),
    );
    expect(keys.length).toBe(5);
  });
});

describe("StoreProfileForm component", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders empty fields and no Save-as-draft button for a new store", () => {
    render(<StoreProfileForm initial={null} />);
    expect(screen.getByPlaceholderText(/Sultan Bey/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/Beaver St/i)).toHaveValue("");
    expect(screen.queryByText(/Save as draft/i)).not.toBeInTheDocument();
  });

  it("pre-fills fields and shows Save-as-draft button for an existing store", () => {
    render(
      <StoreProfileForm
        initial={{
          id: "s1",
          name: "My Market",
          address: "1 Main St",
          categories: ["halal"],
          open: "07:00",
          close: "21:00",
          isPublished: true,
        }}
      />,
    );
    expect(screen.getByDisplayValue("My Market")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1 Main St")).toBeInTheDocument();
    expect(screen.getByText(/Save as draft/i)).toBeInTheDocument();
  });

  it("toggles a category when its button is clicked", () => {
    render(<StoreProfileForm initial={null} />);
    const organicBtn = screen.getByRole("button", { name: /Organic/i });
    fireEvent.click(organicBtn);
    expect(organicBtn).toHaveClass("text-green-700");
    fireEvent.click(organicBtn);
    expect(organicBtn).not.toHaveClass("text-green-700");
  });

  it("shows a success message after a successful publish submit", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ store: { id: "s2" } }),
    } as Response);

    render(<StoreProfileForm initial={null} />);
    fireEvent.click(screen.getByRole("button", { name: /Publish store profile/i }));

    await waitFor(() =>
      expect(screen.getByText(/Store profile published/i)).toBeInTheDocument(),
    );
  });

  it("shows a success message when saving as draft for an existing store", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(
      <StoreProfileForm
        initial={{
          id: "s1",
          name: "My Market",
          address: "1 Main St",
          categories: [],
          open: "08:00",
          close: "20:00",
          isPublished: false,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Save as draft/i }));

    await waitFor(() =>
      expect(screen.getByText(/saved as draft/i)).toBeInTheDocument(),
    );
  });

  it("displays a form-level error and field errors on failed submit", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Validation failed",
        fieldErrors: { name: "Name is required" },
      }),
    } as Response);

    render(<StoreProfileForm initial={null} />);
    fireEvent.click(screen.getByRole("button", { name: /Publish store profile/i }));

    await waitFor(() =>
      expect(screen.getByText(/Validation failed/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
  });
});
