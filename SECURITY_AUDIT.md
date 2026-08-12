# ROOT Self-Owned Authentication Security Audit

## Scope and Method

This audit reviewed the self-owned account service, account-store boundaries, session behavior, browser resource exposure, static-file separation, and direct dependency posture. It combines source inspection, unit tests, endpoint checks, response-header checks, repository-boundary checks, and the package manager’s production dependency audit.

## Verified Controls

| Area | Verified control |
|---|---|
| Credentials | A member uses a ROOT handle and password rather than a social login, email broker, or third-party identity provider. Passwords use salted `scrypt` records. |
| Session handling | The browser receives an opaque session token in an HTTP-only, same-site cookie. The account store retains only its SHA-256 fingerprint. |
| Account deletion | The member must re-enter the password; successful deletion removes the account and all server sessions. |
| CSRF boundary | State-changing account routes reject cross-origin requests with HTTP 403. |
| Brute-force boundary | Registration and login are limited in-process to 12 attempts per IP and route per 15 minutes. The counter is temporary and not written into the account store. |
| Private store | Production startup requires `ROOT_AUTH_DATA_KEY`; the account store uses AES-256-GCM and is written with owner-only filesystem permissions. |
| Public files | The account-store directory is outside the served build directory, is ignored by source control, and was not found in tracked files. |
| Browser isolation | The service sets CSP, frame denial, MIME sniffing protection, no-referrer policy, restrictive browser permissions, and cross-origin isolation headers. |
| Tracking exposure | Browser resource inspection found only the ROOT staging origin; no third-party identity, analytics, or advertising host loaded. |
| Dependencies | `pnpm audit --prod` reported no known production dependency vulnerabilities at audit time. |

## Finding and Remediation Record

| Finding | Severity | Remediation |
|---|---:|---|
| Account data had filesystem permissions but no application-layer encryption when a deployment volume was copied. | High | Added AES-256-GCM encrypted storage, with a production startup requirement for an installation-controlled data key. |
| The service lacked explicit browser security headers. | Medium | Added a restrictive CSP, frame denial, no-referrer policy, MIME sniffing protection, permissions policy, cross-origin policies, and production HSTS. |
| Login and registration had no abuse bound. | Medium | Added temporary same-service rate limiting that does not persist a behavioral profile. |
| Duplicate-handle response could reveal that a handle existed. | Low | Replaced it with a generic creation-failure response. |

## Remaining Deployment Conditions

The accessible staging URL is a temporary review deployment. A durable production release requires a ROOT-controlled Node runtime, HTTPS, a persistent private volume, a securely configured `ROOT_AUTH_DATA_KEY`, backup and recovery procedures chosen by ROOT, and monitoring limited to operational health rather than member behavior. GitHub Pages cannot host this Node account service.
