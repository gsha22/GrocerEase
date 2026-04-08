import { extractNeighborhood } from "@/lib/neighborhoods";

/** Unit tests for lib/neighborhoods.ts (used by HomePage for store card labels). */
describe("extractNeighborhood", () => {
  it("maps known Pittsburgh ZIPs to neighborhoods", () => {
    expect(extractNeighborhood("6100 Forbes Ave, Pittsburgh, PA 15217")).toBe(
      "Squirrel Hill",
    );
    expect(extractNeighborhood("1000 Penn Ave, Pittsburgh, PA 15222")).toBe(
      "Strip District",
    );
  });

  it("uses the city name when ZIP is absent and city is not Pittsburgh", () => {
    expect(extractNeighborhood("500 Main St, Sewickley, PA")).toBe("Sewickley");
  });

  it("falls back to Pittsburgh when ZIP is absent and city is Pittsburgh", () => {
    expect(extractNeighborhood("1 Grant St, Pittsburgh, PA")).toBe("Pittsburgh");
  });

  it("returns Pittsburgh for a bare address with no ZIP and no comma segments", () => {
    expect(extractNeighborhood("Unknown Place")).toBe("Pittsburgh");
  });
});
