import { describe, expect, it } from "vitest";
import { createLedgerRecord, createVouchRecord, normalizeAttestation, normalizeClaim, normalizeConsent, normalizeConsentGrant, normalizeIdentityProfile, normalizePresentationDraft, normalizeVouch, reviseLedgerRecord, reviseVouchRecord } from "./ledger-core.mjs";

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

  it("keeps a vouch constrained, private, and integrity-bound without issuing a credential", () => {
    const vouch = normalizeVouch({ recipientHandle: "member-two", scope: "specific_interaction", strength: 4, statement: "I privately vouch for this member based on a specific interaction I personally observed." });
    expect(vouch.payload.credential).toBe("not_issued");
    const record = createVouchRecord({ voucherAccountId: "member-1", recipientAccountId: "member-2", payload: vouch.payload, now: 1000 });
    const withdrawn = reviseVouchRecord(record, { state: "withdrawn", now: 2000 });
    expect(withdrawn.integrityDigest).not.toBe(record.integrityDigest);
    expect(normalizeVouch({ recipientHandle: "member-1", scope: "score", strength: 8, statement: "This should fail because ROOT does not create universal scores from vouches." }).error).toMatch(/scope/i);
  });

  it("creates only short-lived selective-disclosure drafts with an HTTPS recipient and verifier challenge", () => {
    const draft = normalizePresentationDraft({ recipientOrigin: "https://xinus.one", recipientLabel: "XINUS", purpose: "Prove a chosen ROOT posture in a future member-approved exchange.", requestedClaims: ["identity_posture"], challenge: "member_challenge_123", expiresAt: Date.now() + 60_000 });
    expect(draft.payload.execution).toBe("recorded_not_executed");
    expect(draft.payload.presentationState).toBe("draft_not_executed");
    expect(normalizePresentationDraft({ recipientOrigin: "http://insecure.example", recipientLabel: "Test", purpose: "This invalid destination should be rejected before any presentation draft exists.", requestedClaims: ["identity_posture"], challenge: "member_challenge_123", expiresAt: Date.now() + 60_000 }).error).toMatch(/HTTPS/i);
  });
});
