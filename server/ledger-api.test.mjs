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
    const firstHandle = `member-${Date.now()}`;
    let firstCookie = await register(firstHandle);
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

    const profile = await privateRequest(firstCookie, "/api/identity/profile", "PUT", { displayName: "Private member", selfDescription: "I choose the meaning and visibility of my ROOT account.", identityPosture: "pseudonymous" });
    expect(profile.status).toBe(200);
    expect((await profile.json()).profile.verification).toBe("self_asserted_not_third_party_verified");

    const secondSession = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ handle: firstHandle, password: "test-password-12345" }) });
    const secondSessionCookie = secondSession.headers.get("set-cookie").split(";")[0];
    expect(secondSession.status).toBe(200);
    expect((await privateRequest(firstCookie, "/api/auth/sessions")).status).toBe(200);
    const sessionRevoke = await privateRequest(firstCookie, "/api/auth/sessions/revoke-other", "POST");
    expect(sessionRevoke.status).toBe(200);
    expect((await privateRequest(secondSessionCookie, "/api/ledger")).status).toBe(401);

    const recovery = await privateRequest(firstCookie, "/api/auth/recovery-kit", "POST");
    expect(recovery.status).toBe(201);
    const recoveryPayload = await recovery.json();
    expect(recoveryPayload.recoveryCode).toHaveLength(32);

    const grant = await privateRequest(firstCookie, "/api/ledger/grants", "POST", { recipientLabel: "A future verifier", purpose: "A member-controlled future presentation decision with no present transfer.", dataScopes: ["private_claim_drafts"] });
    expect(grant.status).toBe(201);
    const grantPayload = await grant.json();
    const grantRecord = grantPayload.items.find(item => item.kind === "consent_grant");
    expect(grantRecord.state).toBe("recorded_not_executed");
    const grantRevoke = await privateRequest(firstCookie, `/api/ledger/${grantRecord.id}/revoke`, "POST");
    expect(grantRevoke.status).toBe(200);
    expect((await grantRevoke.json()).items.find(item => item.id === grantRecord.id).state).toBe("revoked");

    const consent = await privateRequest(firstCookie, "/api/ledger/consents", "POST", { scope: "root_private_storage" });
    expect(consent.status).toBe(201);
    const consentPayload = await consent.json();
    const consentRecord = consentPayload.items.find(item => item.kind === "consent");
    const revoke = await privateRequest(firstCookie, `/api/ledger/${consentRecord.id}/revoke`, "POST");
    expect(revoke.status).toBe(200);
    expect((await revoke.json()).items.find(item => item.id === consentRecord.id).state).toBe("revoked");

    const exported = await privateRequest(firstCookie, "/api/ledger/export");
    expect(exported.status).toBe(200);
    const exportPayload = await exported.json();
    expect(exportPayload.format).toBe("root-private-record-export-v2");
    expect(exportPayload.profile.identityPosture).toBe("pseudonymous");
    expect(exportPayload.interoperability.verifiableCredential).toBe("not_issued");

    const recovered = await fetch(`${base}/api/auth/recover`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ handle: firstHandle, recoveryCode: recoveryPayload.recoveryCode, password: "recovered-password-12345" }) });
    expect(recovered.status).toBe(200);
    firstCookie = recovered.headers.get("set-cookie").split(";")[0];
    expect((await privateRequest(firstCookie, "/api/ledger")).status).toBe(200);

    const deleted = await fetch(`${base}/api/auth/account`, { method: "DELETE", headers: { cookie: firstCookie, origin, "content-type": "application/json" }, body: JSON.stringify({ password: "recovered-password-12345" }) });
    expect(deleted.status).toBe(200);
    expect((await privateRequest(firstCookie, "/api/ledger")).status).toBe(401);
  });
});
