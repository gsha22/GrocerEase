import {
  STORE_PROFILE_CATEGORY_OPTIONS,
  buildStoreProfilePayload,
  storeProfileActionLabel,
  storeProfileSaveTarget,
  toggleCategoryKey,
} from "@/app/(dashboard)/dashboard/profile/StoreProfileForm";

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
