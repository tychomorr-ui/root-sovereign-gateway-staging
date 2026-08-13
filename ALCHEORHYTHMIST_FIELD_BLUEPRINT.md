# The Alcheorhythmist Field Blueprint

## The Core Move

The next level is not a larger dashboard. It is a **field-capable operating rhythm**: a person can carry an understandable public resource atlas, orient themselves without a connection, receive a small verified update when a carrier exists, decide whether to act, and leave behind evidence only when the physical work actually happened.

In that sense, **alcheorhythmist** is a useful design name. It means turning scattered facts, materials, and human willingness into a repeatable rhythm of accountable action:

> **Need → orientation → consent → work → evidence → review → reusable public knowledge.**

Nothing in that sequence needs to surveil a person. The person remains the point of control. The system only gains authority when a human grants it a narrow, visible task.

## What Exists, What Is Prepared, and What Is Not Yet Real

| Layer | Live now | Prepared next | Not yet active |
|---|---|---|---|
| **ROOT** | Self-owned accounts, private action plans, reviewed Mendocino and Lake public pathways, Project Reclaim public registry and resource pack | Better public-pack curation and local verification UX | Provider referrals, member-data exchange, background collection |
| **Project Reclaim** | Initiating-organization record and material-recovery intake framework for the two-county scope | First actual project, material, opportunity, or evidence record when facts exist | Inventory, jobs, sites, partner relationships, metrics, outcomes |
| **Offline geography** | Generalized two-county orientation geometry cached after a secure ROOT visit | Versioned public map packages and local-only map viewing | Parcel maps, worksite maps, person tracking, emergency-location maps |
| **CMAP** | Reference manifest with fail-closed proof rules | Local verification of a real signed public artifact | Enrolled peer, signed event, CID, ledger reference, continuous sync |
| **Monarch OS** | Separate, user-led reproducible operating-system workstream | Local public-pack reader, verifier, and human-controlled exchange surface | Radio bridge, node daemon, automated peer exchange |

The distinction is not a weakness. It is the mechanism that prevents a planned capability from becoming an unearned claim.

## The Six-Layer Field System

### 1. The Ground Layer: Real Conditions

This is the physical world: a land-management need, a recoverable material, a training opportunity, a volunteer, a worker, a local organization, or a public resource. The Ground Layer is where Project Reclaim earns its meaning. Digital systems do not replace this layer; they make the work easier to find, coordinate, document, and review.

### 2. The Personal Device Layer: Monarch OS

Monarch OS can become the private field desk. It should let a person keep a local copy of approved public packs, inspect version and proof state, open the generalized two-county orientation map, and choose whether to import or delete a public update. It should not auto-enroll the device, auto-transmit a location, or turn the device into a relay without an explicit operator choice.

The local device is where the most important sovereignty decision is made: **nothing leaves by default**.

### 3. The Public-Pack Layer: ROOT

ROOT is the public-pack foundry. It turns reviewed public information into small, versioned, cacheable objects: the two-county connection pack, the generalized orientation map, and a carefully bounded Project Reclaim registry. This is useful even with no mesh at all.

The pack is not a database dump. It is a deliberately limited public artifact. It includes what a person can safely carry and inspect; it excludes member accounts, action plans, applications, provider records, case context, addresses, worksite details, and private custody information.

### 4. The Exchange Layer: Carrier-Agnostic Transport

The carrier is not the system of trust. A pack can move over a local Wi-Fi link, Ethernet, a removable drive, a secure internet route, or eventually a radio notice. The same public artifact should verify the same way regardless of how it arrives.

This turns “offline” into something practical: a device can receive an update from another device, later confirm it against a known proof, and still keep the decision local.

### 5. The Proof Layer: CMAP

CMAP is the truth discipline above the carrier. It asks, “What exact bytes arrived? Who signed them? Are they fresh? Does the declared content address match? Is the counter consistent? Has a human reviewed the claim?” A successful radio transmission cannot answer those questions by itself.

The first real proof chain should remain modest:

```text
approved public record
  → canonical public bytes
  → actual content address
  → Ed25519 signature
  → local raw-byte verification
  → quarantine / reviewer decision
  → optional confirmed ledger reference
```

The correct response to a failure is not “probably good.” It is **UNVERIFIED**.

### 6. The Human-Governance Layer: The Irreplaceable Layer

No model, mesh, signature, or ledger should decide that a material is available, a partner exists, a worksite is safe, a worker is qualified, or a community need is understood. Those are human decisions backed by evidence. ROOT can preserve who made a narrow publication decision and why; it should never override that person’s decision.

