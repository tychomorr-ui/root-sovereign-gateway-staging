import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const HANDLE = /^[a-z0-9][a-z0-9_-]{2,31}$/;

export function normalizeHandle(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateCredentials(handle, password) {
  if (!HANDLE.test(handle)) return "Use a 3–32 character ROOT handle with lowercase letters, numbers, hyphens, or underscores.";
  if (typeof password !== "string" || password.length < 14 || password.length > 128) return "Use a password between 14 and 128 characters.";
  return null;
}

export async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: Buffer.from(derived).toString("hex") };
}

export async function verifyPassword(password, passwordRecord) {
  const derived = await scrypt(password, passwordRecord.salt, 64);
  const expected = Buffer.from(passwordRecord.hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function issueOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function fingerprintToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
