import express from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decryptStore, encryptStore, fingerprintToken, hashPassword, issueOpaqueToken, issueRecoveryCode, normalizeHandle, parseDataEncryptionKey, validateCredentials, verifyPassword } from "./auth-core.mjs";
import { normalizePathwayCreate, normalizePathwayStage, pathwayView } from "./pathway-core.mjs";
import { createLedgerRecord, createVouchRecord, ledgerView, normalizeAttestation, normalizeClaim, normalizeConsent, normalizeConsentGrant, normalizeCorrection, normalizeIdentityProfile, normalizePresentationDraft, normalizeVouch, reviseLedgerRecord, reviseVouchRecord } from "./ledger-core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dataFile = process.env.ROOT_AUTH_DATA_PATH || path.join(root, "data", "root-auth.json");
const port = Number(process.env.PORT || 4174);
const host = process.env.ROOT_BIND_HOST || "0.0.0.0";
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 14;
const authWindowMs = 1000 * 60 * 15;
const maxAuthAttempts = 12;
const dataEncryptionKey = parseDataEncryptionKey(process.env.ROOT_AUTH_DATA_KEY);
let data = { version: 5, accounts: [], sessions: [], pathways: [], ledgerRecords: [], profiles: [], recoveryKits: [], vouches: [] };
let writeQueue = Promise.resolve();
const authAttempts = new Map();

if (process.env.NODE_ENV === "production" && !dataEncryptionKey) throw new Error("ROOT_AUTH_DATA_KEY is required when the ROOT account service runs in production.");

async function loadData() {
  await mkdir(path.dirname(dataFile), { recursive: true, mode: 0o700 });
  try {
    data = decryptStore(JSON.parse(await readFile(dataFile, "utf8")), dataEncryptionKey);
    data.accounts ||= [];
    data.sessions ||= [];
    data.pathways ||= [];
    data.ledgerRecords ||= [];
    data.profiles ||= [];
    data.recoveryKits ||= [];
    data.vouches ||= [];
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await persist();
  }
  await mutate(() => { data.sessions = data.sessions.filter(session => session.expiresAt > Date.now()); });
}

function persist() {
  const temporary = `${dataFile}.tmp`;
  return writeFile(temporary, JSON.stringify(encryptStore(data, dataEncryptionKey)), { encoding: "utf8", mode: 0o600 })
    .then(() => rename(temporary, dataFile))
    .then(() => chmod(dataFile, 0o600));
}

