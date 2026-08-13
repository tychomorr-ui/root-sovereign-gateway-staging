# Monarch OS Radio-Mesh Phase Plan for Project Reclaim

**Status:** planning document. No ROOT CMAP peer, radio device, radio gateway, background sync service, CID, signature, ledger event, map-tile service, or peer-to-peer radio exchange is active under this plan.

## Verified ROOT Baseline

ROOT currently has a compact offline **orientation map**, not an offline tile service. The live asset `/reclaim-regional-map-v0.1.geojson` contains two generalized polygon features: Mendocino County and Lake County. It excludes parcels, addresses, worksites, material-yard locations, member locations, emergency locations, and project features. ROOT’s service worker caches the public resource pack, registry, and regional map asset after a secure visit; it does not currently cache the CMAP manifest.

ROOT’s live CMAP manifest is still `reference_only_not_enrolled`. It declares zero enrolled peers, zero public operational records, planned—not-active synchronization, and no CID, signature, or ledger reference. That is the honest current state.

> **Design rule:** The radio path is a carrier for small public update notices. It is not a trust decision, a map-tile network, a source of truth, or a permission to distribute private data.

## What Is Appropriate for Radio Exchange

LoRa mesh transport is appropriate for **small public manifest notices** and recovery requests, not for map tiles, large GeoJSON files, documents, images, evidence media, material inventories, or private operational records. The Meshtastic packet layer limits payload data to a maximum of 237 bytes before protocol overhead, and multi-hop delivery uses managed flooding; both characteristics make large artifacts and frequent automatic updates unsuitable.[1]

| Data class | May travel as a future radio notice? | How it should be handled |
|---|---|---|
| Resource-pack version, hash, and retrieval hint | Yes | Small signed public notice; receiver verifies before caching. |
| Generalized two-county map version/hash | Yes | Small signed public notice only; full GeoJSON moves by a higher-bandwidth local or internet path. |
| Approved public Project Reclaim record identifier and CID | Yes, after actual issuance | Reference only; receiver re-derives the CID from the full public payload before review. |
| Full map tiles, full GeoJSON, photos, PDFs, video | No | Move by local Wi-Fi, Ethernet, USB, or an available internet carrier after consent. |
| ROOT accounts, member plans, applications, case data, emergency context, exact sites, material custody, or personal locations | Never | Remain local/private; excluded from CMAP offers and radio transport. |

## CMAP Role Above the Carrier

CMAP stays above the physical transport. Whether an artifact arrives by Wi-Fi, Ethernet, a removable drive, a WireGuard route, or future LoRa radio, the receiving Monarch OS node must apply the same application-level checks:

1. Read the exact offered public bytes without transforming them.
2. Verify the Ed25519 signature over those raw bytes before trusting parsed fields.
3. Apply strict deterministic canonicalization when generating or re-deriving a CID.
4. Enforce the configured freshness boundary, future-skew boundary, and post-verification counter monotonicity controls.
5. Treat every failure as `UNVERIFIED`.
6. Quarantine a validly signed inbound public artifact until the locally authorized reviewer makes a publication or acceptance decision.

The published CMAP documentation makes this distinction important: signature and freshness establish authorship and transport integrity, not the semantic correctness of a project claim.[3] [4]

## The First Radio Message Shape

This is a **format only**, not a message that exists today. It is intentionally brief enough to be a notice rather than a copy of the underlying artifact.

```json
{
  "v": "PR-CMAP-NOTICE/v0",
  "type": "public_pack_offer",
  "pack": "project-reclaim-resource-pack-v0.1",
  "version": "<issued version>",
  "cid": null,
  "recordCount": 2,
  "map": "reclaim-regional-map-v0.1.geojson",
  "scope": "public_mendocino_lake_only",
  "status": "unsigned_template",
  "hint": "obtain-full-public-artifact-via-local-or-network-carrier"
}
```

Before a live notice can contain a CID, the corresponding full public artifact must actually be canonicalized, content addressed, retrievable, and verified. The receiving node must not treat the `recordCount`, `version`, `cid`, or `hint` as authoritative until the signed raw bytes and full artifact pass CMAP verification.

## Phased Deployment Choices

