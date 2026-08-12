import { describe, expect, it } from "vitest";
import { fingerprintToken, hashPassword, issueOpaqueToken, normalizeHandle, validateCredentials, verifyPassword } from "./auth-core.mjs";

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
});
