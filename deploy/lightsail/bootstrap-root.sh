#!/usr/bin/env bash
# ROOT production bootstrap for an Ubuntu 24.04 Lightsail instance.
# Run as root: sudo bash bootstrap-root.sh root.example.com
set -Eeuo pipefail

DOMAIN="${1:?Usage: sudo bash bootstrap-root.sh <root-domain>}"
APP_USER="rootapp"
APP_HOME="/opt/root-gateway"
DATA_DIR="/var/lib/root-gateway"
CONFIG_DIR="/etc/root-gateway"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this bootstrap as root." >&2
  exit 1
fi

if [[ ! "${DOMAIN}" =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "Provide a public DNS name, not an IP address." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends caddy curl ca-certificates git rsync ufw

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(`.`)[0]' 2>/dev/null || echo 0)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y --no-install-recommends nodejs
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(`.`)[0]')"
[[ "${NODE_MAJOR}" -ge 20 ]] || { echo "Node.js 20+ installation failed." >&2; exit 1; }
command -v corepack >/dev/null 2>&1 || npm install -g corepack
corepack enable

id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --create-home --home-dir "/home/${APP_USER}" --shell /usr/sbin/nologin "${APP_USER}"
install -d -m 0750 -o "${APP_USER}" -g "${APP_USER}" "${APP_HOME}/releases" "${DATA_DIR}"
install -d -m 0700 -o root -g root "${CONFIG_DIR}"

if [[ ! -f "${CONFIG_DIR}/root.env" ]]; then
  umask 077
  ROOT_KEY="$(openssl rand -base64 32)"
  cat > "${CONFIG_DIR}/root.env" <<EOF
NODE_ENV=production
PORT=4174
ROOT_AUTH_DATA_PATH=${DATA_DIR}/root-auth.json
ROOT_AUTH_DATA_KEY=${ROOT_KEY}
EOF
  unset ROOT_KEY
  chmod 0600 "${CONFIG_DIR}/root.env"
  chown root:root "${CONFIG_DIR}/root.env"
fi

cat > /etc/systemd/system/root-gateway.service <<'EOF'
[Unit]
Description=ROOT self-owned authentication gateway
After=network.target

[Service]
Type=simple
User=rootapp
Group=rootapp
WorkingDirectory=/opt/root-gateway/current
EnvironmentFile=/etc/root-gateway/root.env
ExecStart=/usr/bin/node server/index.mjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/root-gateway /opt/root-gateway
UMask=0077

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
  encode zstd gzip
  reverse_proxy 127.0.0.1:4174
}
EOF

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl daemon-reload
systemctl enable caddy root-gateway
systemctl restart caddy

echo "ROOT bootstrap complete. Before the first release:"
echo "  1. Point an A record for ${DOMAIN} to this instance's static IPv4."
echo "  2. Run deploy-root.sh from the audited release directory."
echo "  3. Verify HTTPS and the ROOT acceptance checks before inviting members."
