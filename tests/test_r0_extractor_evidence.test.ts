import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realExecutionSpecPath =
  "/Users/jasonbelmonti/Documents/Development/execution-decomposer/docs/execution/execution-decomposer-execution-spec.md";

describe("R0 trace evidence extractor", () => {
  it("emits table-fixture evidence without promoting table-only candidates", async () => {
    const evidence = await runExtractor(
      "experiments/profile-aware-graph-validation-r0/fixtures/ctx-table-trace-fixture.md",
    );

    expect(evidence.summary).toEqual({
      sectionCount: 7,
      tableCount: 3,
      traceLinkCount: 11,
      rawIdOccurrenceCount: 22,
      primaryDefinitionCount: 3,
      nonAuthoritativeCandidateCount: 3,
      entityReferenceCount: 7,
      rangeReferenceCount: 1,
      candidateEdgeCount: 6,
      diagnosticHintCount: 9,
      rawPrimaryDefinitionCount: 0,
      supplementalDefinitionCount: 0,
      coverageRowCount: 0,
      rawRangeReferenceCount: 1,
      repeatedIdCount: 6,
    });
    expect(
      evidence.candidateTraceFacts.primaryDefinitions.map((definition) => [
        definition.label,
        definition.canonicalId,
        definition.type,
      ]),
    ).toEqual([
      ["WP-1", "exec.wp.1", "work_package"],
      ["VAL-1", "exec.val.1", "validation_checkpoint"],
      ["VAL-2", "exec.val.2", "validation_checkpoint"],
    ]);
    expect(
      evidence.candidateTraceFacts.nonAuthoritativeEntityCandidates.map((candidate) => [
        candidate.label,
        candidate.role,
        candidate.table?.columnHeader,
      ]),
    ).toEqual([
      ["OBJ-99", "table_evidence_candidate", "Table-only candidate"],
      ["EVD-99", "table_evidence_candidate", "Table-only candidate"],
      ["VAL-99", "table_evidence_candidate", "Table-only candidate"],
    ]);
    expect(evidence.candidateTraceFacts.rangeReferences).toEqual([
      expect.objectContaining({
        label: "VAL-1 through VAL-2",
        role: "table_range_reference",
        resolution: {
          start: "primary_definition_found",
          end: "primary_definition_found",
        },
      }),
    ]);
    expect(
      evidence.candidateTraceFacts.roleClassifiedRawFacts.classifications
        .filter((classification) => classification.role === "table_evidence_candidate")
        .map((classification) => [classification.label, classification.role, classification.resolution]),
    ).toEqual([
      ["OBJ-99", "table_evidence_candidate", "non_authoritative_candidate"],
      ["EVD-99", "table_evidence_candidate", "non_authoritative_candidate"],
      ["VAL-99", "table_evidence_candidate", "non_authoritative_candidate"],
    ]);
    expect(evidence.candidateTraceFacts.roleClassifiedRawFacts.rangeReferences).toEqual([
      expect.objectContaining({
        label: "VAL-1 through VAL-2",
        role: "mention_range",
        resolution: {
          start: "definition_found",
          end: "definition_found",
        },
      }),
    ]);
  });

  it("classifies generated design-spec requirement, behavior, mechanism, and validation coverage paths", async () => {
    const evidence = await runExtractor("docs/evidence/generated-design-spec-demo.md");
    const rawFacts = evidence.candidateTraceFacts.roleClassifiedRawFacts;

    expect(evidence.summary).toEqual({
      sectionCount: 27,
      tableCount: 10,
      traceLinkCount: 0,
      rawIdOccurrenceCount: 73,
      primaryDefinitionCount: 0,
      nonAuthoritativeCandidateCount: 0,
      entityReferenceCount: 0,
      rangeReferenceCount: 0,
      candidateEdgeCount: 38,
      diagnosticHintCount: 0,
      rawPrimaryDefinitionCount: 21,
      supplementalDefinitionCount: 0,
      coverageRowCount: 15,
      rawRangeReferenceCount: 0,
      repeatedIdCount: 16,
    });
    expect(rawFacts.summary.roleCounts).toEqual({
      coverage_reference: 41,
      mention: 11,
      primary_definition: 21,
    });
    expect(
      rawFacts.primaryDefinitions.map((definition) => [definition.label, definition.table?.columnHeader]),
    ).toEqual(
      expect.arrayContaining([
        ["REQ-1", "ID"],
        ["FUNC-1", "ID"],
        ["TECH-1", "ID"],
        ["VAL-1", "ID"],
      ]),
    );
    expect(rawFacts.coverageRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          section: expect.objectContaining({ title: "5. Requirements" }),
          sourceLabels: ["REQ-1"],
          targetLabels: ["VAL-1"],
        }),
        expect.objectContaining({
          section: expect.objectContaining({ title: "8. Operational Scenarios and Functional Behavior" }),
          sourceLabels: ["FUNC-2"],
          targetLabels: expect.arrayContaining(["REQ-2", "REQ-3"]),
        }),
        expect.objectContaining({
          section: expect.objectContaining({ title: "17. Verification Strategy and Behavior-to-Mechanism Traceability" }),
          sourceLabels: ["VAL-1"],
          targetLabels: expect.arrayContaining(["REQ-1", "FUNC-1", "ACC-1", "TECH-2"]),
        }),
      ]),
    );
    const validationRow = rawFacts.coverageRows.find((row) => row.sourceLabels.includes("VAL-3"));

    expect(validationRow).toEqual(
      expect.objectContaining({
        targetLabels: ["VAL-1", "VAL-2", "ACC-3", "FUNC-1", "FUNC-2", "REQ-3", "TECH-4"],
        targetRelationshipHints: [
          "verification_method_coverage",
          "verification_method_coverage",
          "related_ids_coverage",
          "related_ids_coverage",
          "related_ids_coverage",
          "related_ids_coverage",
          "related_ids_coverage",
        ],
      }),
    );
    expect(rawFacts.candidateEdges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          coverageRowId: validationRow?.coverageRowId,
          fromLabel: "VAL-3",
          toLabel: "VAL-1",
          relationshipHint: "verification_method_coverage",
        }),
        expect.objectContaining({
          coverageRowId: validationRow?.coverageRowId,
          fromLabel: "VAL-3",
          toLabel: "ACC-3",
          relationshipHint: "related_ids_coverage",
        }),
        expect.objectContaining({
          coverageRowId: validationRow?.coverageRowId,
          fromLabel: "VAL-3",
          toLabel: "TECH-4",
          relationshipHint: "related_ids_coverage",
        }),
      ]),
    );
  });

  it.skipIf(!existsSync(realExecutionSpecPath))(
    "classifies real execution-spec matrix rows as coverage evidence",
    async () => {
      const evidence = await runExtractor(realExecutionSpecPath);
      const rawFacts = evidence.candidateTraceFacts.roleClassifiedRawFacts;
      const matrixClassifications = rawFacts.classifications.filter((classification) =>
        classification.section?.title.includes("Execution Traceability Matrix"),
      );

      expect(evidence.summary.rawPrimaryDefinitionCount).toBe(130);
      expect(evidence.summary.supplementalDefinitionCount).toBe(7);
      expect(evidence.summary.coverageRowCount).toBe(147);
      expect(evidence.summary.rawRangeReferenceCount).toBe(25);
      expect(evidence.summary.candidateEdgeCount).toBe(1924);
      expect(matrixClassifications).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ role: "primary_definition" })]),
      );
      expect(rawFacts.coverageRows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            rowKind: "matrix_coverage_row",
            section: expect.objectContaining({ title: "17. Execution Traceability Matrix" }),
            sourceLabels: ["SRC-1"],
            targetLabels: expect.arrayContaining(["SURF-2", "SURF-11", "VAL-1", "VAL-14"]),
          }),
        ]),
      );
      const multiSourceMatrixRow = rawFacts.coverageRows.find((row) =>
        row.sourceLabels.includes("SURF-10") &&
        row.sourceLabels.includes("SURF-2") &&
        row.targetLabels.includes("PKG-1"),
      );
      const surf2SourceIndex = multiSourceMatrixRow?.sourceLabels.indexOf("SURF-2") ?? -1;
      const pkg1TargetIndex = multiSourceMatrixRow?.targetLabels.indexOf("PKG-1") ?? -1;

      expect(surf2SourceIndex).toBeGreaterThan(0);
      expect(pkg1TargetIndex).toBeGreaterThanOrEqual(0);
      expect(rawFacts.candidateEdges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            coverageRowId: multiSourceMatrixRow?.coverageRowId,
            fromLabel: "SURF-2",
            toLabel: "PKG-1",
            sourceOccurrenceId: multiSourceMatrixRow?.sourceOccurrenceIds[surf2SourceIndex],
            targetOccurrenceId: multiSourceMatrixRow?.targetOccurrenceIds[pkg1TargetIndex],
            relationshipHint: "traceability_matrix_coverage",
          }),
        ]),
      );
      expect(rawFacts.repeatedIds).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: "RISK-1",
            policy: "primary_with_supplemental_definition",
            roles: {
              coverage_reference: 8,
              mention: 6,
              primary_definition: 1,
              supplemental_definition: 1,
            },
          }),
          expect.objectContaining({
            label: "EVD-3",
            policy: "coverage_or_reference_only",
          }),
        ]),
      );
      expect(rawFacts.rangeReferences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: "VAL-1 through VAL-14",
            role: "coverage_range",
            resolution: {
              start: "definition_found",
              end: "definition_found",
            },
          }),
        ]),
      );
    },
  );
});