function mutate(change) {
  const task = writeQueue.then(async () => {
    const result = await change();
    await persist();
    return result;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map(value => value.trim().split(/=(.*)/s)).filter(([name]) => name).map(([name, value]) => [name, decodeURIComponent(value || "")]));
}

function cookieFor(request, token, maxAge) {
  const secure = request.secure || process.env.NODE_ENV === "production";
  return [`root_session=${encodeURIComponent(token || "")}`, "Path=/", "HttpOnly", "SameSite=Strict", secure ? "Secure" : "", `Max-Age=${maxAge}`].filter(Boolean).join("; ");
}

function accountView(account) {
  return { id: account.id, handle: account.handle };
}

function findSession(request) {
  const token = parseCookies(request.headers.cookie).root_session;
  if (!token) return null;
  const session = data.sessions.find(candidate => candidate.tokenHash === fingerprintToken(token) && candidate.expiresAt > Date.now());
  if (!session) return null;
  const account = data.accounts.find(candidate => candidate.id === session.accountId);
  return account ? { token, session, account } : null;
}

function requireSession(request, response) {
  const current = findSession(request);
  if (!current) {
    response.status(401).json({ error: "Open a ROOT session before changing a private pathway." });
    return null;
  }
  return current;
}

function pathwaysFor(accountId) {
  return data.pathways
    .filter(item => item.accountId === accountId)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(pathwayView);
}

function ledgerFor(accountId) {
  return data.ledgerRecords
    .filter(record => record.accountId === accountId)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(ledgerView);
}

function ownedLedgerRecord(accountId, recordId) {
  return data.ledgerRecords.find(record => record.accountId === accountId && record.id === recordId) || null;
}

function profileFor(accountId) {
  return data.profiles.find(profile => profile.accountId === accountId) || { accountId, displayName: "", selfDescription: "", identityPosture: "private", verification: "self_asserted_not_third_party_verified", updatedAt: null };
}

function vouchView(vouch, viewerAccountId) {
  const direction = vouch.voucherAccountId === viewerAccountId ? "issued" : "received";
  const counterparty = data.accounts.find(account => account.id === (direction === "issued" ? vouch.recipientAccountId : vouch.voucherAccountId));
  if (!counterparty) return null;
  return { id: vouch.id, direction, counterpartyHandle: counterparty.handle, scope: vouch.payload.scope, statement: vouch.payload.statement, strength: vouch.payload.strength, state: vouch.state, integrityDigest: vouch.integrityDigest, createdAt: vouch.createdAt, updatedAt: vouch.updatedAt, privacy: "member_to_member_private", credential: "not_issued" };
}

function vouchesFor(accountId) {
  return data.vouches
    .filter(vouch => vouch.voucherAccountId === accountId || vouch.recipientAccountId === accountId)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(vouch => vouchView(vouch, accountId))
    .filter(Boolean);
}

function sessionsFor(accountId, currentSessionId) {
  return data.sessions
    .filter(session => session.accountId === accountId && session.expiresAt > Date.now())
    .sort((left, right) => right.createdAt - left.createdAt)
    .map(session => ({ id: session.id, current: session.id === currentSessionId, createdAt: session.createdAt, expiresAt: session.expiresAt }));
}

function sameOrigin(request, response, next) {
  const origin = request.get("origin");
  if (!origin) return next();
  try {
    if (new URL(origin).host === request.get("host")) return next();
  } catch { /* Reject malformed origin. */ }
  return response.status(403).json({ error: "ROOT accepts state-changing requests only from the same origin." });
}

function rateLimitAuthentication(request, response, next) {
  const now = Date.now();
  for (const [key, record] of authAttempts) if (record.resetAt <= now) authAttempts.delete(key);
  const key = `${request.ip}:${request.path}`;
  const record = authAttempts.get(key) || { count: 0, resetAt: now + authWindowMs };
  if (record.count >= maxAuthAttempts) {
    response.set("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)));
    return response.status(429).json({ error: "Too many account attempts. Try again after the indicated wait." });
  }
  record.count += 1;
  authAttempts.set(key, record);
  return next();
}

function createSession(accountId) {
  const token = issueOpaqueToken();
  const session = { id: randomUUID(), accountId, tokenHash: fingerprintToken(token), expiresAt: Date.now() + sessionLifetimeMs, createdAt: Date.now() };
  return { token, session };
}

await loadData();
const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "8kb" }));
app.use((request, response, next) => {
  response.set({
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  if (request.secure || process.env.NODE_ENV === "production") response.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.get("/api/auth/me", (request, response) => {
  const current = findSession(request);
  response.set("Cache-Control", "no-store");
  response.json({ user: current ? accountView(current.account) : null });
});

app.post("/api/auth/register", sameOrigin, rateLimitAuthentication, async (request, response) => {
  const handle = normalizeHandle(request.body?.handle);
  const password = request.body?.password;
  const error = validateCredentials(handle, password);
  if (error) return response.status(400).json({ error });
  const passwordRecord = await hashPassword(password);
  try {
    const { account, token } = await mutate(() => {
      if (data.accounts.some(candidate => candidate.handle === handle)) throw new Error("A ROOT account already uses that handle.");
      const createdAt = Date.now();
      const account = { id: randomUUID(), handle, password: passwordRecord, createdAt };
      const { token, session } = createSession(account.id);
      data.accounts.push(account);
      data.sessions.push(session);
      data.profiles.push({ accountId: account.id, displayName: "", selfDescription: "", identityPosture: "private", verification: "self_asserted_not_third_party_verified", updatedAt: createdAt });
      data.ledgerRecords.push(createLedgerRecord({ accountId: account.id, kind: "account_control", payload: { statement: "This ROOT account was created with a self-chosen ROOT handle and password. This receipt proves account-control registration only; it does not verify a legal, biometric, or real-world identity." }, now: createdAt }));
      return { account, token };
    });
    response.set("Cache-Control", "no-store");
    response.set("Set-Cookie", cookieFor(request, token, Math.floor(sessionLifetimeMs / 1000)));
    return response.status(201).json({ user: accountView(account) });
  } catch {
    return response.status(409).json({ error: "That local ROOT account cannot be created." });
  }
});

app.post("/api/auth/login", sameOrigin, rateLimitAuthentication, async (request, response) => {
  const handle = normalizeHandle(request.body?.handle);
  const password = request.body?.password;
  const account = data.accounts.find(candidate => candidate.handle === handle);
  if (!account || !(await verifyPassword(password || "", account.password))) return response.status(401).json({ error: "The ROOT handle or password is incorrect." });
  const { token } = await mutate(() => {
    const created = createSession(account.id);
    data.sessions.push(created.session);
    return created;
  });
  response.set("Cache-Control", "no-store");
  response.set("Set-Cookie", cookieFor(request, token, Math.floor(sessionLifetimeMs / 1000)));
  return response.json({ user: accountView(account) });
});

app.post("/api/auth/logout", sameOrigin, async (request, response) => {
  const current = findSession(request);
  if (current) await mutate(() => { data.sessions = data.sessions.filter(session => session.id !== current.session.id); });
  response.set("Cache-Control", "no-store");
  response.set("Set-Cookie", cookieFor(request, "", 0));
  response.json({ ok: true });
});

app.delete("/api/auth/account", sameOrigin, async (request, response) => {
  const current = findSession(request);
  if (!current) return response.status(401).json({ error: "Open a ROOT session before deleting an account." });
  if (!(await verifyPassword(request.body?.password || "", current.account.password))) return response.status(401).json({ error: "ROOT could not verify that password." });
  await mutate(() => {
    data.accounts = data.accounts.filter(account => account.id !== current.account.id);
    data.sessions = data.sessions.filter(session => session.accountId !== current.account.id);
    data.pathways = data.pathways.filter(item => item.accountId !== current.account.id);
    data.ledgerRecords = data.ledgerRecords.filter(record => record.accountId !== current.account.id);
    data.profiles = data.profiles.filter(profile => profile.accountId !== current.account.id);
    data.recoveryKits = data.recoveryKits.filter(kit => kit.accountId !== current.account.id);
    data.vouches = data.vouches.filter(vouch => vouch.voucherAccountId !== current.account.id && vouch.recipientAccountId !== current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.set("Set-Cookie", cookieFor(request, "", 0));
  response.json({ ok: true });
});

app.get("/api/pathway", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set("Cache-Control", "no-store");
  response.json({ items: pathwaysFor(current.account.id) });
});

app.post("/api/pathway", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizePathwayCreate(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    const now = Date.now();
    const existing = data.pathways.find(item => item.accountId === current.account.id && item.sourceId === input.sourceId);
    if (existing) existing.updatedAt = now;
    else data.pathways.push({ id: randomUUID(), accountId: current.account.id, sourceId: input.sourceId, stage: "saved", createdAt: now, updatedAt: now });
    return pathwaysFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.patch("/api/pathway", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizePathwayStage(request.body);
  if (input.error) return response.status(400).json(input);
  try {
    const items = await mutate(() => {
      const item = data.pathways.find(candidate => candidate.accountId === current.account.id && candidate.sourceId === input.sourceId);
      if (!item) throw new Error("Private pathway step not found.");
      item.stage = input.stage;
      item.updatedAt = Date.now();
      return pathwaysFor(current.account.id);
    });
    response.set("Cache-Control", "no-store");
    response.json({ items });
  } catch {
    response.status(404).json({ error: "ROOT could not update that private pathway step." });
  }
});

app.delete("/api/pathway/:sourceId", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizePathwayCreate({ sourceId: request.params.sourceId });
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.pathways = data.pathways.filter(item => !(item.accountId === current.account.id && item.sourceId === input.sourceId));
    return pathwaysFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ items });
});

app.get("/api/identity", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set("Cache-Control", "no-store");
  response.json({ profile: profileFor(current.account.id), sessions: sessionsFor(current.account.id, current.session.id), recoveryKitActive: data.recoveryKits.some(kit => kit.accountId === current.account.id) });
});

app.put("/api/identity/profile", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeIdentityProfile(request.body);
  if (input.error) return response.status(400).json(input);
  const profile = await mutate(() => {
    const existing = data.profiles.find(candidate => candidate.accountId === current.account.id);
    const next = { accountId: current.account.id, ...input.profile, updatedAt: Date.now() };
    if (existing) Object.assign(existing, next);
    else data.profiles.push(next);
    return profileFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ profile });
});

app.get("/api/auth/sessions", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set("Cache-Control", "no-store");
  response.json({ sessions: sessionsFor(current.account.id, current.session.id) });
});

app.post("/api/auth/sessions/revoke-other", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const sessions = await mutate(() => {
    data.sessions = data.sessions.filter(session => session.accountId !== current.account.id || session.id === current.session.id);
    return sessionsFor(current.account.id, current.session.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ sessions });
});

app.post("/api/auth/recovery-kit", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const recoveryCode = issueRecoveryCode();
  await mutate(() => {
    data.recoveryKits = data.recoveryKits.filter(kit => kit.accountId !== current.account.id);
    data.recoveryKits.push({ accountId: current.account.id, codeHash: fingerprintToken(recoveryCode), createdAt: Date.now() });
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ recoveryCode, notice: "Show once. ROOT stores only a hash. Replacing, revoking, or using the kit invalidates this code." });
});

