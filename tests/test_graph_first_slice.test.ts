import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { EXECUTION_SPEC_FIRST_SLICE_PROFILE } from "../src/markdowntrace/graph-profile/index.js";
import { validateGraphEvidence } from "../src/markdowntrace/graph-validation/index.js";
import { extractTraceEvidenceFromFile } from "../src/markdowntrace/trace-evidence/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(
  repoRoot,
  "fixtures/profile-aware-graph-validation/first-slice",
);
const positiveFixture = path.join(fixtureRoot, "positive-execution-spec.md");
const missingPathFixture = path.join(fixtureRoot, "missing-required-path.md");

describe("WP-1 profile-aware graph proving slice", () => {
  it("proves one OBJ to WP to VAL to EVD path without registry authority", async () => {
    const evidence = await extractTraceEvidenceFromFile(
      positiveFixture,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );
    const result = validateGraphEvidence(evidence, EXECUTION_SPEC_FIRST_SLICE_PROFILE);

    expect(evidence).toMatchObject({
      schemaVersion: "markdown-trace.trace-evidence.v1",
      authority: "trace-evidence",
      profile: {
        profileId: "markdown-trace.execution-spec.first-slice",
        artifactFamily: "execution-spec",
      },
    });
    expect(evidence.definitions.map((definition) => definition.label)).toEqual([
      "OBJ-1",
      "WP-1",
      "VAL-1",
    ]);
    expect(evidence.mentions).toEqual([
      expect.objectContaining({
        label: "EVD-1",
        role: "terminal_coverage_node",
      }),
    ]);
    expect(result.schemaVersion).toBe("markdown-trace.graph-validation-result.v1");
    expect(result.status).toBe("pass");
    expect(result.diagnostics).toEqual([]);
    expect(result.requiredPathResults).toEqual([
      {
        pathId: "exec.objective_to_evidence",
        sourceId: "OBJ-1",
        status: "satisfied",
        nodeIds: ["OBJ-1", "WP-1", "VAL-1", "EVD-1"],
        relationshipClasses: [
          "objective_implemented_by",
          "work_validated_by",
          "validation_supported_by",
        ],
      },
    ]);
    expect(result.relationships).toEqual([
      expect.objectContaining({
        class: "objective_implemented_by",
        sourceId: "OBJ-1",
        targetId: "WP-1",
      }),
      expect.objectContaining({
        class: "validation_supported_by",
        sourceId: "VAL-1",
        targetId: "EVD-1",
      }),
      expect.objectContaining({
        class: "work_validated_by",
        sourceId: "WP-1",
        targetId: "VAL-1",
      }),
    ]);
  });

  it("emits the stable source-backed diagnostic for a missing terminal evidence path", async () => {
    const evidence = await extractTraceEvidenceFromFile(
      missingPathFixture,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );
    const result = validateGraphEvidence(evidence, EXECUTION_SPEC_FIRST_SLICE_PROFILE);

    expect(result.status).toBe("fail");
    expect(result.requiredPathResults).toEqual([
      {
        pathId: "exec.objective_to_evidence",
        sourceId: "OBJ-1",
        status: "missing",
        nodeIds: ["OBJ-1", "WP-1", "VAL-1"],
        relationshipClasses: ["objective_implemented_by", "work_validated_by"],
        missingRelationshipClass: "validation_supported_by",
      },
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "markdown-trace.graph.missing_required_path",
        severity: "error",
        profileRuleId: "exec.objective_to_evidence",
        affectedIds: ["OBJ-1", "WP-1", "VAL-1"],
        blocking: true,
      }),
    ]);
    expect(result.diagnostics[0]?.sourceRanges.map((range) => range.start.line)).toEqual([
      7, 13, 19,
    ]);
  });

  it("is deterministic and does not mutate either source fixture", async () => {
    const before = await fixtureHashes();
    const firstEvidence = await extractTraceEvidenceFromFile(
      positiveFixture,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );
    const secondEvidence = await extractTraceEvidenceFromFile(
      positiveFixture,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );
    const firstResult = validateGraphEvidence(
      firstEvidence,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );
    const secondResult = validateGraphEvidence(
      secondEvidence,
      EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    );

    expect(JSON.stringify(secondEvidence)).toBe(JSON.stringify(firstEvidence));
    expect(JSON.stringify(secondResult)).toBe(JSON.stringify(firstResult));
    expect(await fixtureHashes()).toEqual(before);
  });
});

async function fixtureHashes(): Promise<readonly string[]> {
  return Promise.all(
    [positiveFixture, missingPathFixture].map(async (fixturePath) =>
      createHash("sha256").update(await readFile(fixturePath)).digest("hex"),
    ),
  );
}
