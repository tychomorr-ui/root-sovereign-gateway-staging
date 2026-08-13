# ROOT Production Verification — `root.nexinus.net`

**Verified:** 2026-08-12 UTC  
**Primary host:** ROOT-Gate, AWS Lightsail, Oregon (`us-west-2a`)  
**Public hostname:** `https://root.nexinus.net`

## Release and Service Evidence

The audited ROOT self-owned-auth release was uploaded through the dedicated `rootdeploy` Ed25519 key and activated through the root-owned release installer. The installer rebuilt the exact locked release as `rootapp`, passed all eight automated tests, and started the production service successfully.

| Control | Verified result |
|---|---|
| Service state | `root-gateway` was active after activation. |
| TLS identity | A valid Let's Encrypt certificate was presented for `root.nexinus.net`. |
| HTTP transport | HTTP returned `308 Permanent Redirect` to HTTPS. |
| Data-store boundary | The deploy account could not read `/var/lib/root-gateway/root-auth.json`. |
| Key custody | The production encryption key remained in the root-owned `/etc/root-gateway/root.env` configuration, outside the source tree and public routes. |
| Release authority | `rootdeploy` can use only the root-owned release activator; it does not receive general sudo authority. |
| Internal service binding | Release `20260812T044352Z-e98d738` is active, with Node listening only at `127.0.0.1:4174`. |
| Direct IPv4 access | A direct request to `34.223.165.42:4174` timed out without a response. |
| Direct IPv6 access | A direct request to `[2600:1f14:159c:7600:39e5:ec3d:dc2d:b7c9]:4174` failed to connect. |
| Public gateway continuity | `https://root.nexinus.net/api/auth/me` returned HTTP 200 with the expected anonymous-session response and restrictive browser headers. |

## Self-Owned Authentication Acceptance

The public `GET /api/auth/me` endpoint returned an anonymous session response over HTTPS. A request with a foreign `Origin` header to the account-registration route returned **HTTP 403**. A disposable self-owned ROOT account was created with **HTTP 201** and then deleted with **HTTP 200**, removing that acceptance-test record and its session.

The live response contained the expected restrictive controls: Content Security Policy, HSTS, frame denial, MIME-type protection, no-referrer policy, restrictive permissions policy, and same-origin opener/resource policies.

## Resource-Origin Check

Browser resource inspection returned exactly one origin:

```
https://root.nexinus.net
```

No third-party identity, analytics, advertising, or behavioral-tracking resource origin was observed.

## Internal Port Closure Remediation

On 2026-08-12 UTC, ROOT-Gate’s prior all-interface listener was remediated at the application boundary rather than by adding a redundant firewall exception. The production systemd unit now provides `ROOT_BIND_HOST=127.0.0.1`, and the Node service respects that setting. Remote listener inspection confirmed that `4174` is bound exclusively to `127.0.0.1`; Caddy continues to provide the public HTTPS entry point. Direct public probes over IPv4 and IPv6 did not reach the Node service, while the public HTTPS authentication endpoint remained healthy.

## Connection Center Release

Release `20260812T235255Z-8199b36` added ROOT’s Mendocino County Connection Center and a member-controlled private action plan. The release passed 11 automated tests locally and again on ROOT-Gate, followed by a successful production build.

The live JavaScript bundle contained the Connection Center marker. A disposable production account successfully saved the reviewed `mendo-benefits` source, changed its own private step from `saved` to `ready`, and then deleted the account, which removed the test account and its stored action plan. The pathway API accepts only reviewed public source identifiers and three member-controlled statuses: `saved`, `ready`, and `complete`.

The live source catalog contains nine reviewed Mendocino County public pathways across housing, food navigation, benefits, work, broad 211 navigation, behavioral-health access, non-crisis support, and 24/7 mental-health crisis support. ROOT sends no provider-facing referral data, submits no application, determines no eligibility, and does not claim provider availability. The detailed source and publication boundary record is maintained in `CONNECTION_CENTER_SOURCES.md`.

## Project Reclaim Foundation Release

