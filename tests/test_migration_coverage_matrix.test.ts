import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  collectCoverageMatrixEvidence,
  evidencePath,
} from "./support/migration/coverage-matrix/collect.js";
import {
  missingRequiredCaseIds,
  requiredCoverageCaseIds,
  type CoverageMatrixRow,
} from "./support/migration/coverage-matrix/model.js";
import { formatCoverageMatrixReport } from "./support/migration/coverage-matrix/report.js";

describe("migration coverage matrix evidence", () => {
  it("records R3 EVD-6 with all R2-required fixture/profile rows", async () => {
    const evidence = await collectCoverageMatrixEvidence();
    const report = formatCoverageMatrixReport(evidence);

    expect(report).toBe(await readFile(evidencePath, "utf8"));
    expect(evidence.evidenceId).toBe("R3-EVD-6");
    expect(evidence.validationCheckpoint).toBe("VAL-6");
    expect(evidence.issue).toBe("BEL-1239");
    expect(evidence.status).toBe("PASS");
    expect(evidence.missingRequiredCaseIds).toEqual([]);
    expect(evidence.rows.map((row) => row.caseId)).toEqual(
      requiredCoverageCaseIds,
    );
    expect(evidence.rows.every((row) => row.command.length > 0)).toBe(true);
    expect(evidence.rows.every((row) => row.observedEvidence.length > 0)).toBe(
      true,
    );
    expect(
      evidence.rows.map((row) => [row.caseId, row.expectedResult]),
    ).toEqual([
      ["r0-yaml", "pass"],
      ["minimal-r1", "pass"],
      ["codefactory-profile", "pass"],
      ["stale-artifact-failure", "fail"],
      ["missing-artifact-failure", "fail"],
      ["malformed-profile-failure", "fail"],
    ]);
  });

  it("treats any omitted required row as an MS-3 blocker", () => {
    const rows = requiredCoverageCaseIds
      .filter((caseId) => caseId !== "codefactory-profile")
      .map((caseId) => ({ caseId })) satisfies Array<
      Pick<CoverageMatrixRow, "caseId">
    >;

    expect(missingRequiredCaseIds(rows)).toEqual(["codefactory-profile"]);
  });
});
