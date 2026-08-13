# ROOT Sovereign Identity Infrastructure Gap Analysis

**Status:** Design baseline for the next ROOT compound release.  
**Scope:** Self-owned member control, privacy, portability, recovery, consent, and honest interoperability posture.  
**Out of scope:** External identity brokering, automated third-party transfer, real-world identity verification, government identifiers, biometric processing, behavioral profiling, and any claim that ROOT already issues DIDs or W3C Verifiable Credentials.

## Identity is a control system, not a profile

ROOT already provides a strong private floor: a self-chosen handle and password, opaque HTTP-only sessions, encrypted account storage, private action plans, private attestations, internal consent receipts, integrity digests, corrections, withdrawals, revocation, export, and member-directed deletion. The critical next step is to make the **member’s control surface** explicit rather than treating the account as a simple sign-in.

| Identity capability | Current ROOT state | Compound-upgrade target | Boundary |
|---|---|---|---|
| Account control | Live | Preserve | Handle/password control proves ROOT-account control only. |
| Private identity posture | Missing | Add optional member-selected profile and posture | No legal, government, biometric, or third-party verification claim. |
| Private attestations | Live | Preserve and connect to identity posture | A self-attestation remains a self-attestation. |
| Consent | Internal receipts only | Add structured private grants | A grant is not a transfer and has no external recipient by default. |
| Recovery | Missing | Add one-time recovery kit | No email, social login, or external custodian. |
| Sessions | Opaque session exists | Add member-visible session management | No IP or behavioral telemetry display. |
| Portability | Ledger export exists | Add fuller sovereign-record export | Export is private data, not a public credential. |
| Interoperability | Reference-only CMAP and private receipt layer | Add honest standards posture | No DID, VC, cryptographic signature, public status list, or verifier flow until actually implemented. |

## Standards posture

W3C describes DIDs as identifiers that can be controlled without a centralized identity provider and whose documents can express verification methods and services.[1] ROOT’s current self-owned account is aligned with the **control** goal, but it is not a DID and cannot truthfully be labeled one. W3C’s Verifiable Credentials model separates issuers, holders, and verifiers; its “verifiable” property concerns authenticity and currentness of the credential, not whether every encoded claim is true.[2] ROOT’s SHA-256 integrity receipt is therefore useful private provenance, but it is not an issuer-signed Verifiable Credential.

The standards also reinforce ROOT’s privacy posture. The W3C status-list specification explains why per-credential status URLs can create correlation risk and why group-oriented status publication can improve privacy when actual credentials are issued.[3] ROOT will not create a public status endpoint until it operates a real credential issuance and verification model with an explicit member and issuer governance decision.

> **ROOT’s honest statement:** “A ROOT receipt demonstrates integrity of ROOT-held private record facts. It does not demonstrate legal identity, third-party verification, universal truth, DID control, credential issuance, signature validity, external status, or entitlement.”

## Next compound-release design

The member profile will contain only voluntary private data: an optional display name, optional self-description, and a member-selected identity posture. A member may describe themselves as private, pseudonymous, disclosed-by-choice, or a delegated organization steward. The wording identifies how the member wants to operate inside ROOT; it does not establish who they are outside ROOT.

The recovery kit will be generated only while an authenticated member is present. ROOT will display it once, store only a hash, allow a member to rotate or revoke it, and use it to reset a ROOT password while invalidating existing sessions. A recovery kit is a possession secret; it is not an email reset, trusted contact, identity check, or custodial account-recovery service.

Structured consent grants will remain private ROOT records. Each will name a proposed recipient label, purpose, selected data scopes, optional expiration, and state. The initial release will intentionally set all grants to **recorded but not externally executed**. That distinction prevents a consent screen from becoming an untruthful claim that data has moved or that another service has accepted the grant.

The extended export will contain the member’s voluntary profile, private receipts, grants, and action-plan view. It will include an `interoperability` object that explicitly says `did: not_issued`, `verifiable_credential: not_issued`, `signature: not_issued`, and `external_presentation: not_issued`. This supports portability now and prevents future systems from mistaking a ROOT private export for a credential.

## References

[1] [W3C, *Decentralized Identifiers (DIDs) v1.1*](https://www.w3.org/TR/did-1.1/)

[2] [W3C, *Verifiable Credentials Data Model v2.0*](https://www.w3.org/TR/vc-data-model-2.0/)

[3] [W3C, *Bitstring Status List v1.0*](https://www.w3.org/TR/vc-bitstring-status-list/)
