import { describe, expect, it } from "vitest";
import { canNotifySourceFromIssue, canPublishLake, canSeePathway, publicSources } from "./policy";

describe("ROOT clean policy", () => {
  it("publishes only reviewed Mendocino sources", () => {
    expect(publicSources().map(source => source.id)).toEqual(["mendo-housing", "mendo-work"]);
  });

  it("keeps Lake County unpublished under the present authority", () => {
    expect(canPublishLake("directory_steward")).toBe(false);
    expect(canPublishLake("first_executive")).toBe(false);
  });

  it("keeps a pathway visible to its owner only", () => {
    expect(canSeePathway("member-a", "member-a")).toBe(true);
    expect(canSeePathway("member-b", "member-a")).toBe(false);
  });

  it("does not notify a source when a member reports an issue", () => {
    expect(canNotifySourceFromIssue()).toBe(false);
  });
});
