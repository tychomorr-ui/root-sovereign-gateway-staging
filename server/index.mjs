import express from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fingerprintToken, hashPassword, issueOpaqueToken, normalizeHandle, validateCredentials, verifyPassword } from "./auth-core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dataFile = process.env.ROOT_AUTH_DATA_PATH || path.join(root, "data", "root-auth.json");
const port = Number(process.env.PORT || 4174);
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 14;
let data = { version: 1, accounts: [], sessions: [] };
let writeQueue = Promise.resolve();

async function loadData() {
  await mkdir(path.dirname(dataFile), { recursive: true, mode: 0o700 });
  try {
    data = JSON.parse(await readFile(dataFile, "utf8"));
    data.accounts ||= [];
    data.sessions ||= [];
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await persist();
  }
  await mutate(() => { data.sessions = data.sessions.filter(session => session.expiresAt > Date.now()); });
}

function persist() {
  const temporary = `${dataFile}.tmp`;
  return writeFile(temporary, JSON.stringify(data), { encoding: "utf8", mode: 0o600 })
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

function sameOrigin(request, response, next) {
  const origin = request.get("origin");
  if (!origin) return next();
  try {
    if (new URL(origin).host === request.get("host")) return next();
  } catch { /* Reject malformed origin. */ }
  return response.status(403).json({ error: "ROOT accepts state-changing requests only from the same origin." });
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

app.get("/api/auth/me", (request, response) => {
  const current = findSession(request);
  response.set("Cache-Control", "no-store");
  response.json({ user: current ? accountView(current.account) : null });
});

app.post("/api/auth/register", sameOrigin, async (request, response) => {
  const handle = normalizeHandle(request.body?.handle);
  const password = request.body?.password;
  const error = validateCredentials(handle, password);
  if (error) return response.status(400).json({ error });
  const passwordRecord = await hashPassword(password);
  try {
    const { account, token } = await mutate(() => {
      if (data.accounts.some(candidate => candidate.handle === handle)) throw new Error("A ROOT account already uses that handle.");
      const account = { id: randomUUID(), handle, password: passwordRecord, createdAt: Date.now() };
      const { token, session } = createSession(account.id);
      data.accounts.push(account);
      data.sessions.push(session);
      return { account, token };
    });
    response.set("Cache-Control", "no-store");
    response.set("Set-Cookie", cookieFor(request, token, Math.floor(sessionLifetimeMs / 1000)));
    return response.status(201).json({ user: accountView(account) });
  } catch (registrationError) {
    return response.status(409).json({ error: registrationError.message || "The account could not be created." });
  }
});

app.post("/api/auth/login", sameOrigin, async (request, response) => {
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
  });
  response.set("Cache-Control", "no-store");
  response.set("Set-Cookie", cookieFor(request, "", 0));
  response.json({ ok: true });
});

const dist = path.join(root, "dist");
app.use(express.static(dist, { index: "index.html", maxAge: "1h", etag: true }));
app.use((request, response) => request.method === "GET" ? response.sendFile(path.join(dist, "index.html")) : response.status(404).json({ error: "Not found." }));

app.listen(port, "0.0.0.0", () => console.log(`ROOT self-owned auth service listening on ${port}`));
