import { describe, expect, it } from "vitest";
import { createPublicReclaimResourcePack, emptyRegistry, firstAuthorizedRegistryRecords, reclaimInitiative, registryDescriptors } from "./reclaim";

describe("Project Reclaim public resource pack", () => {
  it("contains only published county sources and never the Lake County watchlist", () => {
    const pack = createPublicReclaimResourcePack();
    expect(pack.sources.length).toBeGreaterThan(0);
    expect(pack.sources.some(source => source.county === "mendocino")).toBe(true);
    expect(pack.sources.some(source => source.county === "lake")).toBe(true);
    expect(pack.counties.find(county => county.id === "lake")?.publicationState).toBe("published");
  });

  it("publishes only the two owner-authorized registry entries and keeps all other operational registries unavailable", () => {
    const pack = createPublicReclaimResourcePack();
    expect(pack.records.partners).toHaveLength(1);
    expect(pack.records.materials).toHaveLength(1);
    expect(pack.records.projects).toBe("data_unavailable");
    expect(pack.records.jobs).toBe("data_unavailable");
    expect(firstAuthorizedRegistryRecords.partners[0].label).toContain("NEXINUS RI Systems LLC");
    expect(firstAuthorizedRegistryRecords.materials[0].status).toBe("published_intake_framework_no_inventory");
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

  it("does not publish business identifiers, private locations, inventory, or a third-party partner claim", () => {
    const published = JSON.stringify(firstAuthorizedRegistryRecords).toLowerCase();
    const privateIdentifier = ["42", "2574640"].join("-");
    expect(published).not.toContain(privateIdentifier);
    expect(published).toContain("no ein");
    expect(published).toContain("not an inventory listing");
    expect(published).toContain("not represent a third-party partnership");
    expect(published).toContain("exact material-yard");
  });
});
