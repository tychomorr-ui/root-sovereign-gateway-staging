#!/usr/bin/env bash
# Controlled ROOT release script. Run from the audited ROOT repository checkout.
# Usage: ROOT_DEPLOY_KEY=/secure/path/root-gate-deploy_ed25519 ./deploy/lightsail/deploy-root.sh ubuntu 34.223.165.42 root.example.com
set -Eeuo pipefail

REMOTE_USER="${1:?Usage: deploy-root.sh <ssh-user> <server-ip-or-host> <root-domain>}"
REMOTE_HOST="${2:?Usage: deploy-root.sh <ssh-user> <server-ip-or-host> <root-domain>}"
DOMAIN="${3:?Usage: deploy-root.sh <ssh-user> <server-ip-or-host> <root-domain>}"
KEY_PATH="${ROOT_DEPLOY_KEY:?Set ROOT_DEPLOY_KEY to the dedicated ROOT deploy private-key path.}"
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
REMOTE="${REMOTE_USER}@${REMOTE_HOST}"
SSH=(ssh -i "${KEY_PATH}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC_SSH="ssh -i ${KEY_PATH} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

[[ -f "${KEY_PATH}" ]] || { echo "ROOT_DEPLOY_KEY does not point to a file." >&2; exit 1; }
[[ "$(stat -c '%a' "${KEY_PATH}")" =~ ^(400|600)$ ]] || { echo "Set private-key permissions to 0600 before deploying." >&2; exit 1; }
[[ -f package.json && -f pnpm-lock.yaml && -f server/index.mjs ]] || { echo "Run from the audited ROOT release root." >&2; exit 1; }

pnpm test
pnpm build

"${SSH[@]}" "${REMOTE}" "mkdir -p /home/rootdeploy/releases/${RELEASE_ID} && chmod 0700 /home/rootdeploy/releases/${RELEASE_ID}"
rsync -az --delete \
  --exclude '.git/' --exclude 'node_modules/' --exclude 'dist/' --exclude 'data/' --exclude '.env' --exclude '.env.*' \
  -e "${RSYNC_SSH}" ./ "${REMOTE}:/home/rootdeploy/releases/${RELEASE_ID}/"

"${SSH[@]}" "${REMOTE}" "sudo -n /usr/local/sbin/root-gateway-install-release '${RELEASE_ID}'"

sleep 2
curl --fail --silent --show-error --max-time 15 "https://${DOMAIN}/api/auth/me" >/dev/null

echo "Release ${RELEASE_ID} deployed. Verify https://${DOMAIN}/api/auth/me and browser headers before member invitation."
