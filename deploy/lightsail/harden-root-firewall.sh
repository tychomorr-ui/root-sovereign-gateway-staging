#!/usr/bin/env bash
# ROOT-Gate host firewall reset: preserve administration and HTTPS only.
# Run from the Lightsail browser SSH console: sudo bash harden-root-firewall.sh
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this firewall hardening script as root." >&2
  exit 1
fi

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "ROOT-Gate host firewall hardened. Allowed inbound ports: 22, 80, 443."
ufw status verbose
