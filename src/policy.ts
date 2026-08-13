export type County = string;
export type CountyPublicationState = "published" | "watchlist" | "review" | "unconfigured";
export type CountyConfiguration = { id: County; label: string; publicationState: CountyPublicationState; scope: string };
export type Need = "Housing" | "Food" | "Benefits" | "Work" | "Navigation" | "Support" | "Urgent support";
export type Source = {
  id: string;
  county: County;
  state: "published" | "watchlist";
  title: string;
  category: Need;
  url: string;
  note: string;
  action: string;
  contact?: string;
  verifiedAt: string;
  sourceKind: "Official county" | "Official county library" | "Official 211 directory";
};

export const needDescriptions: Record<Need, string> = {
  Housing: "Housing options, homelessness coordination, and official assistance pathways.",
  Food: "Food-benefit and food-resource navigation through reviewed public sources.",
  Benefits: "Food, cash, medical, and related county benefit pathways.",
  Work: "County employment and CalWORKs job-service pathways.",
  Navigation: "A broad, local resource search when one category is not enough.",
  Support: "Non-crisis emotional support and behavioral-health access information.",
  "Urgent support": "Immediate mental-health crisis information. ROOT does not dispatch emergency services.",
};

export const countyConfigurations: CountyConfiguration[] = [
  { id: "mendocino", label: "Mendocino County", publicationState: "published", scope: "Reviewed public pathways are available in ROOT." },
  { id: "lake", label: "Lake County", publicationState: "watchlist", scope: "Verified watchlist only. It is not publicly available in ROOT or in a resource pack." },
];

export const sources: Source[] = [
  {
    id: "mendo-housing", county: "mendocino", state: "published", title: "Community Development Commission of Mendocino County", category: "Housing",
    url: "https://www.cdchousing.org/", note: "Official county-library resource listing for housing assistance. Program availability and eligibility are decided by the official provider.",
    action: "Review the official housing-assistance options and choose whether to contact or apply.", verifiedAt: "2026-08-12", sourceKind: "Official county library",
  },
  {
    id: "mendo-homeless-continuum", county: "mendocino", state: "published", title: "Mendocino County Homeless Services Continuum of Care", category: "Housing",
    url: "https://www.mendocinocounty.gov/departments/social-services/adult-aging-services/mendocino-county-homeless-services-continuum-of-care", note: "County-described coordination and resource pathway for people experiencing homelessness; it is not a ROOT-operated intake.",
    action: "Open the official Continuum of Care resources and choose a contact route that fits your situation.", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "mendo-food-navigation", county: "mendocino", state: "published", title: "Mendocino County Library Community Resources", category: "Food",
    url: "https://www.mendolibrary.org/discover/community-resources", note: "County-library index that lists local food distribution and related resource pathways. ROOT does not represent the listed organizations.",
    action: "Use the official resource index to choose a food or distribution contact you want to explore.", verifiedAt: "2026-08-12", sourceKind: "Official county library",
  },
  {
    id: "mendo-benefits", county: "mendocino", state: "published", title: "Mendocino County Employment & Family Assistance Services", category: "Benefits",
    url: "https://www.mendocinocounty.gov/departments/social-services/employment-family-assistance-services", note: "Official county entry point for CalWORKs, CalFresh, Medi-Cal, CMSP, EBT support, and related assistance. The county decides eligibility and processing.",
    action: "Choose an official online, phone, mail, fax, or office route; ROOT does not submit an application for you.", contact: "Ukiah: 707-463-7700 · Fort Bragg: 707-962-1000", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "mendo-work", county: "mendocino", state: "published", title: "Mendocino County CalWORKs Job Services", category: "Work",
    url: "https://www.mendocinocounty.gov/departments/social-services/employment-family-assistance-services/calworks-job-services", note: "Official county employment and training pathway for TANF recipients. Participation and employment outcomes remain with the county and its program partners.",
    action: "Review the official job-service information and decide whether to use the county contact path.", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "mendo-211", county: "mendocino", state: "published", title: "211 Mendocino", category: "Navigation",
    url: "https://211mendocino.org/", note: "Official 211 local information-and-referral directory for multiple community resource categories. Listings and availability remain with 211 and the underlying providers.",
    action: "Search or call the local 211 directory when you want options across more than one need category.", verifiedAt: "2026-08-12", sourceKind: "Official 211 directory",
  },
  {
    id: "mendo-behavioral-access", county: "mendocino", state: "published", title: "Mendocino County Behavioral Health & Recovery Services", category: "Support",
    url: "https://www.mendocinocounty.gov/departments/behavioral-health-and-recovery-services", note: "Official county behavioral-health and recovery-services information, including access and language-assistance details. ROOT does not provide clinical care.",
    action: "Use the official county access information if you want to explore behavioral-health or recovery services.", contact: "County access line: 1-800-555-5906", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "mendo-warm-line", county: "mendocino", state: "published", title: "Mendocino County Warm Line", category: "Support",
    url: "https://www.mendocinocounty.gov/departments/behavioral-health-and-recovery-services", note: "Official county non-crisis emotional-support line for Mendocino County residents. It is not emergency dispatch or a substitute for emergency response.",
    action: "If non-crisis support feels right, use the official Warm Line details directly.", contact: "707-472-2311 · toll-free 1-833-955-2510 · Monday–Friday, 7:30am–6:00pm", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "mendo-crisis", county: "mendocino", state: "published", title: "Mendocino County 24/7 Crisis Line", category: "Urgent support",
    url: "https://www.mendocinocounty.gov/residents/health/mental-health", note: "Official county 24/7 mental-health crisis line for immediate help. In a life-threatening emergency, call 911.",
    action: "If you are in immediate mental-health crisis, contact the official crisis line now; ROOT does not dispatch emergency services.", contact: "24/7 crisis line: 1-855-838-0404", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
  {
    id: "lake-housing-watchlist", county: "lake", state: "watchlist", title: "Lake County Housing", category: "Housing",
    url: "https://www.lakecountyca.gov/1490/Housing", note: "Verified watchlist only. It is not a public ROOT pathway under the present county scope.",
    action: "Not publicly available in ROOT.", verifiedAt: "2026-08-12", sourceKind: "Official county",
  },
];

export function publicSources() {
  return sources.filter(source => source.state === "published" && countyConfigurations.some(county => county.id === source.county && county.publicationState === "published"));
}

export function canPublishLake(role: "directory_steward" | "first_executive") {
  return role === "first_executive" && false;
}

export function canSeePathway(requestingMemberId: string, ownerMemberId: string) {
  return requestingMemberId === ownerMemberId;
}

export function canNotifySourceFromIssue() {
  return false;
}
