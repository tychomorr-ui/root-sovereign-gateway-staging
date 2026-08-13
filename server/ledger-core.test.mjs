import { describe, expect, it } from "vitest";
import { createLedgerRecord, normalizeAttestation, normalizeClaim, normalizeConsent, normalizeConsentGrant, normalizeIdentityProfile, reviseLedgerRecord } from "./ledger-core.mjs";

describe("ROOT member ledger core", () => {
  it("creates deterministic integrity receipts from the same public record facts", () => {
    const first = createLedgerRecord({ accountId: "member-1", kind: "attestation", payload: { label: "Account control", statement: "I control this ROOT account." }, now: 1000 });
    const second = createLedgerRecord({ accountId: "member-2", kind: "attestation", payload: { statement: "I control this ROOT account.", label: "Account control" }, now: 1000 });
    expect(first.integrityDigest).toBe(second.integrityDigest);
  });

  it("rejects public publication fields and accepts only declared private Truth Talk drafts", () => {
    expect(normalizeClaim({ claimType: "report", statement: "A member keeps this as a private, source-declared ROOT draft.", sources: ["https://example.org/source"] }).payload.publication).toBe("private_draft_only");
    expect(normalizeClaim({ claimType: "truth", statement: "This is not a supported claim type and should not pass.", sources: [] }).error).toMatch(/claim type/i);
  });

  it("limits consent to internal ROOT storage scopes", () => {
    expect(normalizeConsent({ scope: "root_private_storage" }).payload.recipient).toBe("ROOT self-owned account service");
    expect(normalizeConsent({ scope: "sell_my_data" }).error).toMatch(/does not recognize/i);
  });

  it("records a proposed consent grant without claiming that any transfer occurred", () => {
    const grant = normalizeConsentGrant({ recipientLabel: "A named future verifier", purpose: "Present only a private proof draft if I later choose to execute this grant.", dataScopes: ["private_claim_drafts"] });
    expect(grant.payload.execution).toBe("recorded_not_executed");
    expect(grant.payload.statement).toMatch(/has not transferred data/i);
  });

  it("keeps a member profile voluntary and self-asserted", () => {
    const profile = normalizeIdentityProfile({ displayName: "A private member", selfDescription: "I choose how I describe myself within my ROOT account.", identityPosture: "pseudonymous" });
    expect(profile.profile.verification).toBe("self_asserted_not_third_party_verified");
    expect(normalizeIdentityProfile({ identityPosture: "government_verified" }).error).toMatch(/does not recognize/i);
  });

  it("creates a new integrity receipt when an active record is withdrawn", () => {
    const record = createLedgerRecord({ accountId: "member-1", kind: "attestation", payload: { label: "Account control", statement: "I control this ROOT account." }, now: 1000 });
    const withdrawn = reviseLedgerRecord(record, { state: "withdrawn", now: 2000 });
    expect(withdrawn.integrityDigest).not.toBe(record.integrityDigest);
    expect(withdrawn.state).toBe("withdrawn");
  });
});
