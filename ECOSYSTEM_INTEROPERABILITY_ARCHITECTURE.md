# ROOT Ecosystem Interoperability Architecture

**Scope:** ROOT, `universaltruth.life`, `resonate-earth.live`, and `xinus.one`  
**Author:** Manus AI  
**Status:** Architecture proposal only — no data sharing, account linking, node enrollment, credential issuance, or cross-application automation has been enabled.

## Decision in Plain Terms

These applications should be connected as a **member-controlled ecosystem**, not collapsed into a single shared database or a universal surveillance layer. ROOT should act as the **consent and permissions gateway**. Each other application should remain independently deployable, independently secured, and able to function when the others are unavailable.

> **An application is not automatically a node.** An application is a member-facing service. A node is a specifically enrolled, cryptographically identified deployment that has a defined role, a signed capability declaration, a permitted network boundary, and a revocable operating grant.

That distinction makes the 18-node federation practical. It prevents a site, a dashboard, or a public page from being mistaken for a trusted control-plane participant merely because it carries ecosystem branding.

## Current Public Roles

The public sites presently describe distinct but complementary roles. Their public statements must be treated as self-described product posture, not as independent verification of their displayed health or node telemetry.

| Surface | Observed public role | Recommended ecosystem role | Data boundary |
|---|---|---|---|
| **ROOT** | Private-by-default member gateway for permissions, attestations, services, emergency boundaries, and Project Reclaim. | **Consent gateway and member-controlled capability wallet.** | Holds private ROOT member records and consent receipts; does not export them by default. |
| **Universal Truth** (`universaltruth.life`) | Presents a sovereign console with node/probe and operations concepts, including explicit “honest standby” language. [1] | **Operations and evidence console.** | Receives only signed node-health or release-proof receipts that an enrolled node is permitted to publish. |
| **Resonate Earth** (`resonate-earth.live`) | Presents a public Nebula Mesh, proof-ledger concepts, and browser-side file/hash verification. [2] | **Public proof and publication surface.** | Receives public artifacts and voluntarily published proof receipts only; never private member pathways or emergency records. |
| **XINUS MonarchOS** (`xinus.one`) | Presents browser-resident identity, a local ledger concept, node diagnostics, and an operating-intelligence surface. [3] | **Local-first runtime and member-held key interface.** | May hold locally generated keys and user-selected receipts; it must not silently synchronize member data to ROOT or any node. |

## The Connection Model

The recommended design has **four independent planes**. A failure or compromise in one plane must not automatically grant access to another.

| Plane | Purpose | Permitted payloads | Prohibited payloads |
|---|---|---|---|
| **Public discovery** | Let a person move among sites and inspect what each surface is. | Signed app manifests, public keys, version information, public source links, public proof receipts, human-readable terms. | Member identifiers, session identifiers, location, private evidence, private telemetry. |
| **Member consent** | Allow a member to approve a narrowly defined action across a named origin. | A signed consent receipt with purpose, recipient origin, data category, expiry, revocation handle, and scope. | Silent account linking, blanket future sharing, biometric data, emergency-history replication. |
| **Proof exchange** | Allow one service to verify a specific claim without obtaining the underlying record. | Challenge-bound, short-lived signed presentation; credential status result; minimal requested claim. | Whole user profiles, event histories, raw Trust Event records, unrestricted score feeds. |
| **Node operations** | Let enrolled infrastructure make health and capability claims. | Signed manifest, signed uptime/release receipt, allowed capability set, key rotation statement, non-member operational status. | Member content, model prompts, secret material, raw IP-address trails, behavioral analytics. |

### What “Connected” Means at Each Maturity Level

| Level | Member experience | Data movement | Risk and prerequisite |
|---|---|---|---|
| **1. Verified links** | ROOT displays the three destinations as external ecosystem surfaces with clear purpose labels. | None. | Lowest risk; can be implemented immediately. |
| **2. Signed discovery** | A site can show that a destination’s public manifest and signing key are current. | Public signed manifests and proof receipts only. | Requires per-application keys, HTTPS, and a key-rotation procedure. |
| **3. Member-selected proof** | A member can prove a specific, requested capability to another site, then return to ROOT. | A short-lived, challenge-bound presentation selected by the member. | Requires explicit consent UX and cryptographic verification. |
| **4. Enrolled node federation** | Approved nodes exchange limited signed operational receipts and service availability claims. | Allowlisted control-plane messages only. | Requires node attestation, revocation, audit, incident response, and a defined control-plane protocol. |
| **5. Opt-in private collaboration** | A member deliberately transfers a specific private artifact to a named service. | End-to-end encrypted payload under a one-time grant. | Requires recipient-key discovery, encryption, expiry, deletion semantics, and regional transfer consent. |

