import { describe, expect, it } from "vitest";
import { cmapAlignment } from "./cmap";

describe("Project Reclaim CMAP alignment", () => {
  it("stays reference-only until a real peer and cryptographic proof exist", () => {
    expect(cmapAlignment.state).toBe("reference_only_not_enrolled");
    expect(cmapAlignment.enrolledPeers).toHaveLength(0);
    expect(cmapAlignment.registryProof.cid).toBe("not_issued_until_actual_content_addressing");
    expect(cmapAlignment.registryProof.signature).toBe("not_issued_until_actual_ed25519_signing");
    expect(cmapAlignment.registryProof.ledger).toBe("not_issued_until_actual_ledger_confirmation");
    expect(cmapAlignment.verificationControls.defaultState).toBe("unverified_fail_closed");
    expect(cmapAlignment.verificationControls.signatureInput).toBe("raw_response_bytes_before_json_parse");
    expect(cmapAlignment.verificationControls.freshnessTtlSecondsMaximum).toBe(120);
    expect(cmapAlignment.verificationControls.futureSkewSecondsMaximum).toBe(30);
  });

  it("requires quarantine and excludes member, provider, emergency, and private-location data", () => {
    expect(cmapAlignment.syncPolicy.some(rule => rule.includes("quarantined"))).toBe(true);
    expect(cmapAlignment.excluded.join(" ")).toContain("member action plans");
    expect(cmapAlignment.excluded.join(" ")).toContain("emergency context");
    expect(cmapAlignment.excluded.join(" ")).toContain("worksite coordinates");
    expect(cmapAlignment.excluded.join(" ")).toContain("activation-package private keys");
    expect(cmapAlignment.publicOperationalRecords).toHaveLength(0);
  });
});
