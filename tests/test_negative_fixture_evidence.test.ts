import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { collectNegativeEvidence } from "./support/negative-fixture-evidence/collect.js";
import { evidencePath } from "./support/negative-fixture-evidence/paths.js";
import { formatNegativeEvidenceReport } from "./support/negative-fixture-evidence/report.js";

describe("negative fixture evidence", () => {
  it("records EVD-3 with required negative validation categories", async () => {
    const evidence = await collectNegativeEvidence();
    const report = formatNegativeEvidenceReport(evidence);

    expect(report).toBe(await readFile(evidencePath, "utf8"));
    expect(evidence.outcomes.map((outcome) => [outcome.name, outcome.status])).toEqual([
      ["missing-registered-definition", "FAIL"],
      ["duplicate-canonical-id", "LOAD ERROR"],
      ["duplicate-label", "LOAD ERROR"],
      ["missing-reference", "FAIL"],
      ["missing-edge-target", "FAIL"],
      ["incomplete-bounded-range", "FAIL"],
      ["derived-bounded-range-safety", "DERIVED"],
    ]);
  });
});
