import { countyConfigurations, publicSources } from "./policy";

export type ReclaimStatus = "in_development" | "planned" | "data_unavailable";
export type RegistryKind = "projects" | "opportunities" | "jobs" | "materials" | "partners" | "metrics" | "evidence" | "signatures" | "cids" | "ledgerReferences";
export type RegistryDescriptor = { kind: RegistryKind; label: string; purpose: string; requiredForPublication: string[] };
export type PublicRegistryRecord = { id: string; label: string; countyScope: readonly string[]; status: string; publicSummary: string; sourceAuthority: string; proofState: string; privacyBoundary: string };

export const registryDescriptors: RegistryDescriptor[] = [
  { kind: "projects", label: "Projects", purpose: "Real restoration, mitigation, training, recovery, infrastructure, or community work with a declared scope and status.", requiredForPublication: ["County scope", "authorized source", "status", "public summary", "publication decision"] },
  { kind: "opportunities", label: "Opportunities", purpose: "Verified ways to participate through work, training, contracts, volunteering, resources, or community needs.", requiredForPublication: ["Source organization", "status", "application or contact route", "review date"] },
  { kind: "jobs", label: "Jobs", purpose: "Verified roles, contracts, seasonal work, apprenticeships, internships, or volunteer opportunities.", requiredForPublication: ["Organization", "role status", "location or service area", "application method", "verification date"] },
  { kind: "materials", label: "Materials", purpose: "Real recovered wood, biomass, equipment, or reusable resources with an authorized publication scope.", requiredForPublication: ["Material category", "custody or source", "availability status", "review decision"] },
  { kind: "partners", label: "Partners", purpose: "Organizations with an explicit documented relationship to a Project Reclaim record.", requiredForPublication: ["Written authorization", "relationship scope", "review date"] },
  { kind: "metrics", label: "Metrics", purpose: "Defined measurements of actual work, capacity, training, material recovery, or community outcomes.", requiredForPublication: ["Metric definition", "source method", "time period", "reviewer"] },
  { kind: "evidence", label: "Evidence objects", purpose: "Documents, images, or records linked to a real event and a publication decision.", requiredForPublication: ["Evidence type", "source", "capture time", "access classification"] },
  { kind: "signatures", label: "Signatures", purpose: "Future cryptographic attestations only after actual signing and key verification occur.", requiredForPublication: ["Key identifier", "algorithm", "signed payload reference", "verification result"] },
  { kind: "cids", label: "CIDs", purpose: "Future content-addressed references only after content is actually addressed and retrievable.", requiredForPublication: ["Content hash", "storage proof", "retrieval verification"] },
  { kind: "ledgerReferences", label: "Ledger references", purpose: "Future immutable-record references only after a ledger event is actually confirmed.", requiredForPublication: ["Ledger system", "event reference", "confirmation evidence"] },
];

export const emptyRegistry = Object.fromEntries(registryDescriptors.map(descriptor => [descriptor.kind, []])) as Record<RegistryKind, []>;

export const firstAuthorizedRegistryRecords: Record<"materials" | "partners", readonly PublicRegistryRecord[]> = {
  partners: [{
    id: "pr-nexinus-initiating-organization-v1",
    label: "NEXINUS RI Systems LLC · Project Reclaim initiating organization",
    countyScope: ["Mendocino County", "Lake County"],
    status: "published_owner_authorized",
    publicSummary: "Owner-authorized initiating organization and Project Reclaim steward for the initial two-county regional scope. This entry does not represent a third-party partnership, government relationship, provider relationship, or endorsement.",
    sourceAuthority: "Owner authorization received 2026-08-13.",
    proofState: "CID, cryptographic signature, and ledger reference pending an actual canonical public record and signing event.",
    privacyBoundary: "No EIN, private contact details, member data, or operational locations are published.",
  }],
  materials: [{
    id: "pr-material-recovery-intake-mendo-lake-v1",
    label: "Project Reclaim Material Recovery Intake · Mendocino & Lake",
    countyScope: ["Mendocino County", "Lake County"],
    status: "published_intake_framework_no_inventory",
    publicSummary: "A published framework for future source-backed wood, biomass, and recoverable-material listings in the initial two-county region. It is not an inventory listing and does not represent material availability, custody, a site, price, buyer, seller, project, or public submission route.",
    sourceAuthority: "Owner authorization received 2026-08-13.",
    proofState: "No material item, CID, cryptographic signature, or ledger reference exists yet.",
    privacyBoundary: "Future records must omit private property details, exact material-yard or worksite locations, and any non-public custody information unless separately authorized.",
  }],
};

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
    records: Object.fromEntries(registryDescriptors.map(descriptor => [descriptor.kind, firstAuthorizedRegistryRecords[descriptor.kind as keyof typeof firstAuthorizedRegistryRecords] ?? "data_unavailable"])),
    offlineMap: { schema: "root.project-reclaim.regional-map.v0.1", url: "/reclaim-regional-map-v0.1.geojson", status: "public_orientation_boundaries_only" },
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
