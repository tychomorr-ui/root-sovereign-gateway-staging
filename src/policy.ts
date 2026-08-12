export type County = "mendocino" | "lake";
export type Source = {
  id: string;
  county: County;
  state: "published" | "watchlist";
  title: string;
  category: "Housing" | "Work";
  url: string;
  note: string;
};

export const sources: Source[] = [
  {
    id: "mendo-housing",
    county: "mendocino",
    state: "published",
    title: "Community Development Commission of Mendocino County",
    category: "Housing",
    url: "https://www.cdchousing.org/",
    note: "Housing programs, applications, eligibility, and availability remain with the official source.",
  },
  {
    id: "mendo-work",
    county: "mendocino",
    state: "published",
    title: "Mendocino County CalWORKs Job Services",
    category: "Work",
    url: "https://www.mendocinocounty.gov/departments/social-services/employment-family-assistance-services/calworks-job-services",
    note: "Participation and employment decisions remain with Mendocino County and its official program partners.",
  },
  {
    id: "lake-housing-watchlist",
    county: "lake",
    state: "watchlist",
    title: "Lake County Housing",
    category: "Housing",
    url: "https://www.lakecountyca.gov/1490/Housing",
    note: "Verified watchlist only. It is not a public ROOT pathway under the present county scope.",
  },
];

export function publicSources() {
  return sources.filter(source => source.state === "published" && source.county === "mendocino");
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
