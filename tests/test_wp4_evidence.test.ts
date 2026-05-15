import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { collectDeterminismEvidence } from "./support/wp4-evidence/determinism.js";
import { collectIssueKeyCollisionEvidence } from "./support/wp4-evidence/issue-key-collision.js";
import { collectLocalSafetyReportEvidence } from "./support/wp4-evidence/local-safety.js";
import {
  determinismEvidencePath,
  issueKeyCollisionEvidencePath,
  localSafetyEvidencePath,
} from "./support/wp4-evidence/paths.js";
import { formatDeterminismReport } from "./support/wp4-evidence/reports/determinism-report.js";
import { formatIssueKeyCollisionReport } from "./support/wp4-evidence/reports/issue-key-collision-report.js";
import { formatLocalSafetyReport } from "./support/wp4-evidence/reports/local-safety-report.js";

describe("WP-4 evidence", () => {
  it("records EVD-4 deterministic repeat evidence for selected command paths", async () => {
    const evidence = await collectDeterminismEvidence();
    const report = formatDeterminismReport(evidence);

    expect(report).toBe(await readFile(determinismEvidencePath, "utf8"));
    expect(evidence.commands).toHaveLength(2);
    expect(evidence.commands.every((command) => command.identicalOrderedOutputs)).toBe(true);
    expect(evidence.commands.flatMap((command) => command.runs).every((run) => run.exitCode === 0))
      .toBe(true);
  });

  it("records EVD-5 issue-key collision evidence for sidecar and derived graphs", async () => {
    const evidence = await collectIssueKeyCollisionEvidence();
    const report = formatIssueKeyCollisionReport(evidence);

    expect(report).toBe(await readFile(issueKeyCollisionEvidencePath, "utf8"));
    expect(evidence.surfaces.every((surface) => surface.containsIssueKeyInInput)).toBe(true);
    expect(
      evidence.surfaces.every(
        (surface) =>
          !containsIssueKey(surface.entityIds, evidence.issueKey) &&
          !containsIssueKey(surface.entityLabels, evidence.issueKey) &&
          !containsIssueKey(surface.graphNodeIds, evidence.issueKey) &&
          !containsIssueKey(surface.graphNodeLabels, evidence.issueKey) &&
          !containsIssueKey(surface.graphEdgeEndpointIds, evidence.issueKey) &&
          !containsIssueKey(surface.graphEdgeEndpointLabels, evidence.issueKey) &&
          !containsIssueKey(surface.externalReferenceKeys, evidence.issueKey) &&
          !containsIssueKey(surface.externalReferenceRelatedEntities, evidence.issueKey),
      ),
    ).toBe(true);
  });

  it("records EVD-6 local-only safety evidence for selected command paths", async () => {
    const evidence = await collectLocalSafetyReportEvidence();
    const report = formatLocalSafetyReport(evidence);

    expect(report).toBe(await readFile(localSafetyEvidencePath, "utf8"));
    expect(evidence.commands).toHaveLength(2);
    expect(evidence.commands.every((command) => command.exitCode === 0)).toBe(true);
    expect(evidence.commands.every((command) => command.networkAttempts === 0)).toBe(true);
    expect(evidence.commands.every((command) => command.approvedWritesOnly)).toBe(true);
    expect(evidence.commands.every((command) => !command.repositoryStatusChanged)).toBe(true);
    expect(evidence.commands.every((command) => command.stderr === "")).toBe(true);
  });
});

function containsIssueKey(values: readonly string[], issueKey: string): boolean {
  return values.some((value) => value.includes(issueKey));
}
