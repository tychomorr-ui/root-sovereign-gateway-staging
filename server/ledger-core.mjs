import { createHash, randomUUID } from "node:crypto";

const claimTypes = new Set(["report", "firsthand_account", "opinion", "analysis", "correction", "question"]);
const consentScopes = new Set(["root_private_storage", "member_proof_draft", "truth_talk_private_draft"]);
const grantScopes = new Set(["identity_profile", "private_attestations", "private_claim_drafts", "private_action_plan"]);
const identityPostures = new Set(["private", "pseudonymous", "disclosed_by_choice", "organization_steward"]);
const vouchScopes = new Set(["account_control", "specific_interaction", "member_stated_collaboration"]);
const presentationClaims = new Set(["identity_posture", "account_control_receipt", "attestation_integrity_receipt", "vouch_summary"]);

function canonicalize(value) {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("ROOT cannot create an integrity receipt for a non-finite number.");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  throw new Error("ROOT cannot create an integrity receipt for this value.");
}

function digest(payload) {
  return createHash("sha256").update(canonicalize(payload), "utf8").digest("hex");
}

function cleanText(value, minimum, maximum, field) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < minimum || text.length > maximum) return { error: `${field} must be between ${minimum} and ${maximum} characters.` };
  return { value: text };
}

function normalizeSources(value) {
  const sources = Array.isArray(value) ? value.map(item => typeof item === "string" ? item.trim() : "").filter(Boolean) : [];
  if (sources.length > 4) return { error: "ROOT accepts at most four declared public sources for one private claim draft." };
  for (const source of sources) {
    try {
      const url = new URL(source);
      if (!/^https?:$/.test(url.protocol)) return { error: "Declared sources must use an http or https URL." };
    } catch { return { error: "Declared sources must use valid http or https URLs." }; }
  }
  return { value: sources };
}

export function normalizeAttestation(input) {
  const label = cleanText(input?.label, 3, 80, "Attestation label");
  const statement = cleanText(input?.statement, 10, 600, "Attestation statement");
  if (label.error || statement.error) return { error: label.error || statement.error };
  return { payload: { label: label.value, statement: statement.value } };
}

export function normalizeClaim(input) {
  const claimType = typeof input?.claimType === "string" ? input.claimType : "";
  const statement = cleanText(input?.statement, 20, 1200, "Claim statement");
  const sources = normalizeSources(input?.sources);
  if (!claimTypes.has(claimType)) return { error: "ROOT requires a declared Truth Talk claim type." };
  if (statement.error || sources.error) return { error: statement.error || sources.error };
  return { payload: { claimType, statement: statement.value, sources: sources.value, publication: "private_draft_only" } };
}

export function normalizeConsent(input) {
  const scope = typeof input?.scope === "string" ? input.scope : "";
  if (!consentScopes.has(scope)) return { error: "ROOT does not recognize that consent scope." };
  return { payload: { scope, statement: `Member authorizes ${scope} inside ROOT only. No external recipient is granted access.`, recipient: "ROOT self-owned account service" } };
}

export function normalizeConsentGrant(input) {
  const recipientLabel = cleanText(input?.recipientLabel, 3, 120, "Recipient label");
  const purpose = cleanText(input?.purpose, 10, 300, "Purpose");
  const dataScopes = Array.isArray(input?.dataScopes) ? [...new Set(input.dataScopes.filter(scope => typeof scope === "string"))] : [];
  const expiresAt = input?.expiresAt === null || input?.expiresAt === "" || input?.expiresAt === undefined ? null : Number(input.expiresAt);
  if (recipientLabel.error || purpose.error) return { error: recipientLabel.error || purpose.error };
  if (dataScopes.length === 0 || dataScopes.length > 4 || dataScopes.some(scope => !grantScopes.has(scope))) return { error: "Choose one or more permitted private data scopes for the proposed grant." };
  if (expiresAt !== null && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) return { error: "A grant expiration must be a future time or left blank." };
  return { payload: { recipientLabel: recipientLabel.value, purpose: purpose.value, dataScopes, expiresAt, execution: "recorded_not_executed", statement: "This is a private ROOT consent grant record. ROOT has not transferred data or confirmed an external recipient." } };
}

export function normalizeIdentityProfile(input) {
  const displayName = typeof input?.displayName === "string" ? input.displayName.trim() : "";
  const selfDescription = typeof input?.selfDescription === "string" ? input.selfDescription.trim() : "";
  const identityPosture = typeof input?.identityPosture === "string" ? input.identityPosture : "private";
  if (displayName.length > 100) return { error: "Display name must be 100 characters or fewer." };
  if (selfDescription.length > 600) return { error: "Self-description must be 600 characters or fewer." };
  if (!identityPostures.has(identityPosture)) return { error: "ROOT does not recognize that identity posture." };
  return { profile: { displayName, selfDescription, identityPosture, verification: "self_asserted_not_third_party_verified" } };
}

