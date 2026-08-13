# Project Reclaim Resource Packs and Future Monarch OS Nodes

**Current state:** ROOT publishes a versioned, public-review resource-pack file at `/project-reclaim-resource-pack-v0.1.json`. **No mesh synchronization, node enrollment, cryptographic signing, IPFS publication, CID generation, or peer replication is active.**

## Purpose

The future mesh connection is an offline-capable distribution path for approved, non-sensitive Project Reclaim material. It should let a Monarch OS user retain a current copy of public pathways and the initiative’s published structure during weak or absent connectivity. It must not turn ROOT into a general replication service or transfer people’s private circumstances across nodes.

> **Public packs may travel. Private paths stay with the member. Operational records move only under separate, role-limited authorization.**

## Three Data Classes

| Class | Future node treatment | Examples |
|---|---|---|
| **Public resource pack** | May be cached and later synced by a node only after pack validation. | Reviewed public sources, published county scope, public initiative pillars, version, review date, public-source URLs. |
| **Operational Project Reclaim record** | Must remain in a separately authorized local deployment; never included by default in a public pack. | Verified project, work order, crew assignment, material record, evidence object, partner authorization. |
| **Private member record** | Never eligible for node replication. It remains in the member-controlled ROOT account or local device store. | Account, session, action-plan state, address, property detail, location, emergency context, provider correspondence, application, eligibility decision. |

## Future Pack Lifecycle

| Stage | Required evidence | Status today |
|---|---|---|
| Author source record | Official source URL, review date, county policy, publication state. | Implemented for current Mendocino public sources. |
| Build public pack | Schema validation plus explicit exclusion of private and unpublished content. | Implemented as a static v0.1 public-review pack. |
| Sign pack | Owner-controlled signing key and publicly verifiable key fingerprint. | Planned; not active. |
| Node fetch/cache | A member or node deliberately obtains a valid signed pack and keeps a local cached copy. | Planned; not active. |
| Peer relay | A separately enrolled relay forwards the validated public pack without reading or augmenting private member data. | Planned; not active. |
| Revocation/update | New manifest supersedes an old pack; nodes surface stale or revoked status honestly. | Planned; not active. |

## Multi-County Publication Rules

The data model treats geography as configuration rather than a hard-coded product limit. Every county has a publication state. Mendocino County is currently `published`; Lake County is `watchlist` and is deliberately excluded from the public site and pack. A future county remains `unconfigured` or `review` until a designated authority has verified its sources and approved publication.

Adding a county must require, at minimum, a geographic scope, official-source provenance, review date, publication decision, responsible reviewer, and a clear statement of what ROOT does **not** do. A county cannot become public merely because a URL exists.

## Project Reclaim Program Model

The user-provided architectural directive and Project Reclaim white paper identify the physical mission as the priority: fire mitigation, forest and vegetation management, wood and biomass recovery, workforce development, education, employment, land stewardship, emergency preparedness, ecological restoration, and community resilience. The portal architecture therefore uses the following future-facing chain:

`Need → people → project → work → resource → evidence → outcome`

ROOT presently carries only the navigation-plate and public-source portions of that chain. Its public Project Reclaim page must state `IN DEVELOPMENT` or `DATA UNAVAILABLE` for operational registries until real projects, jobs, materials, partners, evidence, and outcomes are authorized and verified.

## Non-Negotiable Limits

The system must not fabricate a project, job, crew, inventory, partner, grant, property assessment, mitigation outcome, CID, signature, ledger record, or metric. It must not use an offline pack to monitor a device, collect precise location, infer a member’s circumstances, or relay emergency information. A future command interface may help a person inspect a pack or prepare an action, but it must not silently apply, refer, publish, route a private record, or enroll a laptop as a relay.

## Canonical Inputs

This design derives from the user-provided **Project Reclaim Manus Master Initialization & Architecture Directive** and **Project Reclaim: A National Framework for Human Restoration, Version 1.0 Draft**. These documents define the initiative model; they do not establish that a specific project, job, material, partnership, metric, or provenance record already exists.