## The Field Loop That Makes Project Reclaim Real

The most powerful future interface is not a generic “map.” It is a **mission card** that only appears when a real public record exists.

| Field moment | Local device behavior | Public record behavior | Prohibited behavior |
|---|---|---|---|
| A resident identifies a local need | Keeps notes locally or chooses an approved public route | None until a source authorizes publication | Automatic reporting, location capture, or public posting |
| A material source becomes available | Prepares a draft with only approved public fields | Material record remains `draft` until reviewed | Claiming availability, custody, or a site without permission |
| A Project Reclaim steward reviews it | Compares source evidence and chooses a scope | Public record becomes eligible for canonicalization | Silent approval or fabricated proof |
| A local device receives an update | Shows origin, state, and verification result | Keeps it quarantined until review rules pass | Automatic overwrite of a local trusted copy |
| Physical work concludes | Evidence stays private or is selectively released | Only approved public evidence can be signed | Turning workers, residents, or sites into surveillance data |

This produces a practical north star: **the public system gets more useful because physical work becomes better documented, not because people become more monitored.**

## The Public Mission Atlas

For the Mendocino–Lake pilot, Monarch OS can eventually show four public-only atlas modes:

| Atlas mode | Purpose | Data allowed |
|---|---|---|
| **Community Resource Atlas** | Help a person find reviewed public resources offline | Official public pathways and general county scope |
| **Project Reclaim Opportunity Atlas** | Show real, approved jobs, training, material, volunteer, or project opportunities | Only published public records with explicit status and public handoff route |
| **Evidence Atlas** | Show that an approved public outcome has supporting public evidence | Public evidence references, verified state, and review status—not private media or locations |
| **Resilience Orientation Atlas** | Help a user understand the two-county regional context | Generalized boundaries and explicitly public facilities/routes only after verification |

No atlas mode should display a home, parcel, survivor, crew position, private material yard, emergency location, or a person’s device location by default.

## The Prototype Ladder

### Milestone A — The Pack Forge

Create a local Monarch OS reader that opens the existing public ROOT pack and two-county orientation map. The reader must show the pack version, publication state, exclusions, and current proof status. Success means a device can work with a downloaded pack when completely offline.

### Milestone B — The Field Verifier

Use two local devices and one real approved public artifact. One device creates canonical public bytes, computes the real content address, signs it using a separately controlled Ed25519 key, and transfers it by a local file or LAN link. The second device independently verifies the exact bytes. Success means the devices reach the same outcome without relying on a central service.

### Milestone C — The Deliberate Exchange

Add an import screen that displays: source, scope, record kind, public fields, proof state, and a clear **Accept / Keep Quarantined / Reject** choice. This is the point where human sovereignty becomes an interface rather than a policy sentence.

### Milestone D — The Compact Radio Notice

Only after the first three milestones work, evaluate a low-bandwidth radio notice. The notice carries a public-pack version, narrow public scope, and an actual CID after one exists. It does not carry tiles, full maps, documents, images, evidence media, or personal data. Full artifacts travel by a carrier that can support them later.

### Milestone E — The CMAP Node Pilot

After a real operator, node key, public scope, revocation path, hardware placement, and radio compliance record are established, enroll a single pilot node. Its first job is not to “run a network.” Its first job is to exchange one public pack and prove that a second device can independently reject or accept it correctly.

## Two Viable Paths From Here

| Approach | Outcome | Tradeoffs | Cost | Setup complexity |
|---|---|---|---:|---|
| **Local-first proof pilot** | Monarch OS verifies one real public Project Reclaim artifact between two devices using local transfer only. | No long-range exchange yet, but it tests the critical truth and consent machinery first. | Uses existing devices. | Moderate. |
| **Radio-notice pilot** | A small LoRa notice announces a new verified public pack to consented local nodes. | Requires certified hardware, careful radio configuration, operator ownership, and field validation; radio is not suitable for maps or large records. | Requires radio hardware and local power/antenna support. | High. |

The first path establishes the capability that matters: **independent local verification**. The second adds reach only after the first path works. The radio technology should be chosen as a transport tool—not as the source of truth or a replacement for community trust.

## The Non-Negotiable Boundaries

The next level fails if it turns into a tracking system, a false ledger, or an automatic authority. The following must remain true:

> **No data selling. No third-party behavioral tracking. No silent location collection. No private record replication. No fabricated work. No “green” verification state from an error. No claim of a mesh before a measured, reviewed pilot exists.**

That is the real magic here: an infrastructure that gets more capable without becoming more coercive.