Release `20260813T000130Z-02df4a9` elevated Project Reclaim from a narrow local-source view to a flagship restoration and opportunity navigation plate. The public interface now presents the initiative’s fire mitigation, material recovery, workforce development, training, community resilience, and evidence posture while marking operational registries honestly as `DATA UNAVAILABLE` until real records are authorized and verified.

ROOT now serves a public review pack at `/project-reclaim-resource-pack-v0.1.json`. Production verification confirmed that the pack declares mesh synchronization as planned rather than active, retains Lake County as `watchlist`, marks projects and other operational registries as unavailable, and explicitly excludes member action plans, account data, emergency context, provider records, and unpublished county data. The release passed 14 automated tests locally and again on ROOT-Gate, followed by a successful production build. `RECLAIM_MESH_SYNC_BOUNDARY.md` documents the future node and data-class boundary.

## Lake County, Registry, and Offline Map Release

Release `20260813T002921Z-7ede92b` publishes Lake County under the user-authorized regional scope using five reviewed public pathways: county housing information, Social Services, 211 Lake County, behavioral-health access, and the county 24-hour mental-health crisis line. ROOT does not claim provider availability, establish a provider relationship, submit applications, or transmit member data.

The release adds an offline-capable public regional-orientation pack at `/reclaim-regional-map-v0.1.geojson`, containing generalized Mendocino and Lake County boundaries only. It contains no parcels, private addresses, member positions, project sites, material locations, emergency locations, or operational map features. A service worker registers on secure ROOT visits and precaches public ROOT, resource-pack, registry, and map assets for subsequent offline use.

The release also publishes `/project-reclaim-registry-v0.1.json`, a ten-registry foundation for projects, opportunities, jobs, materials, partners, metrics, evidence, signatures, CIDs, and ledger references. All registry arrays remain empty. Each record type is governed by documented source, status, provenance, review, and publication controls in `PROJECT_RECLAIM_REGISTRY_CONTROLS.md`.

Production verification confirmed the Lake County filter, public registry link, service-worker registration marker, two-county and fourteen-source resource pack, two-feature generalized map pack, empty ten-registry response, HTTPS anonymous-session endpoint, and localhost-only `127.0.0.1:4174` listener. The release passed 15 automated tests locally and again on ROOT-Gate, followed by a successful production build.

## CMAP Reference Alignment Release

Release `20260813T010230Z-8e17308` adds a public CMAP reference alignment manifest at `/project-reclaim-cmap-manifest-v0.1.json` and a Project Reclaim interface link. The manifest references the published `ARCHANGEL/v0` handshake and its challenge, authorized Ed25519 signature, allow-list verification, X25519/WireGuard peer-binding, CID re-derivation, and quarantine-first concepts without claiming ROOT has performed any of those operations.

Live verification confirmed the CMAP surface and manifest link in the deployed bundle. The live manifest reports `reference_only_not_enrolled`, `planned_not_active` synchronization, zero enrolled peers, zero public operational records, and `quarantine_pending_human_review` for future inbound material. No Project Reclaim CID, signature, ledger reference, node enrollment, or peer synchronization was fabricated or activated. The release passed 17 automated tests locally and again on ROOT-Gate, followed by a successful production build.

## CMAP Verification-Control Refinement

Release `20260813T011041Z-7741bbd` incorporates CMAP’s published reference controls into ROOT’s reference-only manifest: fail-closed `UNVERIFIED` default state, Ed25519 verification over raw response bytes before JSON parsing, strict canonicalization, maximum 120-second freshness TTL, maximum 30-second future-skew allowance, and counter handling that remains opaque until verified and is then subject to monotonicity review.

The supplied Nebulous Mesh activation package was inspected only as documentation. No script, configuration, WireGuard profile, key file, bootstrap action, health dashboard, or node artifact was extracted for use or executed. The manifest explicitly excludes package private keys, profiles, scripts, and untrusted health output. Live verification confirmed the refined manifest controls, anonymous HTTPS session health, and the loopback-only `127.0.0.1:4174` listener. The release passed 17 automated tests locally and again on ROOT-Gate, followed by a successful production build.

## First Owner-Authorized Project Reclaim Records