app.delete("/api/auth/recovery-kit", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  await mutate(() => { data.recoveryKits = data.recoveryKits.filter(kit => kit.accountId !== current.account.id); });
  response.set("Cache-Control", "no-store");
  response.json({ ok: true });
});

app.post("/api/auth/recover", sameOrigin, rateLimitAuthentication, async (request, response) => {
  const handle = normalizeHandle(request.body?.handle);
  const recoveryCode = typeof request.body?.recoveryCode === "string" ? request.body.recoveryCode : "";
  const password = request.body?.password;
  const credentialError = validateCredentials(handle, password);
  if (credentialError) return response.status(400).json({ error: credentialError });
  const account = data.accounts.find(candidate => candidate.handle === handle);
  const kit = account ? data.recoveryKits.find(candidate => candidate.accountId === account.id && candidate.codeHash === fingerprintToken(recoveryCode)) : null;
  if (!account || !kit) return response.status(401).json({ error: "ROOT could not use that recovery kit." });
  const passwordRecord = await hashPassword(password);
  const { token } = await mutate(() => {
    account.password = passwordRecord;
    data.recoveryKits = data.recoveryKits.filter(candidate => candidate.accountId !== account.id);
    data.sessions = data.sessions.filter(session => session.accountId !== account.id);
    const created = createSession(account.id);
    data.sessions.push(created.session);
    return created;
  });
  response.set("Cache-Control", "no-store");
  response.set("Set-Cookie", cookieFor(request, token, Math.floor(sessionLifetimeMs / 1000)));
  response.json({ user: accountView(account) });
});