export function normalizeVouch(input) {
  const recipientHandle = typeof input?.recipientHandle === "string" ? input.recipientHandle.trim().toLowerCase() : "";
  const scope = typeof input?.scope === "string" ? input.scope : "";
  const statement = cleanText(input?.statement, 20, 600, "Vouch statement");
  const strength = Number(input?.strength);
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(recipientHandle)) return { error: "Choose a valid ROOT handle for the private vouch recipient." };
  if (!vouchScopes.has(scope)) return { error: "ROOT does not recognize that private vouch scope." };
  if (statement.error) return { error: statement.error };
  if (!Number.isInteger(strength) || strength < 1 || strength > 5) return { error: "Choose a private vouch strength from 1 through 5." };
  return { recipientHandle, payload: { scope, statement: statement.value, strength, privacy: "member_to_member_private", credential: "not_issued", statementBoundary: "A private vouch records one member's stated support. It is not a public rating, credential, score, or verification of real-world facts." } };
}

export function normalizePresentationDraft(input) {
  const recipientLabel = cleanText(input?.recipientLabel, 3, 120, "Recipient label");
  const purpose = cleanText(input?.purpose, 10, 300, "Presentation purpose");
  const challenge = cleanText(input?.challenge, 16, 256, "Verifier challenge");
  const requestedClaims = Array.isArray(input?.requestedClaims) ? [...new Set(input.requestedClaims.filter(item => typeof item === "string"))] : [];
  const expiresAt = Number(input?.expiresAt);
  let recipientOrigin = "";
  try {
    const parsed = new URL(typeof input?.recipientOrigin === "string" ? input.recipientOrigin : "");
    if (parsed.protocol !== "https:") throw new Error("origin");
    recipientOrigin = parsed.origin;
  } catch { return { error: "A selective-disclosure draft requires an exact HTTPS recipient origin." }; }
  if (recipientLabel.error || purpose.error || challenge.error) return { error: recipientLabel.error || purpose.error || challenge.error };
  if (!/^[A-Za-z0-9_-]+$/.test(challenge.value)) return { error: "Verifier challenge must use a URL-safe nonce value." };
  if (requestedClaims.length === 0 || requestedClaims.length > 3 || requestedClaims.some(claim => !presentationClaims.has(claim))) return { error: "Choose one to three permitted selective-disclosure claims." };
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || expiresAt > Date.now() + 10 * 60 * 1000) return { error: "A presentation draft must expire within the next ten minutes." };
  return { payload: { version: "root-selective-disclosure-draft-v0.1", recipientOrigin, recipientLabel: recipientLabel.value, purpose: purpose.value, requestedClaims, challenge: challenge.value, expiresAt, presentationState: "draft_not_executed", execution: "recorded_not_executed", statement: "This is a private ROOT presentation draft. ROOT has not issued a credential, signed a presentation, transferred a claim, or contacted the recipient." } };
}

export function normalizeCorrection(input) {
  const statement = cleanText(input?.statement, 20, 1200, "Correction statement");
  if (statement.error) return { error: statement.error };
  return { payload: { statement: statement.value } };
}

export function createLedgerRecord({ accountId, kind, payload, now = Date.now(), relation = null, state = "active" }) {
  const record = {
    id: randomUUID(),
    accountId,
    kind,
    state,
    payload,
    relation,
    createdAt: now,
    updatedAt: now,
  };
  record.integrityDigest = digest({ kind: record.kind, state: record.state, payload: record.payload, relation: record.relation, createdAt: record.createdAt });
  return record;
}

export function ledgerView(record) {
  return {
    id: record.id,
    kind: record.kind,
    state: record.state,
    payload: record.payload,
    relation: record.relation,
    integrityDigest: record.integrityDigest,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function reviseLedgerRecord(record, { state, payload, relation, now = Date.now() }) {
  const next = { ...record, state, payload: payload ?? record.payload, relation: relation ?? record.relation, updatedAt: now };
  next.integrityDigest = digest({ kind: next.kind, state: next.state, payload: next.payload, relation: next.relation, createdAt: next.createdAt, updatedAt: next.updatedAt });
  return next;
}

export function createVouchRecord({ voucherAccountId, recipientAccountId, payload, now = Date.now() }) {
  const record = { id: randomUUID(), voucherAccountId, recipientAccountId, state: "active", payload, createdAt: now, updatedAt: now };
  record.integrityDigest = digest({ kind: "member_vouch", state: record.state, voucherAccountId: record.voucherAccountId, recipientAccountId: record.recipientAccountId, payload: record.payload, createdAt: record.createdAt });
  return record;
}

export function reviseVouchRecord(record, { state, now = Date.now() }) {
  const next = { ...record, state, updatedAt: now };
  next.integrityDigest = digest({ kind: "member_vouch", state: next.state, voucherAccountId: next.voucherAccountId, recipientAccountId: next.recipientAccountId, payload: next.payload, createdAt: next.createdAt, updatedAt: next.updatedAt });
  return next;
}

export function recordKinds() {
  return { claimTypes: [...claimTypes], consentScopes: [...consentScopes], grantScopes: [...grantScopes], identityPostures: [...identityPostures], vouchScopes: [...vouchScopes], presentationClaims: [...presentationClaims] };
}
