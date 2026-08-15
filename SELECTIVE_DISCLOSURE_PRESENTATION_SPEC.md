# ROOT Selective-Disclosure Presentation Specification — v0.1

**Status:** Draft-only design. ROOT records private drafts but does not issue a DID, Verifiable Credential, cryptographic presentation, status-list entry, or cross-application payload under this version.

## Purpose

This specification defines the future presentation boundary for a member who chooses to prove a narrowly selected ROOT fact to one named HTTPS recipient. It is designed to avoid shared accounts, profile replication, opaque redirects, reusable tracking identifiers, and broad exports.

## Draft Record

The current ROOT record is `selective_disclosure_draft` with state `recorded_not_executed`. It contains the exact recipient origin, recipient label, one human-readable purpose, one to three requested claims, a verifier-supplied URL-safe challenge, an expiry no more than ten minutes ahead, an integrity receipt, and a revocation path. ROOT creates no outbound request and supplies no claim value to the recipient.

| Field | Rule |
|---|---|
| Recipient origin | Exact `https://` origin; brand labels alone are insufficient. |
| Recipient label | Member-readable human label. |
| Purpose | One stated reason; no multi-purpose or blanket grant. |
| Requested claims | `identity_posture`, `account_control_receipt`, `attestation_integrity_receipt`, or `vouch_summary`; maximum three. |
| Challenge | Recipient-generated, URL-safe nonce bound to one request. |
| Expiry | Future timestamp within ten minutes. |
| State | `draft_not_executed` until a reviewed implementation signs and delivers nothing automatically. |
| Revocation | A ROOT member can revoke the draft; no future presentation may use it. |

## Future Execution Sequence

1. A reviewed recipient manifest declares its exact HTTPS origin, signing key, supported claims, privacy notice, processing region, retention limit, and revocation endpoint.
2. The recipient creates an unpredictable, single-use challenge and requests only listed claims.
3. ROOT shows the member the origin, key fingerprint, purpose, claims, region, expiry, and one-time nature of the action.
4. The member explicitly approves one presentation. ROOT creates an append-only approval receipt.
5. A future ROOT holder key signs only the selected claim payload, recipient origin, challenge, issued time, expiry, and presentation identifier. The signed payload must not contain a ROOT session token, member password, recovery code, raw ledger record, private pathway, emergency context, IP address, device identifier, or behavioral data.
6. The recipient validates signature, audience/origin, nonce, expiry, status/revocation, and one-time-use state before accepting the presentation.
7. ROOT records delivery status without storing recipient telemetry. The recipient must not reuse the presentation, correlate it across purposes, or retain it beyond the disclosed policy.

## Claim-Minimization Rules

`identity_posture` returns only the member-selected posture. `account_control_receipt` returns a bounded statement that the account-control receipt exists; it never asserts legal or real-world identity. `attestation_integrity_receipt` returns a member-selected integrity digest without the underlying attestation text. `vouch_summary` must not disclose individual vouch statements or counterparties; a future version would require the recipient member's separate consent and a defined aggregate disclosure rule.

## Explicit Non-Claims

Cryptographic verification can establish the origin and integrity of a future presentation but cannot establish whether a statement is true. This draft must not be represented as a W3C Verifiable Credential or OpenID for Verifiable Presentations implementation until a compatible issuer, holder key, verifier, proof format, status mechanism, security review, and interoperability tests are actually present.

## Security and Privacy Gates

Execution is blocked until every recipient has a controlled domain, HTTPS, a signed manifest, documented signing-key rotation, public incident/revocation process, storage and retention data map, no unapproved analytics, allowlisted redirect URI, nonce replay protection, CSP/XSS review, and member-visible regional transfer terms. No vouch, private record, emergency data, or Project Reclaim member interest may be sent solely because a member created a draft.

## References

[1]: https://www.w3.org/TR/vc-data-model-2.0/ "W3C Verifiable Credentials Data Model v2.0"

[2]: https://openid.net/specs/openid-4-verifiable-presentations-1_0.html "OpenID for Verifiable Presentations 1.0"
