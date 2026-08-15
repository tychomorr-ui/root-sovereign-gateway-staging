# ROOT selective-disclosure presentation specification

The canonical source is maintained with ROOT at `SELECTIVE_DISCLOSURE_PRESENTATION_SPEC.md`. This public copy describes a draft-only protocol: ROOT records no issued credential, signed presentation, or external data transfer under v0.1.

The current implementation permits only a member-owned private draft bound to one HTTPS recipient origin, stated purpose, selected claim names, challenge, short expiration, integrity receipt, and revocation. A future execution flow remains blocked until recipient manifests, signing keys, security review, consent UX, and one-time presentation controls are independently verified.
