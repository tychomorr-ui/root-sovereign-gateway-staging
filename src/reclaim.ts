import { countyConfigurations, publicSources } from "./policy";

export type ReclaimStatus = "in_development" | "planned" | "data_unavailable";

export const reclaimInitiative = {
  name: "Project Reclaim",
  headline: "Restore the land. Recover the resource. Rebuild the community.",
  status: "in_development" as ReclaimStatus,
  principle: "The digital serves the physical. The physical proves the digital. The people heal the Monad.",
  mission: "A physical-world restoration and resilience initiative centered on fire mitigation, land stewardship, material recovery, workforce development, education, employment, emergency preparedness, and community-scale infrastructure.",
  pillars: [
    { id: "fire", label: "Fire mitigation", detail: "Assessment, defensible-space work, fuel reduction, vegetation management, recovery, and preparedness pathways.", status: "planned" as ReclaimStatus },
    { id: "materials", label: "Wood & resource recovery", detail: "A future material pathway from land and recovery through sorting, processing, reuse, and community value.", status: "planned" as ReclaimStatus },
    { id: "workforce", label: "Workforce development", detail: "A future discover-to-train-to-certify-to-work pathway that creates capability rather than surveillance.", status: "planned" as ReclaimStatus },
    { id: "education", label: "Training & education", detail: "Future practical learning in stewardship, safety, restoration, equipment, construction, and digital literacy.", status: "planned" as ReclaimStatus },
    { id: "community", label: "Community resilience", detail: "Local needs, resources, preparedness, and participation organized around real regional conditions.", status: "in_development" as ReclaimStatus },
    { id: "evidence", label: "Evidence & provenance", detail: "Future records can connect real work to evidence, signatures, and verification without claiming that proof exists before it does.", status: "planned" as ReclaimStatus },
  ],
  participation: [
    { role: "Resident or property owner", path: "Need → assessment request → approved work path → evidence", boundary: "No property address, assessment, or work request is collected in the public resource pack." },
    { role: "Worker or trainee", path: "Discover → train → certify → work → contribute → advance", boundary: "No jobs, training seats, certifications, or applications are represented as available until verified." },
    { role: "Organization or partner", path: "Identify opportunity → disclose scope → establish authorization → contribute evidence", boundary: "No partnership is implied by listing a public source or discussing a possible role." },
  ],
  evidenceLoop: "Need → people → project → work → resource → evidence → outcome",
  recordPosture: "data_unavailable" as ReclaimStatus,
} as const;

export function createPublicReclaimResourcePack() {
  return {
    schema: "root.project-reclaim.resource-pack.v0.1",
    packState: "public-review-pack",
    issuedOn: "2026-08-12",
    purpose: "Offline-capable cache of approved public sources and Project Reclaim initiative structure for future Monarch OS nodes.",
    initiative: reclaimInitiative,
    counties: countyConfigurations.map(county => ({ id: county.id, label: county.label, publicationState: county.publicationState, scope: county.scope })),
    sources: publicSources().map(source => ({ id: source.id, county: source.county, category: source.category, title: source.title, url: source.url, action: source.action, contact: source.contact, verifiedAt: source.verifiedAt, sourceKind: source.sourceKind })),
    records: {
      projects: "data_unavailable",
      opportunities: "data_unavailable",
      jobs: "data_unavailable",
      materials: "data_unavailable",
      partnerOrganizations: "data_unavailable",
      evidenceObjects: "data_unavailable",
    },
    exclusions: [
      "ROOT accounts and sessions",
      "private member action plans and progress states",
      "member-provided addresses, property details, emergency context, or location",
      "provider records, applications, eligibility decisions, and case information",
      "unpublished county watchlists",
      "unverified projects, jobs, materials, partners, metrics, CIDs, signatures, or ledger claims",
    ],
    meshStatus: "planned_not_active",
  };
}