Levels 1 and 2 are the correct starting point. Levels 3 through 5 should not be enabled until every app’s real deployment, storage, authentication, and incident-response posture has been independently verified.

## Identity and Consent Design

ROOT should not become a shared single-sign-on authority that invisibly follows a member around the ecosystem. Instead, ROOT can issue a **scoped capability receipt** only after the member sees and approves the exact request.

The W3C Verifiable Credentials model separates issuer, holder, and verifier roles and supports cryptographically verifiable credentials and presentations. It also makes an important distinction that applies directly to Truth Talk: successful cryptographic verification confirms authenticity and currency of a statement, but does **not** itself establish that a claim is true. [4] ROOT’s existing non-binary TruthOK posture is therefore appropriate.

The W3C DID model describes identifiers controlled by the subject and documents that can carry verification methods and service endpoints. It is useful for app and node identities, but any DID method must be selected deliberately; the standard does not require a blockchain or a particular registry. [5] ROOT should initially use self-hosted, domain-bound signing keys and a simple signed manifest rather than inventing a new DID method.

For later presentation flows, OpenID for Verifiable Presentations defines a request-and-presentation model in which a verifier asks for selected credential claims and the holder authenticates and consents to the presentation. [6] That is a safer future pattern than copying accounts or profiles between applications.

### Required Consent Receipt

Every cross-application action should produce a member-readable receipt with the following fields:

| Field | Required rule |
|---|---|
| **Requesting app origin** | Exact HTTPS origin, not a brand label alone. |
| **Recipient service / node** | Signed service or node identifier and current public key fingerprint. |
| **Purpose** | Single human-readable purpose, such as “prove active ROOT member status.” |
| **Requested data** | Individual claims, never an implied whole profile. |
| **Duration** | Short expiry. No indefinite grant. |
| **Reuse** | Off by default; a new purpose requires a new grant. |
| **Region** | Display the processing region before any private payload leaves ROOT. |
| **Revocation** | One action in ROOT invalidates future access immediately. |
| **Receipt** | Append-only, member-visible record with no behavioral-tracking fields. |

## Recommended App-to-App Flows

### ROOT → Universal Truth

ROOT may link a member to Universal Truth with **no member data in the URL**. A later, approved flow could let the member present a narrowly scoped receipt such as “this person controls a valid ROOT capability.” Universal Truth should receive only the signed receipt and a short-lived nonce; it should not receive the ROOT handle, session cookie, Trust Event history, or raw Truth Score.

### ROOT → Resonate Earth

Resonate Earth is the right destination for **publicly intended proof artifacts**: source hashes, public publication receipts, release attestations, or member-chosen public declarations. Private member records, Project Reclaim interest, emergency matters, and Lake County watchlist material must remain outside this channel.

### ROOT → XINUS MonarchOS

XINUS can become the member-side key and local-proof surface, where a person signs a challenge or holds their own credential material. ROOT should only accept an XINUS-origin proof when it is challenge-bound, expires quickly, names the requesting ROOT origin, and has been explicitly approved by the member. A public site status screen must never be treated as a credential issuer or an authority over ROOT members.

### Node → Node

Each enrolled node should publish a signed `node-manifest.json` containing only its node ID, role, region, public key, supported message types, software/release digest, validity window, and revocation endpoint. Nodes should exchange only allowlisted messages over mutually authenticated, encrypted channels. The initial messages should be limited to:

1. Capability declaration;
2. Availability or maintenance state;
3. Signed deployment or source-proof receipt;
4. Key-rotation announcement; and
5. Revocation or incident-status notice.

No member content, session data, emergency location, raw prompts, private pathways, or user-behavior events belong in node health messaging.

## Regional and Privacy Boundaries

The Oregon ROOT-Gate remains the primary location for ROOT member data. Frankfurt and Singapore may later operate as **public proof relays, availability relays, or standby nodes**, but they must not receive member data merely because they are part of the mesh. A transfer of a private member artifact across a regional boundary requires a separate, visible grant that states the recipient, purpose, categories of data, retention, and destination region.

This gives each region a usable role without creating a hidden replication system:

