import { describe, expect, it } from "vitest";
import { decryptStore, encryptStore, fingerprintToken, hashPassword, issueOpaqueToken, normalizeHandle, parseDataEncryptionKey, validateCredentials, verifyPassword } from "./auth-core.mjs";

describe("ROOT self-owned authentication core", () => {
  it("normalizes a ROOT handle and rejects invalid local identifiers", () => {
    expect(normalizeHandle("  ROOT-Guide  ")).toBe("root-guide");
    expect(validateCredentials("root-guide", "this is a long local password")).toBeNull();
    expect(validateCredentials("Email@Example.com", "this is a long local password")).toContain("ROOT handle");
  });

  it("stores only a salted password verification record", async () => {
    const record = await hashPassword("a locally owned ROOT passphrase");
    expect(record.hash).not.toContain("locally owned");
    await expect(verifyPassword("a locally owned ROOT passphrase", record)).resolves.toBe(true);
    await expect(verifyPassword("wrong passphrase", record)).resolves.toBe(false);
  });

  it("creates opaque session values and persists only their fingerprint", () => {
    const token = issueOpaqueToken();
    const fingerprint = fingerprintToken(token);
    expect(token).not.toBe(fingerprint);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("encrypts a persistent account store with an installation-controlled key", () => {
    const key = parseDataEncryptionKey(Buffer.alloc(32, 7).toString("base64"));
    const protectedStore = encryptStore({ accounts: [{ handle: "root-owner" }], sessions: [] }, key);
    expect(JSON.stringify(protectedStore)).not.toContain("root-owner");
    expect(decryptStore(protectedStore, key)).toEqual({ accounts: [{ handle: "root-owner" }], sessions: [] });
    expect(() => parseDataEncryptionKey("not-a-32-byte-key")).toThrow("32 bytes");
  });
});
