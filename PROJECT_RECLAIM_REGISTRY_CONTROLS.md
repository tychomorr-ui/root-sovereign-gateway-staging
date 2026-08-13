# Project Reclaim Registry Controls

**Status:** foundation implemented; no operational records published as of 2026-08-13 UTC.  
**Purpose:** define how ROOT may record and publish real Project Reclaim work without inventing projects, jobs, inventory, partnerships, metrics, evidence, signatures, CIDs, or ledger events.

## Core Rule

> A record is not published because it would be useful, attractive, or plausible. It is published only when its source, status, regional scope, and stated evidence requirements are present and a designated publication decision has occurred.

| Registry | What it represents | Minimum publication controls | Present state |
|---|---|---|---|
| Projects | A real restoration, mitigation, training, recovery, infrastructure, or community-work effort | County scope, authorized source, real status, public summary, publication decision | Empty |
| Opportunities | A verified way to participate through work, training, contracts, volunteering, resources, or a community need | Source organization, status, public contact/application route, review date | Empty |
| Jobs | A real role, contract, seasonal role, apprenticeship, internship, or volunteer opportunity | Organization, role status, service area, application method, verification date | Empty |
| Materials | A real recovered wood, biomass, equipment, or reusable resource | Material category, source or custody boundary, availability status, review decision | Empty |
| Partners | An organization with an explicit documented relationship to a Project Reclaim record | Written authorization, relationship scope, review date | Empty |
| Metrics | A defined, sourced measurement of actual work or outcome | Metric definition, source method, period, reviewer | Empty |
| Evidence | A document, photograph, report, or other record tied to a real event | Evidence type, source, capture time, access classification | Empty |
| Signatures | A cryptographic attestation over a specific real payload | Key identifier, algorithm, payload reference, verification result | Empty |
| CIDs | A content-addressed identifier for stored material | Content hash, storage proof, retrieval verification | Empty |
| Ledger references | A confirmed record in an actual immutable ledger | Ledger system, event reference, confirmation evidence | Empty |

## Provenance Chain

Every public operational record should retain a traceable **source → review → publication → correction/revocation** chain. A future signature, CID, or ledger reference may strengthen integrity and retrieval evidence, but does not by itself establish factual truth, legal authority, environmental benefit, job availability, partnership approval, or a person’s eligibility.

The controlling record should identify a plain-language correction path. If a source changes, expires, or is withdrawn, ROOT should change the public state to corrected, expired, withheld, or revoked rather than silently leaving an outdated claim online.

## Geospatial Controls

ROOT’s v0.1 offline map is a generalized public **regional-orientation** pack for Mendocino and Lake Counties. It is not a property viewer, site map, worker tracker, evacuation map, hazard map, legal boundary map, or source of emergency-routing instructions.

| May appear in a future public map pack | Must never enter a public or mesh pack without a separate, documented authorization |
|---|---|
| Generalized county boundaries | Member position, route history, or device telemetry |
| Publicly published official resource point with a source URL and review date | Home, private property, worksite, staging area, material-yard, or sensitive habitat coordinates |
| Explicitly authorized public event or project boundary at suitable generalization | Parcel, assessor, owner, application, case, provider, or emergency records |
| Public hazard or planning layer with its own source and limitation | Any inferred sensitive location derived from another record |

The current Lake County and California source portals both describe geographic information as advisory and include boundary limitations; ROOT preserves those limitations rather than presenting its orientation pack as authoritative for land, parcel, or safety determinations.[1] [2]

## Future Intake Sequence

A real record should enter ROOT only after a designated operator enters or imports it from an authorized source, attaches the source reference and review date, selects its geographic classification, and approves a publication state. Member interest, work participation, applications, private evidence, and nonpublic sites must remain separate from the public registry. No automated web scrape should turn a mention of a program, grant, job, partner, incident, or material source into a ROOT claim.

## References

[1]: https://gis.data.ca.gov/datasets/California::california-county-boundaries-and-identifiers/about "California County Boundaries and Identifiers"
[2]: https://gis.lakecountyca.gov/portal/home/index.html "Lake County GIS Mapping Portal"
