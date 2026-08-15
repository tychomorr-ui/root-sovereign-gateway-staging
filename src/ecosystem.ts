export type EcosystemConnection = {
  id: string;
  label: string;
  role: string;
  region: string;
  endpoint?: string;
  connectionState: "link_only" | "endpoint_pending";
  boundary: string;
};

export const ecosystemConnections: EcosystemConnection[] = [
  { id: "universal-truth", label: "Universal Truth", role: "Operations and evidence console", region: "Oregon public surface", endpoint: "https://universaltruth.life/", connectionState: "link_only", boundary: "Opens by choice; ROOT sends no account, profile, session, or private record." },
  { id: "resonate-earth", label: "Resonate Earth", role: "Public proof and publication surface", region: "Public web surface", endpoint: "https://resonate-earth.live/", connectionState: "link_only", boundary: "Only a member-selected future public artifact could enter a separate approved exchange." },
  { id: "xinus", label: "XINUS MonarchOS", role: "Local-first runtime and member-held key surface", region: "Public web surface", endpoint: "https://xinus.one/", connectionState: "link_only", boundary: "No ROOT profile, cookie, or local key material is synchronized automatically." },
  { id: "tesseract", label: "Tesseract", role: "Ecosystem application surface", region: "Managed public surface", endpoint: "https://tesseract.manus.space/", connectionState: "link_only", boundary: "Opens by choice; no ROOT member data travels in the handoff." },
  { id: "xinus-dashboard", label: "NEXINUS Dashboard", role: "Ecosystem dashboard surface", region: "Managed public surface", endpoint: "https://xinusdash-doy5g86k.manus.space/", connectionState: "link_only", boundary: "No shared sign-in, identifier, or private record transfer is enabled." },
  { id: "sovereign-app", label: "Sovereign App", role: "Ecosystem application surface", region: "Managed public surface", endpoint: "https://sovereignapp-hkcgwye7.manus.space/", connectionState: "link_only", boundary: "No ROOT profile, consent receipt, or emergency context is transferred." },
  { id: "nexinus-ri-systems", label: "NEXINUS RI Systems LLC", role: "Organization information surface", region: "Public web surface", endpoint: "https://nexinus-ri-systems-llc.figma.site/", connectionState: "link_only", boundary: "Public information only; ROOT retains all member-controlled records." },
  { id: "iwa-sage-app", label: "IWA-SAGE-APP", role: "Supplied application instance", region: "Montreal, Canada", connectionState: "endpoint_pending", boundary: "Instance is registered for review only; no public origin or data-exchange permission has been supplied." },
  { id: "root-sovereign-identity-virginia", label: "ROOT_SOVEREIGN-IDENTITY", role: "Supplied identity-instance candidate", region: "Virginia, United States", connectionState: "endpoint_pending", boundary: "Not treated as a ROOT replica, member-data store, or trusted verifier without a reviewed deployment and key-custody record." },
  { id: "project-reclaim-oregon", label: "PROJECT-RECLAIM", role: "Supplied Project Reclaim instance", region: "Oregon, United States", connectionState: "endpoint_pending", boundary: "No project, job, material, partner, or member data is pulled into ROOT automatically." },
  { id: "xinus-clarity", label: "XinUS-Clarity", role: "Supplied clarity-engine instance", region: "Ireland", connectionState: "endpoint_pending", boundary: "No ROOT prompt, member proof, or private account information is shared." },
  { id: "sovereign-provenance-console", label: "Sovereign_Provenance-Console", role: "Supplied provenance-console instance", region: "Spain", connectionState: "endpoint_pending", boundary: "No signed-proof or verifier role is assumed until the endpoint, manifest, and key rotation path are reviewed." },
  { id: "portal", label: "The_Portal", role: "Supplied portal instance", region: "São Paulo, Brazil", connectionState: "endpoint_pending", boundary: "No cross-region member transfer is enabled; a visible regional grant would be required for any future exchange." },
  { id: "archangel-control-plane", label: "ARCHANGEL_CONTROL-PLANE", role: "Supplied control-plane instance", region: "London, United Kingdom", connectionState: "endpoint_pending", boundary: "It is not enrolled as a ROOT node and receives no member data, telemetry, or secret material." },
  { id: "tesseract-a", label: "Tesseract-A", role: "Supplied relay-candidate instance", region: "Frankfurt, Germany", connectionState: "endpoint_pending", boundary: "May later host public manifests or release receipts only; no ROOT private record replication is authorized." },
  { id: "monarch-os", label: "Monarch-OS", role: "Supplied local-first runtime instance", region: "Singapore", connectionState: "endpoint_pending", boundary: "Not a ROOT credential issuer or private-data peer without member-approved presentation and deployment review." },
];
