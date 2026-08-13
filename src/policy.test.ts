import { describe, expect, it } from "vitest";
import { canNotifySourceFromIssue, canPublishLake, canSeePathway, countyConfigurations, publicSources } from "./policy";

describe("ROOT clean policy", () => {
  it("publishes only reviewed Mendocino sources with member-facing action boundaries", () => {
    const catalog = publicSources();
    expect(catalog).toHaveLength(9);
    expect(catalog.every(source => source.county === "mendocino" && source.state === "published" && source.action && source.verifiedAt && source.sourceKind)).toBe(true);
  });

  it("keeps Lake County unpublished under the present authority", () => {
    expect(canPublishLake("directory_steward")).toBe(false);
    expect(canPublishLake("first_executive")).toBe(false);
    expect(countyConfigurations.find(county => county.id === "lake")?.publicationState).toBe("watchlist");
  });

  it("keeps a pathway visible to its owner only", () => {
    expect(canSeePathway("member-a", "member-a")).toBe(true);
    expect(canSeePathway("member-b", "member-a")).toBe(false);
  });

  it("does not notify a source when a member reports an issue", () => {
    expect(canNotifySourceFromIssue()).toBe(false);
  });
});
