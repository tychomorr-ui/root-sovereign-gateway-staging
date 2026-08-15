import { randomBytes } from "node:crypto";

const base = process.env.ROOT_LIVE_BASE ?? "https://root.nexinus.net";
const origin = base;
const stamp = `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
const password = "live-verification-password-73921";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { method = "GET", cookie, body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      origin,
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { /* Status is asserted separately. */ }
  return { response, payload };
}

async function register(handle) {
  const { response, payload } = await request("/api/auth/register", {
    method: "POST",
    body: { handle, password },
  });
  assert(response.status === 201, `registration failed for ${handle}: ${response.status} ${JSON.stringify(payload)}`);
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, `missing session cookie for ${handle}`);
  return { handle, cookie };
}

async function login(handle) {
  const { response } = await request("/api/auth/login", {
    method: "POST",
    body: { handle, password },
  });
  assert(response.status === 200, `login failed for disposable cleanup account ${handle}: ${response.status}`);
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, `missing cleanup session cookie for ${handle}`);
  return cookie;
}

async function deleteAccount(cookie) {
  const { response } = await request("/api/auth/account", {
    method: "DELETE",
    cookie,
    body: { password },
  });
  assert(response.status === 200, `disposable-account cleanup failed: ${response.status}`);
}

const created = [];
try {
  if (process.env.ROOT_ORPHAN_HANDLE) {
    await deleteAccount(await login(process.env.ROOT_ORPHAN_HANDLE));
  }

  const issuer = await register(`vi-${stamp}`);
  created.push(issuer);
  const recipient = await register(`vr-${stamp}`);
  created.push(recipient);
  const unrelated = await register(`vu-${stamp}`);
  created.push(unrelated);

  const { response: issuedResponse, payload: issuedPayload } = await request("/api/vouches", {
    method: "POST",
    cookie: issuer.cookie,
    body: {
      recipientHandle: recipient.handle,
      scope: "specific_interaction",
      strength: 4,
      statement: "Disposable production verification vouch based on a specific observed interaction.",
    },
  });
  assert(issuedResponse.status === 201, `vouch creation failed: ${issuedResponse.status}`);
  const vouch = issuedPayload.items.find(item => item.direction === "issued");
  assert(vouch && vouch.credential === "not_issued", "vouch was not recorded with the honest credential boundary");

  const { response: unrelatedResponse, payload: unrelatedPayload } = await request("/api/vouches", { cookie: unrelated.cookie });
  assert(unrelatedResponse.status === 200, "unrelated vouch-list query failed");
  assert(!unrelatedPayload.items.some(item => item.id === vouch.id), "an unrelated member could read a private vouch");

  const { response: recipientResponse, payload: recipientPayload } = await request("/api/vouches", { cookie: recipient.cookie });
  assert(recipientResponse.status === 200, "recipient vouch-list query failed");
  assert(recipientPayload.items.some(item => item.id === vouch.id && item.direction === "received"), "recipient could not read the private vouch");

  const { response: recipientWithdrawResponse } = await request(`/api/vouches/${vouch.id}/withdraw`, { method: "POST", cookie: recipient.cookie });
  assert(recipientWithdrawResponse.status === 404, "recipient was able to withdraw the issuer-owned vouch");

  const { response: draftResponse, payload: draftPayload } = await request("/api/ledger/presentation-drafts", {
    method: "POST",
    cookie: issuer.cookie,
    body: {
      recipientOrigin: "https://xinus.one",
      recipientLabel: "XINUS",
      purpose: "Disposable verification of a future member-approved presentation with no current transfer.",
      requestedClaims: ["identity_posture"],
      challenge: `live-vouch-${stamp}`,
      expiresAt: Date.now() + 60_000,
    },
  });
  assert(draftResponse.status === 201, `presentation-draft creation failed: ${draftResponse.status}`);
  const draft = draftPayload.items.find(item => item.kind === "selective_disclosure_draft");
  assert(draft?.state === "recorded_not_executed", "presentation draft did not preserve the no-transfer state");

  const { response: draftRevokeResponse } = await request(`/api/ledger/${draft.id}/revoke`, { method: "POST", cookie: issuer.cookie });
  assert(draftRevokeResponse.status === 200, `presentation-draft revocation failed: ${draftRevokeResponse.status}`);

  const { response: withdrawResponse, payload: withdrawnPayload } = await request(`/api/vouches/${vouch.id}/withdraw`, { method: "POST", cookie: issuer.cookie });
  assert(withdrawResponse.status === 200, `issuer vouch withdrawal failed: ${withdrawResponse.status}`);
  assert(withdrawnPayload.items.find(item => item.id === vouch.id)?.state === "withdrawn", "issuer withdrawal state was not recorded");

  const { response: exportResponse, payload: exportPayload } = await request("/api/ledger/export", { cookie: issuer.cookie });
  assert(exportResponse.status === 200, `v3 export failed: ${exportResponse.status}`);
  assert(exportPayload.format === "root-private-record-export-v3", "export did not use v3 format");
  assert(exportPayload.vouches.some(item => item.id === vouch.id && item.state === "withdrawn"), "export omitted the withdrawn private vouch history");
  assert(exportPayload.interoperability?.verifiableCredential === "not_issued", "export overstated credential interoperability");

  await deleteAccount(issuer.cookie);
  created.shift();
  const { response: postDeletionResponse, payload: postDeletionPayload } = await request("/api/vouches", { cookie: recipient.cookie });
  assert(postDeletionResponse.status === 200, "recipient query failed after issuer cleanup");
  assert(!postDeletionPayload.items.some(item => item.id === vouch.id), "issuer deletion did not remove vouch visibility for recipient");

  await deleteAccount(recipient.cookie);
  created.shift();
  await deleteAccount(unrelated.cookie);
  created.shift();

  console.log(JSON.stringify({
    verified: true,
    checks: [
      "private-vouch-created",
      "unrelated-member-denied",
      "recipient-viewed",
      "recipient-withdrawal-denied",
      "presentation-draft-recorded-not-executed",
      "presentation-draft-revoked",
      "issuer-withdrew-vouch",
      "export-v3-honest-boundary",
      "issuer-deletion-removed-vouch",
      "disposable-accounts-cleaned",
    ],
  }));
} finally {
  for (const account of created) {
    try { await deleteAccount(account.cookie); } catch { /* Preserve the original verification failure. */ }
  }
}
