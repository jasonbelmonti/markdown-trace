import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
      candidateEdgeCount: 5,
      diagnosticHintCount: 3,
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
  });
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
      maxBuffer: 1024 * 1024,
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
  };
}
