import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const port = 43000 + Math.floor(Math.random() * 1000);
const base = `http://127.0.0.1:${port}`;
const origin = base;
let dataDirectory;
let service;

async function waitForService() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/api/auth/me`);
      if (response.ok) return;
    } catch { /* Start-up race. */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error("ROOT test service did not start.");
}

async function register(handle) {
  const response = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ handle, password: "test-password-12345" }),
  });
  expect(response.status).toBe(201);
  return response.headers.get("set-cookie").split(";")[0];
}

async function privateRequest(cookie, path, method = "GET", body) {
  return fetch(`${base}${path}`, {
    method,
    headers: { cookie, origin, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeAll(async () => {
  dataDirectory = await mkdtemp(join(tmpdir(), "root-ledger-test-"));
  service = spawn("node", ["server/index.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      ROOT_BIND_HOST: "127.0.0.1",
      ROOT_AUTH_DATA_PATH: join(dataDirectory, "root-auth.json"),
      ROOT_AUTH_DATA_KEY: randomBytes(32).toString("base64"),
    },
    stdio: "ignore",
  });
  await waitForService();
});

afterAll(async () => {
  service?.kill("SIGTERM");
  await rm(dataDirectory, { recursive: true, force: true });
});

describe("ROOT private ledger API", () => {
  it("keeps records member-owned through correction, revocation, export, and deletion", async () => {
    const firstCookie = await register(`member-${Date.now()}`);
    const secondCookie = await register(`other-${Date.now()}`);

    const initial = await privateRequest(firstCookie, "/api/ledger");
    const initialPayload = await initial.json();
    expect(initialPayload.items).toHaveLength(1);
    expect(initialPayload.items[0].kind).toBe("account_control");

    const attestation = await privateRequest(firstCookie, "/api/ledger/attestations", "POST", { label: "Account control", statement: "I control this ROOT account and choose how my private record is used." });
    expect(attestation.status).toBe(201);
    const attestationPayload = await attestation.json();
    const attestationRecord = attestationPayload.items.find(item => item.kind === "attestation");
    expect(attestationRecord.integrityDigest).toMatch(/^[a-f0-9]{64}$/);

    const ownershipAttempt = await privateRequest(secondCookie, `/api/ledger/${attestationRecord.id}/withdraw`, "POST");
    expect(ownershipAttempt.status).toBe(404);

    const correction = await privateRequest(firstCookie, `/api/ledger/${attestationRecord.id}/correct`, "POST", { statement: "I correct this private attestation with a more precise account-control statement." });
    expect(correction.status).toBe(201);
    const correctionPayload = await correction.json();
    expect(correctionPayload.items.find(item => item.id === attestationRecord.id).state).toBe("corrected");
    expect(correctionPayload.items.some(item => item.kind === "correction" && item.relation?.correctsId === attestationRecord.id)).toBe(true);

    const consent = await privateRequest(firstCookie, "/api/ledger/consents", "POST", { scope: "root_private_storage" });
    expect(consent.status).toBe(201);
    const consentPayload = await consent.json();
    const consentRecord = consentPayload.items.find(item => item.kind === "consent");
    const revoke = await privateRequest(firstCookie, `/api/ledger/${consentRecord.id}/revoke`, "POST");
    expect(revoke.status).toBe(200);
    expect((await revoke.json()).items.find(item => item.id === consentRecord.id).state).toBe("revoked");

    const exported = await privateRequest(firstCookie, "/api/ledger/export");
    expect(exported.status).toBe(200);
    expect((await exported.json()).format).toBe("root-private-record-export-v1");

    const deleted = await fetch(`${base}/api/auth/account`, { method: "DELETE", headers: { cookie: firstCookie, origin, "content-type": "application/json" }, body: JSON.stringify({ password: "test-password-12345" }) });
    expect(deleted.status).toBe(200);
    expect((await privateRequest(firstCookie, "/api/ledger")).status).toBe(401);
  });
});
