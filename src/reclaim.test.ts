import { describe, expect, it } from "vitest";
import { createPublicReclaimResourcePack, emptyRegistry, reclaimInitiative, registryDescriptors } from "./reclaim";

describe("Project Reclaim public resource pack", () => {
  it("contains only published county sources and never the Lake County watchlist", () => {
    const pack = createPublicReclaimResourcePack();
    expect(pack.sources.length).toBeGreaterThan(0);
    expect(pack.sources.some(source => source.county === "mendocino")).toBe(true);
    expect(pack.sources.some(source => source.county === "lake")).toBe(true);
    expect(pack.counties.find(county => county.id === "lake")?.publicationState).toBe("published");
  });

  it("marks operational registries as unavailable rather than fabricating records", () => {
    const pack = createPublicReclaimResourcePack();
    expect(Object.values(pack.records).every(value => value === "data_unavailable")).toBe(true);
    expect(reclaimInitiative.pillars).toHaveLength(6);
  });

  it("excludes private member and provider data from the future mesh pack", () => {
    const exclusions = createPublicReclaimResourcePack().exclusions.join(" ").toLowerCase();
    expect(exclusions).toContain("private member action plans");
    expect(exclusions).toContain("provider records");
    expect(exclusions).toContain("unpublished county watchlists");
  });

  it("defines empty registries and publication requirements instead of fictional records", () => {
    expect(registryDescriptors).toHaveLength(10);
    expect(Object.values(emptyRegistry).every(records => Array.isArray(records) && records.length === 0)).toBe(true);
    expect(registryDescriptors.every(descriptor => descriptor.requiredForPublication.length > 0)).toBe(true);
  });
});
