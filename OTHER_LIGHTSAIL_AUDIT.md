# Other Lightsail Instances — Read-Only Audit

**Started:** 2026-08-12 UTC  
**Scope:** Tesseract-Terminus, Tesseract-A, and Kether-Gate only. No configuration, network rule, service, credential, or instance-state changes are authorized or performed in this audit.

## Initial Inventory Evidence

The authenticated Lightsail console lists all three target instances as running general-purpose Ubuntu instances with dual-stack networking.

| Instance | Region / zone | Capacity | Public IPv4 | Public IPv6 | Console state |
|---|---|---:|---|---|---|
| Tesseract-Terminus | Oregon `us-west-2a` | 8 GB RAM, 2 vCPUs, 160 GB SSD | `34.216.185.65` | `2600:1f14:159c:7600:f0a5:5158:452a:5860` | Running |
| Tesseract-A | Frankfurt `eu-central-1a` | 8 GB RAM, 2 vCPUs, 160 GB SSD | `35.156.127.49` | `2a05:d014:a47:d800:e206:ee7b:aca6:2932` | Running |
| Kether-Gate | Singapore `ap-southeast-1a` | 8 GB RAM, 2 vCPUs, 160 GB SSD | `18.138.160.99` | `2406:da18:5e4:a500:81a9:1562:c58f:fb29` | Running |

## Access Evidence

The dedicated `rootdeploy` key used solely for ROOT-Gate was the only approved local deployment identity available. A non-interactive SSH attempt as `rootdeploy` to each target host timed out during SSH banner exchange on TCP port 22. This establishes neither a successful login nor an operating-system configuration finding; it indicates that this key and access route cannot currently support a host-level audit.

## Tesseract-Terminus Connect Configuration

The Lightsail console confirms Tesseract-Terminus uses the Oregon regional **default SSH key** and expects the `ubuntu` username. The instance has private IPv4 address `172.26.1.237`, a static public IPv4 address, dual-stack networking, and a running state. No private key was downloaded and no browser SSH session was opened during this evidence collection.

## Tesseract-Terminus Networking Evidence

The console records the static IPv4 attachment name as `monad_prime`. Its Lightsail firewall permits public HTTP on TCP port `80` from any IPv4 or IPv6 address. SSH on TCP port `22` is restricted to `172.16.0.173/32`, `172.16.0.191/32`, and Lightsail browser SSH. No public HTTPS rule was displayed. The instance is not attached to a load balancer and is not an origin for a Lightsail distribution.

## Tesseract-A Console Retrieval Limitation

The authenticated Frankfurt Lightsail console accepted the regional URL but returned an in-console **“Unable to load content”** message. At this stage, no Frankfurt networking-rule or host-configuration conclusion can be drawn from the console. This limitation is distinct from the separate failed direct SSH attempt.

## Tesseract-A Networking Evidence

After a subsequent read-only load completed, the console confirmed that Tesseract-A is a running Ubuntu general-purpose instance in Frankfurt `eu-central-1a`, with dual-stack networking and private IPv4 address `172.26.5.52`. Its static IPv4 attachment is named `StaticIp-1`. The Lightsail firewall permits public HTTP on TCP port `80` from any IPv4 or IPv6 address. SSH on TCP port `22` is restricted to `172.16.0.173/32`, `172.16.0.191/32`, and Lightsail browser SSH. No public HTTPS rule was displayed. The instance has neither a load-balancer attachment nor a Lightsail distribution-origin assignment.

The Tesseract-A connect view again showed the transient in-console **“Unable to load content”** message. Its declared username and regional default-key source therefore remain unverified from the console at this point. No credential was downloaded and no browser SSH session was opened.

## Kether-Gate Networking Evidence

The console confirms Kether-Gate is a running Ubuntu general-purpose instance in Singapore `ap-southeast-1a`, with dual-stack networking and private IPv4 address `172.26.8.228`. Its static IPv4 attachment is named `monad_prime`. The Lightsail firewall permits public HTTP on TCP port `80` from any IPv4 or IPv6 address. SSH on TCP port `22` is restricted to `172.16.0.173/32`, `172.16.0.191/32`, and Lightsail browser SSH. No public HTTPS rule was displayed. Kether-Gate is not attached to a load balancer and is not used as an origin for a Lightsail distribution.

## Kether-Gate Metrics Evidence

The Lightsail CPU overview page loaded and displayed a one-hour CPU-utilization and remaining-burst-capacity graph framework. The accessible console text did not expose individual datapoints, so this audit does not assert current utilization, burst balance, memory use, disk use, swap status, or active process health. The console explicitly directs those operating-system-level checks to commands executed inside the instance; no SSH session was opened.

## External Service Reachability Evidence

Read-only IPv4 probes were limited to the public web ports declared in the Lightsail consoles. Tesseract-Terminus returned `HTTP/1.1 308 Permanent Redirect` on port `80`, with a redirect target of `https://34.216.185.65/`; its direct IPv4 TLS handshake on port `443` timed out. Tesseract-A and Kether-Gate each accepted the port-80 connection but returned an empty HTTP response, while direct IPv4 TLS handshakes on port `443` timed out. These probes establish externally observable behavior only. They do not identify the installed web-server software, virtual-host routing, certificate configuration, or operating-system firewall state.

## Snapshot Review Limitation

The direct Tesseract-Terminus snapshots URL initially returned a transient Lightsail loading error and then resolved back to the Connect view rather than exposing backup data. Snapshot schedules and recovery-point inventory are therefore unverified for all three instances. No snapshot was created, restored, edited, or deleted.

## Assessment and Corrective Priorities

The three instances are provisioned consistently as dual-stack 8 GB / 2 vCPU / 160 GB Ubuntu hosts, each currently running, each with a static IPv4 address, and each exposing public TCP port `80`. Their Lightsail SSH policy is deliberately narrower than public internet access: it permits two stated private IPv4 addresses plus browser SSH. That policy explains why the external direct SSH attempts did not reach an authentication prompt.

| Priority | Evidence-based concern | Recommended next action, not performed |
|---|---|---|
| High | All three console firewall views displayed no public HTTPS (`443`) allowance, and direct IPv4 TLS probes timed out. Tesseract-Terminus additionally redirects HTTP to HTTPS, which was unreachable by direct probe. | Decide whether each host is intended to serve a public web endpoint. If yes, inspect its web server, certificates, DNS names, and host firewall through an authorized administrator session before selectively enabling or repairing HTTPS. If no, remove the unnecessary public HTTP rule through a separately approved change. |
| High | Tesseract-A and Kether-Gate accepted TCP port `80` but returned no HTTP response. | Identify the service bound to port `80` and the intended virtual-host configuration through an authorized read-only shell session. Do not infer that the instance is healthy or unhealthy solely from this probe. |
| Medium | No host-level evidence is available for package patching, active services, listener scope, UFW or nftables, disks, processes, logs, systemd failures, user accounts, or application data. | Use the instance’s approved `ubuntu` account and regional default SSH key, or a separate deliberately installed audit-only key, to run a fixed read-only evidence collection. |
| Medium | Snapshot schedules and recovery-point inventories are unverified. | Review the Lightsail snapshots area or use an authorized command/API read only; adopt a documented recovery policy before assigning critical workloads. |
| Low | No load balancer or Lightsail distribution is attached to the three hosts. | Treat each static IP as a direct origin unless and until a separately designed front-door architecture is approved. |

This assessment identifies configuration evidence and verification gaps. It does not claim a compromise, a software defect, a host firewall state, or a content inventory for any of the three systems.
