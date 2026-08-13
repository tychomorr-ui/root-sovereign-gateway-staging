# CMAP and Project Reclaim Registry Alignment

**Status:** reference alignment only. ROOT has not enrolled a CMAP peer, issued a WireGuard profile, generated a Project Reclaim CID, signed a Project Reclaim record, or written a Project Reclaim ledger reference.

## What the Published CMAP Material Establishes

The published gateway describes a browser-local Ed25519/X25519 identity workflow and an `ARCHANGEL/v0` enrollment exchange. It uses a fresh challenge nonce, an Ed25519 signature over the stated canonical enrollment message, allow-list verification on the receiving node, an X25519/WireGuard peer configuration, and a possible CIDv1 receipt returned only after enrollment.[1]

The published mesh page describes a WireGuard overlay above—not instead of—a physical carrier. It states that a peer should not be trusted merely because it is reachable: the peer must serve a signed `ARCHANGEL/v0` payload whose re-derived CID matches. It also describes inbound federation events as quarantined rather than automatically accepted into a ledger.[2]

The published pages call the protocol **Cosmic Mesh Alignment Protocol**, while the user refers to it as **Cosmic Mesh Activation Protocol**. ROOT uses **CMAP** as the shared label and preserves the published `ARCHANGEL/v0` wire identifier until the protocol’s canonical versioning is clarified.[1]

## ROOT’s CMAP-Compatible Boundary

| Layer | ROOT alignment | Current state |
|---|---|---|
| Transport admission | Fresh challenge, authorized Ed25519 signing, peer allow-list verification, then X25519/WireGuard binding | Reference only; no ROOT peer enrolled |
| Public payload | Canonical serialization of an approved public registry or resource-pack record | Designed; no signed payload issued |
| Content address | CID only after actual content addressing and reproducible retrieval verification | Not issued |
| Signature | Ed25519 signature only over the actual canonical payload, with issuer public-key identity and verification result | Not issued |
| Ledger reference | Immutable reference only after the actual ledger system confirms an event | Not issued |
| Inbound sync | Re-derive CID, validate public schema and scope, quarantine, then separately review for publication | Planned; not active |

ROOT’s public CMAP alignment manifest is available at `/project-reclaim-cmap-manifest-v0.1.json`. It intentionally advertises **zero enrolled peers** and **zero public operational records**. This is an accurate declaration, not a missing feature claim.

## Activation Package Review

The supplied Nebulous Mesh activation package contains Markdown runbooks, configuration artifacts, private-key-named files, WireGuard profiles, bootstrap scripts, and health-dashboard scripts. ROOT inspected only the package documentation; no artifact was extracted for use, no script was executed, no key was read, and no node was activated.

The runbooks describe a WireGuard exit-node deployment, public port `8080` health endpoint, tunnel configuration, and health checks. They are operational material, not evidence that a CMAP peer is enrolled or that a Project Reclaim record is trustworthy. ROOT will not expose an unsigned public health endpoint as the authority for a registry claim. The published CMAP repository instead specifies a live TLS status response whose raw bytes are signed and verified before JSON is trusted.[4] [5]

ROOT adopts the following reference-only controls from the published CMAP material: default to `UNVERIFIED`; verify Ed25519 signatures over raw response bytes before parsing; apply strict deterministic canonicalization; enforce a maximum 120-second freshness window and 30-second future-skew limit; keep the signed counter opaque until verification; and evaluate counter monotonicity only after verification.[4] [5]

The package’s private-key-named files, generated WireGuard profiles, bootstrap scripts, and health-dashboard output are excluded from ROOT’s manifest, repository, and public packs. Future actual enrollment must use node-generated keys under a separately authorized key-custody procedure. No uploaded or pre-generated private key is a ROOT enrollment credential.

## Record Construction When Real Evidence Exists

For a real material-recovery listing, partner entry, or future project record, the public payload should contain only the approved public record fields. The private or operational source materials must remain outside the payload unless the source specifically authorizes publication.

```text
approved public record
  → canonical serialization
  → content hash
  → actual content addressing / CID
  → Ed25519 signature over the canonical payload or its declared digest
  → independent signature verification
  → optional confirmed ledger reference
  → public manifest entry
```

The manifest should carry the public record identifier, record type, county scope, state, source reference, review time, public payload CID, signer key identifier, signature algorithm, verification state, and any confirmed ledger reference. It must not carry a member’s identity, private property address, detailed work location, provider case information, application, emergency context, private inventory location, or unverified claim.

## First Operational Records: Evidence Still Required

The Project Reclaim directive establishes the **categories** of material recovery and partner work, but it does not identify an actual available material, its custody or public location, an organization that has agreed to be a partner, or authorization to publish either. It explicitly prohibits fabricating inventory, partners, CIDs, signatures, and ledger records.[3]

For the first real Lake or Mendocino material listing, ROOT therefore needs an authorized source plus the material category, custody/source boundary, available or withheld status, county scope, reviewed public description, and publication decision. For the first partner entry, it needs the organization’s canonical name, documented relationship scope, written authorization or public statement permitting that representation, county scope, status, source URL or document reference, and review date. Those requirements protect the physical mission from false claims.

## Synchronization Choices for a Future Node Network

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---:|---|
| **Signed public-pack exchange** | Starts with public manifests and generalized maps only; no live peer communication or private-data exchange | No additional infrastructure beyond existing hosting | Low |
| **CMAP-enrolled private overlay** | Supports authenticated nodes and encrypted transport, but requires a real node daemon, operator key custody, peer allow-lists, incident/revocation process, and ongoing operational review | Uses existing node infrastructure if available; depends on node hosting and carrier costs | High |

The first approach is the appropriate present boundary because no actual Project Reclaim operational record, CID, signature, or peer enrollment has been verified yet. The second becomes appropriate only when actual node operators, keys, public data scope, and operational approval are ready. ROOT does not need a continuous background sync process for the first approach; it can publish versioned public artifacts for a future node to retrieve.

## References

[1]: https://universaltruth.life/gateway "Gateway Registry · Nexinus Terminus"
[2]: https://universaltruth.life/mesh "Nebulous Mesh · Sovereign Internet Overlay"
[3]: /home/ubuntu/upload/pasted_content.txt "Project Reclaim — Manus Master Initialization & Architecture Directive"
[4]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/Architecture.md "NEXINUS cMAP Architecture"
[5]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/SecurityModel.md "NEXINUS cMAP Security Model"
