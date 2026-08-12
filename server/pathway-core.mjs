const publicSourceIds = new Set([
  "mendo-housing",
  "mendo-homeless-continuum",
  "mendo-food-navigation",
  "mendo-benefits",
  "mendo-work",
  "mendo-211",
  "mendo-behavioral-access",
  "mendo-warm-line",
  "mendo-crisis",
]);

const pathwayStages = new Set(["saved", "ready", "complete"]);

export function normalizePathwayCreate(input) {
  const sourceId = typeof input?.sourceId === "string" ? input.sourceId : "";
  if (!publicSourceIds.has(sourceId)) return { error: "ROOT can save only a reviewed public pathway." };
  return { sourceId };
}

export function normalizePathwayStage(input) {
  const sourceId = typeof input?.sourceId === "string" ? input.sourceId : "";
  const stage = typeof input?.stage === "string" ? input.stage : "";
  if (!publicSourceIds.has(sourceId) || !pathwayStages.has(stage)) return { error: "ROOT could not update that private pathway step." };
  return { sourceId, stage };
}

export function pathwayView(item) {
  return { sourceId: item.sourceId, stage: item.stage, createdAt: item.createdAt, updatedAt: item.updatedAt };
}