| Location / role | May hold without member grant | Requires a member grant |
|---|---|---|
| Oregon ROOT primary | ROOT private data needed to serve the member under ROOT’s terms. | Any sharing outside ROOT’s defined service purpose. |
| Frankfurt node | Public manifest, public release receipt, encrypted node-control messages. | Any ROOT member record or decrypted private artifact. |
| Singapore node | Public manifest, public proof receipt, encrypted node-control messages. | Any ROOT member record or decrypted private artifact. |
| Browser-local XINUS surface | Locally generated keys and member-selected local receipts. | Uploading any data to a node or another app. |

## A Responsible Path Toward an LLM and Operating System

The applications and nodes can support a future sovereign intelligence layer, but they should not be treated as a training-data funnel. The safe sequence is:

1. **Build the control plane before the model plane.** Establish keys, manifests, consent receipts, audit receipts, and revocation first.
2. **Use public, licensed, or separately opted-in materials for model work.** Member records, emergency data, private pathways, and undeclared prompts are excluded by default.
3. **Separate inference from training.** Using a member’s prompt to answer them does not authorize retention for fine-tuning, evaluation, or cross-member retrieval.
4. **Make training consent distinct and granular.** It must state dataset category, model purpose, retention, jurisdiction, and whether a human can review the material. Revocation stops future use, while already-completed training requires an honest non-retroactivity disclosure rather than a false promise of “untraining.”
5. **Keep the model advisory.** It can summarize, retrieve permitted knowledge, or help a member create material, but it must not make governance, emergency, service-access, employment, legal, medical, or identity decisions for a person.

## Implementation Choices

| Approach | Outcome | Tradeoffs | Cost | Setup complexity |
|---|---|---|---|---|
| **Verified ecosystem links** | ROOT presents clearly labeled outbound links to Universal Truth, Resonate Earth, and XINUS. | No shared sign-in, proof, or data exchange. | Minimal. | Low. |
| **Signed discovery and proof layer** | Each app and enrolled node publishes a signed manifest; ROOT can later conduct member-approved, narrowly scoped proof presentations. | Requires real key custody, consent UX, verifier logic, revocation, and cross-origin security review. | Moderate engineering effort. | Medium to high. |
| **Shared accounts or shared database** | One apparent ecosystem login and broad data availability. | Conflicts with member sovereignty, amplifies breach impact, creates cross-border replication and surveillance risk. | Ongoing operational and compliance cost. | High. |

The viable path is to start with verified links, then add signed discovery, and only then introduce member-selected proof. Shared accounts and shared databases should be rejected for ROOT’s current privacy model.

## Implementation Gate Before Any Deeper Connection

Before enabling signed discovery or cross-application proof, complete these prerequisites:

| Gate | Evidence required |
|---|---|
| **Deployment ownership** | Current code and deployment access for each site, including the Lovable and Bolt projects or a clean export to user-controlled hosting. |
| **HTTPS and domain control** | Valid HTTPS endpoints and a documented owner-controlled DNS/key rotation process. |
| **Data map** | A written inventory of what each app stores, where it stores it, how long it retains it, and whether any vendor telemetry is enabled. |
| **Key custody** | Per-app and per-node Ed25519 signing keys outside source control, with rotation and revocation procedures. |
| **Manifest format** | A reviewed signed public manifest and an allowlist of permitted origins and message types. |
| **Consent UX** | Member-visible, purpose-specific grant and revocation screens with test coverage. |
| **Security review** | Cross-origin, replay, nonce, redirect, token leakage, XSS, CSP, logging, and third-party-resource review. |
| **Node admission** | A node record with role, region, operator, capability set, review date, public key, and revocation path. |

## Conclusion

ROOT should be the **permission switchboard**, not a data vacuum. Universal Truth can be the evidence/operations window, Resonate Earth can be the public proof/publishing surface, and XINUS can be the local-first member key and runtime surface. The nodes then become independently enrolled infrastructure participants that can advertise their capabilities and health honestly, without inheriting access to people or data.

This approach gives the ecosystem a real foundation for later federated services and sovereign intelligence while preserving the non-negotiable rules: no data selling, no surveillance, no third-party tracking, member-controlled access grants, no fabricated health claims, and no automatic replication of private identity data.

## References

[1]: https://universaltruth.life "NEXINUS · TERMINUS · Sovereign Console"
[2]: https://resonate-earth.live "The Sovereign Operating System — Nebula Mesh"
[3]: https://xinus.one "XINUS MonarchOS"
[4]: https://www.w3.org/TR/vc-data-model-2.0/ "W3C Verifiable Credentials Data Model v2.0"
[5]: https://www.w3.org/TR/did-1.1/ "W3C Decentralized Identifiers v1.1"
[6]: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html "OpenID for Verifiable Presentations 1.0"
