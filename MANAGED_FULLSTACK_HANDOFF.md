# ROOT Clean Release Candidate — Managed Full-Stack Handoff

## Release Position

The clean ROOT release candidate has passed local TypeScript, privacy-policy, production-build, and visual checks. It is ready to be imported into a **new managed full-stack project**. It is not a replacement for the live ROOT domain until that managed project supplies server-side identity, durable data, and authorization.

> The current live ROOT domain remains the protected reference deployment. Do not point it at this release candidate until staging has passed the checks in this handoff.

## Required Managed Project Capabilities

| Capability | Required implementation |
|---|---|
| Project type | Managed full-stack application with database, server procedures, and user authentication. |
| Identity | Manus OAuth; member data must remain private by default. |
| Storage | Managed MySQL through Drizzle; no pathway, issue, receipt, or operator data may remain only in client memory. |
| Authorization | Protected server procedures must enforce ownership, First Executive authority, Directory Steward county scope, and public-source filtering. |
| Secrets | Use managed project secrets only; do not commit credentials or add third-party tracking keys. |
| Hosting | New staging URL first; retain the existing ROOT domain during validation. |

## Required Data Model

The new database should add, at minimum, the following records. All timestamps are UTC.

| Record | Privacy and authority boundary |
|---|---|
| Member profile and consent grants | Member owns and may view/revoke own record. |
| Permission receipts | Member-readable record of recipient, purpose, scope, expiration, and revocation. |
| Project Reclaim sources | Public may see reviewed Mendocino published fields only. Lake County remains private watchlist-only. |
| Private pathway items and notes | Owner-only; no provider, steward, operator, or other member access by default. |
| Private source issues | Reporting member and authorized reviewer only; no provider notification; no public member note. |
| Source lifecycle and change audits | Authorized reviewer writes append-only decision evidence; public sees only safe review metadata. |
| Operators and operator audits | First Executive manages roles; Directory Steward is limited to reviewed Mendocino source work. |
| Truth Talk posts and corrections | Public content with declared source/correction path; private member pathway data never enters the public feed. |

## Server-Side Rules

The managed implementation must enforce these rules before any client action is accepted.

1. A member may list, change, and delete only their own pathway items and private notes.
2. The public Project Reclaim list returns only `published` Mendocino source records.
3. A source issue may be created only for a published source; it never notifies the source provider.
4. A Directory Steward may review Mendocino source issues but may not manage the operator roster, Monarch nodes, attestations, or Lake County publication.
5. A Lake County source is never publicly published under the current authority.
6. A consent grant specifies a recipient, fields, purpose, expiry, and revocation path. No grant exists by default.
7. Emergency location access must be freshly consented for one immediate request and must not form a location history.
8. No behavioral analytics SDK, advertising identifier, or third-party tracking script may be introduced.

## Staging Acceptance Check

Before replacing the current domain, verify all of the following on a new staging URL:

| Area | Staging check |
|---|---|
| OAuth | A member signs in and cannot access another member’s record. |
| Pathways | A member can save, edit, and delete only their own pathway items. |
| Project Reclaim | Exactly the approved Mendocino published sources are public; Lake records do not appear. |
| Source issues | A member report is private; a scoped Directory Steward can review it; it does not appear on the public card. |
| Consent | The receipt accurately displays an empty external-access state until a member grants one. |
| Truth Talk | Public claims show declared source/correction boundaries without exposing private member data. |
| Emergency | One-time location consent is explicit and non-persistent. |
| Handoffs | Ecosystem destinations are link-only and attach no ROOT member/session data. |
| No telemetry | Browser and network checks show no third-party behavioral or advertising tracking calls. |

## Cutover Gate

Only after every staging check passes should the owner explicitly authorize moving the current ROOT domain to the staged release. The existing live ROOT deployment should remain available until the new version is confirmed healthy after cutover.
