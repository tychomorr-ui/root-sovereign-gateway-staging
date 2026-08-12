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

For the initial deployment, either permit a narrow, reviewed sudo policy for the deployment operations or use the default administrator key interactively for the bootstrap only. Do not grant unrestricted routine root access merely for convenience.

## Key handling

Keep the generated private key only in a private password manager, encrypted local key store, or hardware-backed SSH agent. Set its local permissions to `0600`. Never commit it, paste it into a chat, place it in a deployment archive, or copy it to the Lightsail server.

The deployment script requires the local environment variable `ROOT_DEPLOY_KEY` to point to the private key. It sends only the audited release over SSH.
