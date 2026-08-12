# ROOT-Gate Deployment Access

## Access roles

The AWS Lightsail default key may be used only as **temporary bootstrap access** for the new Oregon instance. ROOT routine administration should use a separate `root-gate-deploy` Ed25519 key that is authorized for a limited deployment account or controlled sudo path.

The RSA private key pasted earlier in chat is compromised. Do not add it to `authorized_keys`, do not use it for Lightsail, and remove its public-key counterpart from every host where it might have been authorized.

## Installing the dedicated public key

With the Lightsail default key, sign in as the initial Ubuntu administrator. Create the deployment account, install the dedicated public key, and limit key permissions:

```bash
sudo adduser --disabled-password --gecos '' rootdeploy
sudo install -d -m 0700 -o rootdeploy -g rootdeploy /home/rootdeploy/.ssh
sudo tee /home/rootdeploy/.ssh/authorized_keys >/dev/null <<'EOF'
PASTE_THE_ROOT_GATE_DEPLOY_PUBLIC_KEY_HERE
EOF
sudo chown rootdeploy:rootdeploy /home/rootdeploy/.ssh/authorized_keys
sudo chmod 0600 /home/rootdeploy/.ssh/authorized_keys
```

The bootstrap script installs a root-owned `/usr/local/sbin/root-gateway-install-release` activator and a narrowly scoped sudo rule. The `rootdeploy` account may invoke only that activator; it cannot run general sudo commands. The activator validates the release identifier, copies the uploaded package into a root-owned release area, runs tests and builds as `rootapp`, activates only a healthy release, and restores the prior release if the new service fails.

## Key handling

Keep the generated private key only in a private password manager, encrypted local key store, or hardware-backed SSH agent. Set its local permissions to `0600`. Never commit it, paste it into a chat, place it in a deployment archive, or copy it to the Lightsail server.

The deployment script requires the local environment variable `ROOT_DEPLOY_KEY` to point to the private key. It sends only the audited release over SSH.
