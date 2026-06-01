export const requiredCoverageCaseIds = [
  "r0-yaml",
  "minimal-r1",
  "codefactory-profile",
  "stale-artifact-failure",
  "missing-artifact-failure",
  "malformed-profile-failure",
] as const;

export type CoverageCaseId = (typeof requiredCoverageCaseIds)[number];
export type ExpectedResult = "pass" | "fail";
export type MatrixStatus = "PASS" | "FAIL";

export interface CoverageMatrixRow {
  readonly caseId: CoverageCaseId;
  readonly caseName: string;
  readonly requirement: string;
  readonly fixtureInputs: readonly string[];
  readonly command: string;
  readonly expectedResult: ExpectedResult;
  readonly expectedBehavior: string;
  readonly observedEvidence: string;
  readonly blockers: readonly string[];
  readonly status: MatrixStatus;
}

export interface CoverageMatrixEvidence {
  readonly evidenceId: "R3-EVD-6";
  readonly validationCheckpoint: "VAL-6";
  readonly workPackage: "WP-4";
  readonly issue: "BEL-1239";
  readonly rows: readonly CoverageMatrixRow[];
  readonly missingRequiredCaseIds: readonly CoverageCaseId[];
  readonly status: MatrixStatus;
}

export interface CommandProbe {
  readonly command: string;
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly status: MatrixStatus;
}

export function missingRequiredCaseIds(
  rows: readonly Pick<CoverageMatrixRow, "caseId">[],
): CoverageCaseId[] {
  const present = new Set(rows.map((row) => row.caseId));

  return requiredCoverageCaseIds.filter((caseId) => !present.has(caseId));
}

export function matrixStatusForRows(
  rows: readonly Pick<CoverageMatrixRow, "status" | "blockers">[],
  missingCases: readonly CoverageCaseId[],
): MatrixStatus {
  return missingCases.length === 0 &&
    rows.every((row) => row.status === "PASS" && row.blockers.length === 0)
    ? "PASS"
    : "FAIL";
}
