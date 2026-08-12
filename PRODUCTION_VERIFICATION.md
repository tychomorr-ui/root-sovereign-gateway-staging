# ROOT Production Verification — `root.nexinus.net`

**Verified:** 2026-08-12 UTC  
**Primary host:** ROOT-Gate, AWS Lightsail, Oregon (`us-west-2a`)  
**Public hostname:** `https://root.nexinus.net`

## Release and Service Evidence

The audited ROOT self-owned-auth release was uploaded through the dedicated `rootdeploy` Ed25519 key and activated through the root-owned release installer. The installer rebuilt the exact locked release as `rootapp`, passed all eight automated tests, and started the production service successfully.

| Control | Verified result |
|---|---|
| Service state | `root-gateway` was active after activation. |
| TLS identity | A valid Let's Encrypt certificate was presented for `root.nexinus.net`. |
| HTTP transport | HTTP returned `308 Permanent Redirect` to HTTPS. |
| Data-store boundary | The deploy account could not read `/var/lib/root-gateway/root-auth.json`. |
| Key custody | The production encryption key remained in the root-owned `/etc/root-gateway/root.env` configuration, outside the source tree and public routes. |
| Release authority | `rootdeploy` can use only the root-owned release activator; it does not receive general sudo authority. |

## Self-Owned Authentication Acceptance

The public `GET /api/auth/me` endpoint returned an anonymous session response over HTTPS. A request with a foreign `Origin` header to the account-registration route returned **HTTP 403**. A disposable self-owned ROOT account was created with **HTTP 201** and then deleted with **HTTP 200**, removing that acceptance-test record and its session.

The live response contained the expected restrictive controls: Content Security Policy, HSTS, frame denial, MIME-type protection, no-referrer policy, restrictive permissions policy, and same-origin opener/resource policies.

## Resource-Origin Check

Browser resource inspection returned exactly one origin:

```
https://root.nexinus.net
```

No third-party identity, analytics, advertising, or behavioral-tracking resource origin was observed.

## Remaining Operational Requirement

The RSA private key that was pasted into chat remains compromised. It must not be authorized anywhere and should be removed from every server, repository, workstation, and deployment location where it might have been installed. The dedicated ROOT deploy key is now the authorized routine deployment credential.
