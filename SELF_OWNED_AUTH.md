# ROOT Self-Owned Authentication

ROOT’s account boundary is designed to operate without a social login, identity broker, advertising identifier, analytics SDK, or external authentication provider. A person creates a local ROOT handle and password directly with the ROOT server. The server stores a salted `scrypt` verification record rather than a plaintext password. It issues an opaque session token, stores only that token’s SHA-256 fingerprint, and sends the token in an HTTP-only, same-site cookie.

| Boundary | ROOT behavior |
|---|---|
| Identifier | A self-chosen ROOT handle; email and phone are not required by this service. |
| Password | Minimum 14 characters; salted `scrypt` verification record only. |
| Session | Opaque 256-bit token; fingerprint stored server-side; HTTP-only, `SameSite=Strict`, and `Secure` on HTTPS. |
| Data retention | The local account record and sessions are removed when the member chooses account deletion. |
| At-rest protection | Production requires an installation-controlled `ROOT_AUTH_DATA_KEY` that AES-256-GCM encrypts the local account store. |
| Tracking | No analytics SDK, advertising identifier, behavioral event collector, social login, or cross-origin identity call. |
| Hosting | The account service must run on ROOT-controlled infrastructure with a persistent volume for `ROOT_AUTH_DATA_PATH`. |

## Deployment Boundary

GitHub Pages can host the public static interface but cannot run the ROOT account service. The self-owned account service is served by `pnpm serve` after `pnpm build` and must be deployed to a ROOT-controlled Node environment with HTTPS and durable private storage. Set `NODE_ENV=production` and provide a 32-byte base64 `ROOT_AUTH_DATA_KEY` only through the deployment environment; the process refuses production startup without it. The `data/` directory is intentionally ignored by source control and must never be placed in a public repository or static artifact.

The release intentionally does not collect email recovery details. Before inviting real members, ROOT should define an offline, member-controlled recovery process and encrypt any persistent volume at rest under a key ROOT controls.
