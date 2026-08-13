import { describe, expect, it } from "vitest";
import { cmapAlignment } from "./cmap";

describe("Project Reclaim CMAP alignment", () => {
  it("stays reference-only until a real peer and cryptographic proof exist", () => {
    expect(cmapAlignment.state).toBe("reference_only_not_enrolled");
    expect(cmapAlignment.enrolledPeers).toHaveLength(0);
    expect(cmapAlignment.registryProof.cid).toBe("not_issued_until_actual_content_addressing");
    expect(cmapAlignment.registryProof.signature).toBe("not_issued_until_actual_ed25519_signing");
    expect(cmapAlignment.registryProof.ledger).toBe("not_issued_until_actual_ledger_confirmation");
  });

  it("requires quarantine and excludes member, provider, emergency, and private-location data", () => {
    expect(cmapAlignment.syncPolicy.some(rule => rule.includes("quarantined"))).toBe(true);
    expect(cmapAlignment.excluded.join(" ")).toContain("member action plans");
    expect(cmapAlignment.excluded.join(" ")).toContain("emergency context");
    expect(cmapAlignment.excluded.join(" ")).toContain("worksite coordinates");
    expect(cmapAlignment.publicOperationalRecords).toHaveLength(0);
  });
});
