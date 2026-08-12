import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
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

export function parseDataEncryptionKey(value) {
  if (!value) return null;
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("ROOT_AUTH_DATA_KEY must decode to exactly 32 bytes.");
  return key;
}

export function encryptStore(store, key) {
  if (!key) return store;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(store), "utf8"), cipher.final()]);
  return { format: "root-auth-aes-256-gcm-v1", iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}

export function decryptStore(stored, key) {
  if (!stored?.format) return stored;
  if (stored.format !== "root-auth-aes-256-gcm-v1" || !key) throw new Error("ROOT cannot read the protected account store without its configured data key.");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(stored.iv, "base64"));
  decipher.setAuthTag(Buffer.from(stored.tag, "base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(stored.ciphertext, "base64")), decipher.final()]).toString("utf8"));
}
