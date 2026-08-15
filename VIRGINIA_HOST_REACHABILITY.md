# Virginia ROOT Host Reachability Note

**Observed:** 2026-08-15 PDT

The Lightsail console shows `ROOT_SOVEREIGN-IDENTITY` in Virginia (`us-east-1a`) as **Running** with public IPv4 `34.198.19.147`. DNS for `root.nexinus.net` now resolves to this IPv4 address.

The authenticated Lightsail console was also filtered directly to the instance, confirming the same **Running** state, static IPv4, and IPv6 address. This console state does not change the external finding: the root domain and direct IPv4 probes are still unable to establish SSH or TLS connections.

The instance configuration identifies Ubuntu in `us-east-1a` and the `ubuntu` account using the **Virginia region default SSH key**. The previously authorized `rootdeploy` key was configured only on the deleted Oregon host and cannot be assumed to exist on this replacement instance.

The user ran a read-only console check on the Virginia host. `ufw` reports `Status: inactive`, and `ss -ltnp` reports `sshd` listening on `0.0.0.0:22` and `[::]:22`. Therefore, the host itself is ready to accept SSH once the Lightsail public firewall permits it. The external port closure is isolated to the Lightsail networking layer. No ROOT service is installed or listening yet.

The authenticated Lightsail account contains the `nexinus.net` DNS zone. The ROOT host record can therefore be inspected from the same account before any correction is proposed. No DNS record was modified during this inspection.

The DNS-records view is active. Its initial rendered list shows an apex `A` record for `nexinus.net` pointing to `35.156.127.49`. The ROOT subdomain record is not yet visible in the current viewport; no record has been edited or deleted.

Public DNS resolution via Google’s resolver confirms that `root.nexinus.net` has a single resolved `A` answer of `34.198.19.147`. The authoritative name servers are `dns1.registrar-servers.com` and `dns2.registrar-servers.com`, not the Lightsail DNS zone. Therefore, the Lightsail zone is not the active control plane for the ROOT subdomain and no Lightsail DNS record needs to be changed.

With explicit user confirmation, a single controlled reboot was initiated for `ROOT_SOVEREIGN-IDENTITY`. Lightsail reported the instance as `Starting` during the reboot. No ROOT code, encrypted account store, or application configuration has been deployed to the replacement host.

After the reboot completed, Lightsail reported the instance `Running`. Direct TCP probes from the release environment remained closed on all three intended IPv4 ports (`22`, `80`, `443`) and on the assigned IPv6 address. The public DNS record remains correct. This is therefore a Lightsail public-ingress condition independent of the Ubuntu host listener and UFW state, while the Lightsail browser SSH channel remains available for controlled host-side work.

The Lightsail connection page continues to render the browser SSH control, but automated activation did not open a terminal session. No terminal command was issued through that path. The dedicated `rootdeploy` public key has been retained locally for a later, controlled authorization step once public ingress is functional.

An independent public port-checking service was opened and configured with the user-owned Virginia IPv4 address `34.198.19.147` to distinguish a sandbox-origin limitation from a provider-side ingress failure. No scan result has been submitted or recorded at this point.

The independent check reported **port 443 closed** for `34.198.19.147`. That is expected before Caddy and the ROOT reverse proxy are installed. A subsequent independent check reported **port 22 open**, consistent with the Ubuntu SSH listener and the displayed Lightsail rule. The earlier sandbox-origin SSH probes were therefore not a reliable indicator of the instance’s public SSH reachability. ROOT can proceed through the controlled SSH bootstrap path; HTTPS will be verified only after Caddy and the ROOT service are installed.

The browser SSH popup path did not surface a usable terminal, but the direct Lightsail terminal route embedded in the instance page successfully opened an authenticated `ubuntu` shell on the Virginia host. This provides the controlled administrative path required to establish the replacement ROOT deployment identity and bootstrap the service without exposing the old Oregon private key or account store.

The direct browser terminal rendered a live `ubuntu` prompt, but automated terminal text injection did not visibly execute even a harmless echo command. The terminal remains suitable for the user’s manual recovery path, while automated provisioning will continue through standard SSH once the existing dedicated deployment key is installed on the replacement host.

External diagnostics from the ROOT release environment show TCP ports `22`, `80`, and `443` closed at the Virginia address. A direct IPv4 TLS probe to `root.nexinus.net` fails before an HTTP response. This indicates that the production host cannot yet accept the secure bootstrap or serve ROOT. No deployment, account-store initialization, firewall modification, or application activation was attempted on the Virginia host while it is unreachable.

The next gate is to make the host’s Lightsail and operating-system network path reachable for the intended public ports only: `22`, `80`, and `443`. ROOT’s application listener will remain private to loopback after bootstrap.