Release `20260813T013239Z-0dd522e` publishes two initial Project Reclaim foundation records for Mendocino and Lake Counties. The public registry now identifies NEXINUS RI Systems LLC as the owner-authorized initiating organization and Project Reclaim steward for the initial regional scope. It separately publishes the `Project Reclaim Material Recovery Intake · Mendocino & Lake` framework. The intake framework is explicitly not an inventory, material-availability claim, public site, price, buyer, seller, project, or third-party partnership.

No EIN, private contact information, member data, operational location, material-yard location, worksite, CID, cryptographic signature, or ledger reference appears in the public registry or resource pack. Live verification confirmed exactly one partner-registry entry and one materials-registry entry; projects, jobs, signatures, CIDs, and ledger references remain empty. The public resource pack mirrors those two foundation records and retains `data_unavailable` for projects and cryptographic proof records. The release passed 18 automated tests locally and again on ROOT-Gate, followed by a successful production build.

## ROOT Sovereign-Record Compound Release

Release `20260813T024641Z-90cbc16` re-centers ROOT on the member’s self-owned account, consent, proof, correction, revocation, and controlled private record. New ROOT accounts receive a private account-control receipt that documents self-chosen handle/password registration only; it does not claim legal, biometric, governmental, or real-world identity verification.

Authenticated members can now create private attestations, narrow internal-storage consent receipts, and private source-declared Truth Talk claim drafts. These records stay in the encrypted ROOT account store and are never published or sent to a provider by the feature. Each receipt has a deterministic SHA-256 integrity digest over declared record facts. Members can correct an active private attestation or claim through a separate private correction record, withdraw active private records, revoke active internal consent receipts, export only their own private record view as JSON, or delete their account together with its sessions, action plan, and private ledger records.

The release adds unit coverage for canonical integrity receipts, private claim/consent validation, and state changes, as well as an isolated encrypted-service integration test for ownership denial, correction, consent revocation, export, and account deletion. Production verification created and deleted a disposable account, confirmed its initial account-control receipt, created a private attestation, revoked consent, corrected a private claim, exported the account record view, and confirmed post-deletion access denial. The release passed 23 automated tests locally and again on ROOT-Gate, followed by a successful production build. Public HTTPS health and the loopback-only `127.0.0.1:4174` listener were also confirmed.

## ROOT Sovereign Identity Infrastructure Release

Release `20260813T032039Z-6f1d75b` adds voluntary private identity profiles, private recovery kits, session control, structured proposed consent grants, and expanded member portability to ROOT’s existing private record layer. A profile can contain only an optional display name, optional self-description, and member-selected posture. ROOT marks it `self_asserted_not_third_party_verified` and does not make it public.

Members can create, replace, or revoke a one-time recovery kit. ROOT shows the recovery code once and persists only its hash. Using a valid kit resets the ROOT password, invalidates the kit, and terminates prior sessions. ROOT provides no email recovery, social login, or external recovery custodian. Members can view the count and timing of their own sessions without IP addresses, device fingerprints, or behavioral telemetry, then end all other sessions.

The release also adds structured private consent grants containing a recipient label, purpose, selected scope, optional expiration, and revocation state. Their execution state is `recorded_not_executed`: ROOT neither moves data nor contacts the named recipient. The v2 private export includes the member’s profile and a machine-readable interoperability posture: `did`, `verifiableCredential`, `signature`, `credentialStatus`, and `externalPresentation` are all `not_issued`.

The capability audit is documented in `SOVEREIGN_IDENTITY_INFRASTRUCTURE_GAP_ANALYSIS.md`, including the distinction between ROOT private integrity receipts and future interoperable standards. Production verification created a disposable account, saved a pseudonymous private profile, created and revoked an additional session, created a recovery kit, recorded and revoked a proposed grant, confirmed the v2 export’s honest interoperability state, used the recovery kit to reset the password and invalidate the prior session, deleted the account, and confirmed post-deletion access denial. The release passed 25 automated tests locally and again on ROOT-Gate, followed by a successful production build. HTTPS health and the loopback-only `127.0.0.1:4174` listener remained verified.

## Remaining Operational Requirement

The RSA private key that was pasted into chat remains compromised. It must not be authorized anywhere and should be removed from every server, repository, workstation, and deployment location where it might have been installed. The dedicated ROOT deploy key is now the authorized routine deployment credential.
