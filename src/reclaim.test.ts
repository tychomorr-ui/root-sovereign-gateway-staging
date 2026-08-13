import { describe, expect, it } from "vitest";
import { createPublicReclaimResourcePack, reclaimInitiative } from "./reclaim";

describe("Project Reclaim public resource pack", () => {
  it("contains only published county sources and never the Lake County watchlist", () => {
    const pack = createPublicReclaimResourcePack();
    expect(pack.sources.length).toBeGreaterThan(0);
    expect(pack.sources.every(source => source.county === "mendocino")).toBe(true);
    expect(pack.counties.find(county => county.id === "lake")?.publicationState).toBe("watchlist");
  });

  it("marks operational registries as unavailable rather than fabricating records", () => {
    const pack = createPublicReclaimResourcePack();
    expect(Object.values(pack.records)).toEqual(["data_unavailable", "data_unavailable", "data_unavailable", "data_unavailable", "data_unavailable", "data_unavailable"]);
    expect(reclaimInitiative.pillars).toHaveLength(6);
  });

  it("excludes private member and provider data from the future mesh pack", () => {
    const exclusions = createPublicReclaimResourcePack().exclusions.join(" ").toLowerCase();
    expect(exclusions).toContain("private member action plans");
    expect(exclusions).toContain("provider records");
    expect(exclusions).toContain("unpublished county watchlists");
  });
});
