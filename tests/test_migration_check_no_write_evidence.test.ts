import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { collectMigrationCheckNoWriteEvidence } from "./support/migration-check-no-write/collect.js";
import { evidencePath } from "./support/migration-check-no-write/paths.js";
import { formatMigrationCheckNoWriteReport } from "./support/migration-check-no-write/report.js";

describe("migration check no-write evidence", () => {
  it("records R3 EVD-3 with missing, stale, and drift no-write failures", async () => {
    const evidence = await collectMigrationCheckNoWriteEvidence();
    const report = formatMigrationCheckNoWriteReport(evidence);

    expect(report).toBe(await readFile(evidencePath, "utf8"));
    expect(evidence.cases.map((caseEvidence) => [caseEvidence.name, caseEvidence.status]))
      .toEqual([
        ["missing-generated-artifact", "PASS"],
        ["stale-generated-artifact", "PASS"],
        ["unexplained-drift", "PASS"],
      ]);
    expect(evidence.cases.every((caseEvidence) => caseEvidence.exitCode === 1)).toBe(true);
    expect(evidence.cases.every((caseEvidence) => caseEvidence.noWritePassed)).toBe(true);
    expect(evidence.cases.every((caseEvidence) => caseEvidence.diagnosticPassed)).toBe(true);
  });
});