async function runExtractor(documentPath: string): Promise<TraceEvidence> {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [
      "experiments/profile-aware-graph-validation-r0/extract-trace-evidence.mjs",
      "--document",
      documentPath,
    ],
    {
      cwd: repoRoot,
      maxBuffer: 50 * 1024 * 1024,
    },
  );

  expect(stderr).toBe("");
  return JSON.parse(stdout) as TraceEvidence;
}

interface TraceEvidence {
  readonly summary: {
    readonly sectionCount: number;
    readonly tableCount: number;
    readonly traceLinkCount: number;
    readonly rawIdOccurrenceCount: number;
    readonly primaryDefinitionCount: number;
    readonly nonAuthoritativeCandidateCount: number;
    readonly entityReferenceCount: number;
    readonly rangeReferenceCount: number;
    readonly candidateEdgeCount: number;
    readonly diagnosticHintCount: number;
    readonly rawPrimaryDefinitionCount: number;
    readonly supplementalDefinitionCount: number;
    readonly coverageRowCount: number;
    readonly rawRangeReferenceCount: number;
    readonly repeatedIdCount: number;
  };
  readonly candidateTraceFacts: {
    readonly primaryDefinitions: ReadonlyArray<{
      readonly label: string;
      readonly canonicalId: string;
      readonly type: string;
    }>;
    readonly nonAuthoritativeEntityCandidates: ReadonlyArray<{
      readonly label: string;
      readonly role: string;
      readonly table?: {
        readonly columnHeader?: string;
      };
    }>;
    readonly rangeReferences: ReadonlyArray<{
      readonly label: string;
      readonly role: string;
      readonly resolution: {
        readonly start: string;
        readonly end: string;
      };
    }>;
    readonly roleClassifiedRawFacts: {
      readonly summary: {
        readonly roleCounts: Record<string, number>;
      };
      readonly classifications: ReadonlyArray<{
        readonly label: string;
        readonly role: string;
        readonly resolution: string;
        readonly section?: {
          readonly title: string;
        };
      }>;
      readonly primaryDefinitions: ReadonlyArray<{
        readonly label: string;
        readonly table?: {
          readonly columnHeader?: string;
        };
      }>;
      readonly coverageRows: ReadonlyArray<{
        readonly coverageRowId: string;
        readonly rowKind: string;
        readonly section?: {
          readonly title: string;
        };
        readonly sourceLabels: readonly string[];
        readonly targetLabels: readonly string[];
        readonly sourceOccurrenceIds: readonly string[];
        readonly targetOccurrenceIds: readonly string[];
        readonly targetRelationshipHints?: readonly string[];
      }>;
      readonly candidateEdges: ReadonlyArray<{
        readonly coverageRowId?: string;
        readonly sourceOccurrenceId: string;
        readonly fromLabel?: string;
        readonly toLabel?: string;
        readonly targetOccurrenceId?: string;
        readonly relationshipHint: string;
      }>;
      readonly repeatedIds: ReadonlyArray<{
        readonly label: string;
        readonly policy: string;
        readonly roles?: Record<string, number>;
      }>;
      readonly rangeReferences: ReadonlyArray<{
        readonly label: string;
        readonly role: string;
        readonly resolution: {
          readonly start: string;
          readonly end: string;
        };
      }>;
    };
  };
}
