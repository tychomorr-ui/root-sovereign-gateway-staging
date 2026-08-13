# Project Reclaim Canonical Record and CMAP Envelope Template

**Status:** format specification only. Every identifier, key, CID, signature, counter, timestamp, and ledger reference below is a placeholder. This document is **not** a signed record, a content-addressed object, or a ledger event.

## 1. Public Record Payload

This is the payload that a future authorized Project Reclaim operator prepares before canonicalization. It contains only information cleared for public release.

```json
{
  "schema": "root.project-reclaim.record.v0.1",
  "recordId": "pr-<county>-<record-kind>-<stable-id>",
  "visibility": "public",
  "recordKind": "material_listing | initiating_organization | project | opportunity | evidence",
  "status": "published | withdrawn | superseded",
  "countyScope": ["Mendocino County | Lake County"],
  "publishedAt": "<UTC ISO-8601 timestamp>",
  "publicStatement": "<approved public description>",
  "sourceAuthority": {
    "kind": "owner_authorization | published_source | written_authorization | evidence_review",
    "reference": "<public URL or internal release reference>",
    "reviewedAt": "<UTC ISO-8601 timestamp>"
  },
  "publicGeometry": null,
  "privacyBoundary": "No member data, private address, parcel, worksite, material-yard location, case information, emergency context, or private custody data is present."
}
```

`publicGeometry` is `null` unless a separate public-location decision exists. A county-wide scope never implies permission to publish a property or worksite.

## 2. Example Shapes Without Claims

### Owner-Authorized Initiating Organization

```json
{
  "recordKind": "initiating_organization",
  "status": "published",
  "countyScope": ["Mendocino County", "Lake County"],
  "publicStatement": "<organization> is the owner-authorized initiating organization and Project Reclaim steward for the initial regional scope.",
  "sourceAuthority": {
    "kind": "owner_authorization",
    "reference": "<internal authorization receipt identifier>",
    "reviewedAt": "<UTC ISO-8601 timestamp>"
  },
  "publicGeometry": null
}
```

### Actual Material Listing

```json
{
  "recordKind": "material_listing",
  "status": "published",
  "countyScope": ["<county>"],
  "publicStatement": "<approved material category and availability statement>",
  "material": {
    "category": "logs | lumber | milling_stock | firewood | biomass | chips | reclaimed_building_material | other",
    "availability": "available | reserved | recovered | withdrawn",
    "publicHandoff": "<approved public contact or source route>"
  },
  "sourceAuthority": {
    "kind": "written_authorization",
    "reference": "<public source or authorization receipt>",
    "reviewedAt": "<UTC ISO-8601 timestamp>"
  },
  "publicGeometry": null
}
```

The material template is **not** permission to publish an item. Its source, custody scope, public availability statement, and publication decision must exist first.

## 3. Canonicalization and Proof Envelope

The complete public payload is strictly canonicalized before hashing. The canonicalizer sorts object keys, rejects non-finite values and unrepresentable data, and must not silently coerce values. The exact canonical UTF-8 bytes are the source for content addressing and signing. This follows CMAP’s published raw-byte and strict-canonicalization posture.[1] [2]

```json
{
  "schema": "root.project-reclaim.cmap-envelope.v0.1",
  "protocol": "ARCHANGEL/v0",
  "payload": "<exact canonical UTF-8 bytes, represented or transported without transformation>",
  "proof": {
    "state": "unsigned_template",
    "contentDigest": null,
    "cid": null,
    "cidVersion": null,
    "signer": {
      "keyId": null,
      "algorithm": "Ed25519",
      "publicKey": null
    },
    "signature": null,
    "signedAt": null,
    "counter": null,
    "freshnessTtlSeconds": 120,
    "verification": "unverified",
    "ledgerReference": null
  }
}
```

When a record is real and approved, the proof fields transition in this order:

> **Approved public payload → strict canonical UTF-8 bytes → actual digest/content addressing → actual CID → Ed25519 signature over the declared canonical bytes → raw-byte verification → freshness and counter review → optional confirmed ledger reference.**

CMAP’s published model remains fail-closed: a verification error, expired payload, unexpected future timestamp, malformed counter, or signature mismatch resolves to `UNVERIFIED`, not to a successful state.[1] [2]

## 4. Future Offline and Node Exchange Envelope

For a future CMAP-enrolled node, a public record is not accepted simply because it arrives over an encrypted transport. The receiver must re-derive the declared CID from the payload, verify the Ed25519 signature over the exact bytes, enforce a maximum 120-second freshness window and 30-second future-skew boundary where the exchange is live, preserve the counter as opaque until verification, and quarantine the result pending separate human review.[1] [2]

```json
{
  "schema": "root.project-reclaim.cmap-sync-event.v0.1",
  "eventType": "public_record_offer",
  "eventState": "quarantine_pending_human_review",
  "senderNodeId": "<enrolled CMAP node ID>",
  "recordEnvelope": "<CMAP envelope bytes or stable public reference>",
  "declaredCid": "<actual CID only>",
  "receivedAt": "<UTC ISO-8601 timestamp>",
  "verification": "unverified | verified | rejected",
  "publicationDecision": "pending"
}
```

This event permits exchange of an approved public artifact only. It excludes ROOT accounts, action plans, applications, provider records, exact locations, material-custody details, emergency context, and any private operational data.

## References

[1]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/Architecture.md "NEXINUS cMAP Architecture"
[2]: https://github.com/tychomorr-ui/cosmic-net/blob/main/docs/SecurityModel.md "NEXINUS cMAP Security Model"