app.get("/api/ledger", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set("Cache-Control", "no-store");
  response.json({ items: ledgerFor(current.account.id) });
});

app.get("/api/ledger/export", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set({ "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="root-${current.account.handle}-private-records.json"` });
  response.json({ format: "root-private-record-export-v3", exportedAt: Date.now(), account: accountView(current.account), profile: profileFor(current.account.id), records: ledgerFor(current.account.id), vouches: vouchesFor(current.account.id), interoperability: { did: "not_issued", verifiableCredential: "not_issued", signature: "not_issued", credentialStatus: "not_issued", externalPresentation: "draft_only_not_issued" } });
});

app.get("/api/vouches", (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  response.set("Cache-Control", "no-store");
  response.json({ items: vouchesFor(current.account.id) });
});

app.post("/api/vouches", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeVouch(request.body);
  if (input.error) return response.status(400).json(input);
  const recipient = data.accounts.find(account => account.handle === input.recipientHandle);
  if (!recipient) return response.status(404).json({ error: "ROOT could not find that private vouch recipient." });
  if (recipient.id === current.account.id) return response.status(400).json({ error: "A member cannot create a private vouch for their own ROOT account." });
  const items = await mutate(() => {
    data.vouches.push(createVouchRecord({ voucherAccountId: current.account.id, recipientAccountId: recipient.id, payload: input.payload }));
    return vouchesFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/vouches/:vouchId/withdraw", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const vouch = data.vouches.find(candidate => candidate.id === request.params.vouchId && candidate.voucherAccountId === current.account.id && candidate.state === "active");
  if (!vouch) return response.status(404).json({ error: "ROOT could not withdraw that active private vouch." });
  const items = await mutate(() => {
    Object.assign(vouch, reviseVouchRecord(vouch, { state: "withdrawn" }));
    return vouchesFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ items });
});

app.post("/api/ledger/attestations", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeAttestation(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "attestation", payload: input.payload }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/claims", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeClaim(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "claim", payload: input.payload }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/consents", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeConsent(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "consent", payload: input.payload }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/grants", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizeConsentGrant(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "consent_grant", state: "recorded_not_executed", payload: input.payload }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/presentation-drafts", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const input = normalizePresentationDraft(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "selective_disclosure_draft", state: "recorded_not_executed", payload: input.payload }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/:recordId/correct", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const source = ownedLedgerRecord(current.account.id, request.params.recordId);
  if (!source || !["attestation", "claim"].includes(source.kind) || source.state !== "active") return response.status(404).json({ error: "ROOT could not correct that active private record." });
  const input = normalizeCorrection(request.body);
  if (input.error) return response.status(400).json(input);
  const items = await mutate(() => {
    const original = reviseLedgerRecord(source, { state: "corrected" });
    Object.assign(source, original);
    data.ledgerRecords.push(createLedgerRecord({ accountId: current.account.id, kind: "correction", payload: { statement: input.payload.statement, publication: "private_draft_only" }, relation: { correctsId: source.id } }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.status(201).json({ items });
});

app.post("/api/ledger/:recordId/withdraw", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const source = ownedLedgerRecord(current.account.id, request.params.recordId);
  if (!source || !["attestation", "claim", "correction"].includes(source.kind) || source.state !== "active") return response.status(404).json({ error: "ROOT could not withdraw that active private record." });
  const items = await mutate(() => {
    Object.assign(source, reviseLedgerRecord(source, { state: "withdrawn" }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ items });
});

app.post("/api/ledger/:recordId/revoke", sameOrigin, async (request, response) => {
  const current = requireSession(request, response);
  if (!current) return;
  const source = ownedLedgerRecord(current.account.id, request.params.recordId);
  if (!source || !["consent", "consent_grant", "selective_disclosure_draft"].includes(source.kind) || !["active", "recorded_not_executed"].includes(source.state)) return response.status(404).json({ error: "ROOT could not revoke that active private consent or presentation receipt." });
  const items = await mutate(() => {
    Object.assign(source, reviseLedgerRecord(source, { state: "revoked" }));
    return ledgerFor(current.account.id);
  });
  response.set("Cache-Control", "no-store");
  response.json({ items });
});

const dist = path.join(root, "dist");
app.use(express.static(dist, { index: "index.html", maxAge: "1h", etag: true }));
app.use((request, response) => request.method === "GET" ? response.sendFile(path.join(dist, "index.html")) : response.status(404).json({ error: "Not found." }));

app.listen(port, host, () => console.log(`ROOT self-owned auth service listening on ${host}:${port}`));
