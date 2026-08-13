import { describe, expect, it } from "vitest";
import { canNotifySourceFromIssue, canPublishLake, canSeePathway, countyConfigurations, publicSources } from "./policy";

describe("ROOT clean policy", () => {
  it("publishes only reviewed authorized-county sources with member-facing action boundaries", () => {
    const catalog = publicSources();
    expect(catalog).toHaveLength(14);
    expect(catalog.every(source => (source.county === "mendocino" || source.county === "lake") && source.state === "published" && source.action && source.verifiedAt && source.sourceKind)).toBe(true);
    expect(catalog.some(source => source.county === "mendocino")).toBe(true);
    expect(catalog.some(source => source.county === "lake")).toBe(true);
  });

  it("allows the authorized Lake County regional scope while retaining First Executive publication control", () => {
    expect(canPublishLake("directory_steward")).toBe(false);
    expect(canPublishLake("first_executive")).toBe(true);
    expect(countyConfigurations.find(county => county.id === "lake")?.publicationState).toBe("published");
  });

  it("keeps a pathway visible to its owner only", () => {
    expect(canSeePathway("member-a", "member-a")).toBe(true);
    expect(canSeePathway("member-b", "member-a")).toBe(false);
  });

  it("does not notify a source when a member reports an issue", () => {
    expect(canNotifySourceFromIssue()).toBe(false);
  });
});
