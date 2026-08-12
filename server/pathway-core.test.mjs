import { describe, expect, it } from "vitest";
import { normalizePathwayCreate, normalizePathwayStage, pathwayView } from "./pathway-core.mjs";

describe("ROOT private pathway safeguards", () => {
  it("accepts only reviewed public source identifiers", () => {
    expect(normalizePathwayCreate({ sourceId: "mendo-housing" })).toEqual({ sourceId: "mendo-housing" });
    expect(normalizePathwayCreate({ sourceId: "not-a-provider" }).error).toMatch(/reviewed public pathway/);
  });

  it("accepts only the three member-controlled step states", () => {
    expect(normalizePathwayStage({ sourceId: "mendo-benefits", stage: "ready" })).toEqual({ sourceId: "mendo-benefits", stage: "ready" });
    expect(normalizePathwayStage({ sourceId: "mendo-benefits", stage: "referred" }).error).toMatch(/could not update/);
  });

  it("returns the minimum private pathway record", () => {
    expect(pathwayView({ sourceId: "mendo-work", stage: "saved", createdAt: 1, updatedAt: 2, accountId: "private" })).toEqual({ sourceId: "mendo-work", stage: "saved", createdAt: 1, updatedAt: 2 });
  });
});