| Approach | What it gives the Project Reclaim network | Tradeoffs | Cost | Setup complexity |
|---|---|---|---:|---|
| **Offline pack first** | ROOT and Monarch OS cache the public resource pack and generalized map after a secure visit or manual file transfer. No radio required. | No peer discovery or automatic exchange; the safest first operational layer. | No new radio hardware. | Low. |
| **Consent-based local exchange** | Two willing devices exchange the signed public pack by local Wi-Fi, Ethernet, or removable media, then each verifies it locally. | Physical proximity or a local network is required; no long-range transport. | Uses existing devices/networking. | Moderate. |
| **Radio notice pilot** | A small LoRa message announces a new public-pack version/CID; receivers later retrieve and verify the full public artifact through an available carrier. | Low bandwidth, unreliable delivery, and site/radio compliance work. It must never carry maps or private data. | Requires certified radio hardware, power, antennas, and local operating support. | High. |
| **Enrolled CMAP overlay** | Authorized nodes exchange verified public manifests over an encrypted overlay after a real `ARCHANGEL/v0` enrollment process. | Requires node key custody, peer allow-lists, revocation, monitoring, and incident controls; separate from radio. | Uses existing or future node infrastructure. | High. |

The first two approaches are viable now because they do not require any new persistent radio service. The radio notice pilot becomes reasonable only when the project chooses radio hardware, legally compliant operating parameters, host locations, node operators, key custody, and a clear public-data scope. An always-on radio bridge must run locally on a Monarch OS device or dedicated node; ROOT’s hosted website cannot access a serial or USB radio attached to someone else’s laptop.

## Radio-Pilot Guardrails for Mendocino and Lake Counties

If a pilot is approved, it should begin with one non-sensitive, public-only public-pack notice rather than arbitrary mesh traffic. The current Meshtastic documentation describes the United States regional setting as 902–928 MHz and emphasizes that radio configuration must match the operator’s region.[2] U.S. intentional-radiator operation must also comply with the applicable FCC Part 15 technical and equipment-authorization conditions; compliance must be verified against the actual device, antenna, configuration, and deployment setting before operation.[5]

The pilot must explicitly disable or avoid device position broadcasts, automated device telemetry, arbitrary channel sharing, and public routing of private data. Meshtastic documents recurring device telemetry, position, and node-information behavior, so a privacy-first deployment should configure only the necessary behavior and audit it before inviting participants.[1] A radio message should contain no personal identity, member identifier, contact list, position, property, emergency information, case record, material location, or private proof object.

## Pilot Acceptance Criteria

The following criteria should be met before describing any radio capability as live:

| Area | Required evidence |
|---|---|
| Hardware and legal operation | Identified certified devices, antenna and power review, region configuration, and an operator-confirmed compliance record. |
| Public artifact | A real approved public Project Reclaim pack with an actual canonical payload, CID, Ed25519 signature, and independently repeatable verification result. |
| Node identity | Separate node-generated keys, authorized operator, allow-list entry, and documented revocation procedure. |
| Privacy | An inspection showing no position broadcast, telemetry, account data, member plan, private location, or non-public record enters the radio payload. |
| Reliability | Measured local delivery and recovery behavior recorded as an operational test result—not a claimed network guarantee. |
| Human control | A reviewer can inspect, accept, reject, quarantine, and revoke a public artifact without automatic overwrite. |

## Current Next Action

The immediate next step is not to switch on LoRa. It is to define a small **public-pack notice profile** and a local Monarch OS verifier that can read a stored public artifact, canonicalize it, compute a real CID, sign it with an operator-authorized Ed25519 key, and verify it on another device. That test can happen first over a local file transfer or LAN. Only after it works should a radio link be evaluated as a transport for a compact notice.

## References

[1]: https://meshtastic.org/docs/overview/mesh-algo/ "Meshtastic Mesh Broadcast Algorithm"
[2]: https://meshtastic.org/docs/getting-started/initial-config/ "Meshtastic Initial Configuration"
[3]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/Architecture.md "NEXINUS cMAP Architecture"
[4]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/SecurityModel.md "NEXINUS cMAP Security Model"
[5]: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-15 "47 CFR Part 15 — Radio Frequency Devices"
