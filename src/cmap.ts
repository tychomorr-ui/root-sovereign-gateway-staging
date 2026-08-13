export const cmapAlignment = {
  schema: "root.project-reclaim.cmap-alignment.v0.1",
  state: "reference_only_not_enrolled",
  protocolReference: {
    label: "cMAP / ARCHANGEL reference alignment",
    publishedProtocolName: "Cosmic Mesh Alignment Protocol",
    handshake: "ARCHANGEL/v0",
    gateway: "https://universaltruth.life/gateway",
    mesh: "https://universaltruth.life/mesh",
  },
  admission: [
    "Node obtains a fresh challenge nonce from the conforming peer.",
    "Authorized operator signs the canonical ARCHANGEL/v0 challenge message with an Ed25519 key.",
    "Peer verifies the signature against its allow-list before binding an X25519/WireGuard peer.",
    "Node receives an assigned private address and may receive a CIDv1 receipt only after actual enrollment.",
  ],
  registryProof: {
    canonicalization: "Canonical serialize the approved public record payload before hashing or signing.",
    cid: "not_issued_until_actual_content_addressing",
    signature: "not_issued_until_actual_ed25519_signing",
    ledger: "not_issued_until_actual_ledger_confirmation",
  },
  syncPolicy: [
    "Only approved public manifests, public resource packs, public generalized map geometry, and public registry metadata may be offered to a peer.",
    "A receiving node re-derives the CID from a received public payload before considering it for review.",
    "An inbound event remains quarantined until separate human review and publication authorization occur.",
    "No peer may use a transport handshake or shared secret as evidence that a registry claim is true.",
  ],
  excluded: [
    "ROOT accounts, sessions, passwords, member action plans, or progress states",
    "provider records, applications, eligibility decisions, case information, or emergency context",
    "private addresses, property details, member/device location, worksite coordinates, or material-yard locations",
    "unverified operational records, projected outcomes, fabricated CIDs, signatures, or ledger references",
  ],
  enrolledPeers: [] as string[],
  publicOperationalRecords: [] as string[],
} as const;
