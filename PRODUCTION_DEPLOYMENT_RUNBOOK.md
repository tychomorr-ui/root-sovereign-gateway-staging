# ROOT Production Deployment Runbook

## Non-Negotiable Preconditions

ROOT’s audited account service must not be deployed to a static-only host. Before deployment, verify a ROOT-controlled Linux or Node server, a domain under ROOT’s control, public DNS, inbound HTTPS, a persistent private volume, a non-source-controlled `ROOT_AUTH_DATA_KEY`, and a member-approved backup and recovery procedure.

## AWS Lightsail Region Decision

For ROOT's **first durable production launch**, use **US West (Oregon) — `us-west-2`** as the primary Lightsail Region. ROOT's present regional program, reviewed public-source work, and first expected member community are Mendocino and Lake Counties in California. Keeping the primary encrypted account store close to that first operating region minimizes avoidable latency and avoids making a cross-border copy of member data the default.

Singapore — `ap-southeast-1` — is the preferred future Asia-Pacific ROOT region if ROOT later serves a substantial Asia-Pacific member base that knowingly accepts Singapore data residency. Tokyo — `ap-northeast-1` — is preferable only when Japan is the principal user and operations region. Hong Kong — `ap-east-1` — should not be the initial ROOT primary: it is an opt-in AWS Region and Lightsail support was added in June 2026, so it adds configuration without solving the current California-first requirement.

| Role | Recommended location | Data boundary |
|---|---|---|
| Primary ROOT account service | US West (Oregon) / `us-west-2` | Primary encrypted account store remains in the first member region. |
| First recovery copy | Oregon snapshot / separate Availability Zone recovery plan | Keep first recovery inside the primary Region where practical. |
| Cross-region recovery | Frankfurt or Singapore only after ROOT adopts a documented cross-border recovery policy | Replicate only encrypted records; retain the encryption key separately from the backup. |
| Future Asia-Pacific service | Singapore / `ap-southeast-1` | Use a separate regional instance and region-specific member-data policy; do not silently mirror U.S. accounts there. |

AWS notes that choosing a Region close to users reduces latency, Regions are isolated, and inter-Region traffic uses the public internet and should be encrypted. Lightsail also supports Oregon, Singapore, Tokyo, Frankfurt, and Hong Kong; Hong Kong is opt-in. [AWS Lightsail Regions](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-regions-and-availability-zones-in-amazon-lightsail.html) [AWS Region Reference](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)

| Required input | Reason |
|---|---|
| Server hostname or IP plus authenticated administrative access | Required to install and run the service on infrastructure ROOT controls. |
| Domain name and DNS control | Required to issue and renew a valid HTTPS certificate. |
| Node.js 22+ and process manager | Required to run the ROOT account service reliably. |
| Persistent private storage path | Required for encrypted account data outside public static files. |
| `ROOT_AUTH_DATA_KEY` supplied only through server secret configuration | Required to encrypt the account store and start production mode. |
| Backup/recovery decision | Required before real member accounts are accepted. |

## Deployment Sequence

1. Provision an unprivileged `rootapp` service account and a private application directory.
2. Install the audited release, run `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build`.
3. Place the production key in server secret storage or a root-owned environment file with mode `0600`. Do not place it in the repository, web root, build artifact, or shared chat.
4. Set `NODE_ENV=production`, `ROOT_AUTH_DATA_PATH` to the private persistent volume, and `ROOT_AUTH_DATA_KEY` through the server environment.
5. Bind ROOT only to localhost behind a TLS reverse proxy. Terminate HTTPS with a valid certificate for the ROOT domain, then proxy to the Node service.
6. Verify the health route, browser security headers, encrypted account-store format, member account lifecycle, cross-origin rejection, rate-limit behavior, and no third-party resource calls.
7. Create an encrypted backup procedure selected and controlled by ROOT. Test recovery before inviting real members.

## Post-Deployment Acceptance Check

The production launch is acceptable only when the domain presents a valid certificate, HTTP redirects to HTTPS, `ROOT_AUTH_DATA_KEY` is not readable through source or web routes, the account store is encrypted at rest, browser controls remain present, no tracking resource loads, and the backup/recovery procedure has an owner and successful test record.
