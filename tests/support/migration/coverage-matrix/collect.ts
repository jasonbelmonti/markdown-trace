import { collectMigrationCheckCompatibilityEvidence } from "../../migration-check-compatibility/collect.js";
import { collectMigrationCheckNoWriteEvidence } from "../../migration-check-no-write/collect.js";
import {
  coverageEvidenceIssueIds,
  matrixStatusForRows,
  missingRequiredCaseIds,
  type CoverageMatrixEvidence,
} from "./model.js";
import { buildNegativeProbeEvidence } from "./negative-probes.js";
import { evidencePath } from "./paths.js";
import {
  collectCodefactorySidecarCheck,
  collectMalformedProfileCheck,
} from "./probes.js";
import { buildCoverageMatrixRows } from "./rows.js";

export { evidencePath };

export async function collectCoverageMatrixEvidence(): Promise<CoverageMatrixEvidence> {
  const [compatibility, noWrite, codefactory, malformedProfile] =
    await Promise.all([
      collectMigrationCheckCompatibilityEvidence(),
      collectMigrationCheckNoWriteEvidence(),
      collectCodefactorySidecarCheck(),
      collectMalformedProfileCheck(),
    ]);
  const rows = buildCoverageMatrixRows({
    compatibility,
    noWrite,
    codefactory,
    malformedProfile,
  });
  const missingCases = missingRequiredCaseIds(rows);

  return {
    evidenceId: "R3-EVD-6",
    validationCheckpoint: "VAL-6",
    workPackage: "WP-4",
    relatedIssues: coverageEvidenceIssueIds,
    rows,
    negativeProbes: buildNegativeProbeEvidence({
      noWrite,
      malformedProfile,
    }),
    missingRequiredCaseIds: missingCases,
    status: matrixStatusForRows(rows, missingCases),
  };
}
