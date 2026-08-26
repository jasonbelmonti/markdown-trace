import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXECUTION_PLAN_PROFILE,
  EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  graphProfileHash,
  validateGraphProfile,
} from "../src/markdowntrace/graph-profile/index.js";
import { validateGraphEvidence } from "../src/markdowntrace/graph-validation/index.js";
import { extractTraceEvidenceFromFile } from "../src/markdowntrace/trace-evidence/index.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(
  repoRoot,
  "fixtures/profile-aware-graph-validation/execution-plan",
);
const positiveFixture = path.join(fixtureRoot, "positive-execution-plan.md");
const missingGateFixture = path.join(fixtureRoot, "missing-validation-gate.md");

describe("Execution Plan graph profile", () => {
  it("declares the immutable, schema-specific profile contract", () => {
    const validation = validateGraphProfile(EXECUTION_PLAN_PROFILE);

    expect(validation.ok).toBe(true);
    expect(EXECUTION_PLAN_PROFILE).toMatchObject({
      profileId: "markdown-trace.execution-plan.core",
      artifactFamily: "execution-plan",
      profileVersion: "1.0.0",
      idFamilies: [
        { family: "EP-SRC", labelPattern: "^EP-SRC-[A-Z0-9]+$" },
        { family: "EP-OUT", labelPattern: "^EP-OUT-[A-Z0-9]+$" },
        { family: "EP-FIND", labelPattern: "^EP-FIND-[A-Z0-9]+$" },
        { family: "EP-PRE", labelPattern: "^EP-PRE-[A-Z0-9]+$" },
        { family: "EP-DEC", labelPattern: "^EP-DEC-[A-Z0-9]+$" },
        { family: "EP-PH", labelPattern: "^EP-PH-[A-Z0-9]+$" },
        { family: "EP-ACT", labelPattern: "^EP-ACT-[A-Z0-9]+$" },
        { family: "EP-GATE", labelPattern: "^EP-GATE-[A-Z0-9]+$" },
        { family: "EP-RESP", labelPattern: "^EP-RESP-[A-Z0-9]+$" },
        { family: "EP-TRIG", labelPattern: "^EP-TRIG-[A-Z0-9]+$" },
      ],
      definitionPolicies: {
        primaryColumns: [
          "Source ID",
          "Outcome ID",
          "Finding ID",
          "Precondition ID",
          "Decision ID",
          "Phase ID",
          "Action ID",
          "Gate ID",
          "Response ID",
          "Trigger ID",
        ],
        supplementalColumns: [],
      },
      relationshipClasses: [
        {
          class: "execution_plan_source_anchors_outcome",
          sourceFamilies: ["EP-SRC"],
          targetFamilies: ["EP-OUT"],
        },
        {
          class: "execution_plan_outcome_implemented_by_action",
          sourceFamilies: ["EP-OUT"],
          targetFamilies: ["EP-ACT"],
        },
        {
          class: "execution_plan_outcome_validated_by_gate",
          sourceFamilies: ["EP-OUT"],
          targetFamilies: ["EP-GATE"],
        },
      ],
    });
    expect(EXECUTION_PLAN_PROFILE.tableRoles.map(({ match, relationshipClass }) => ({
      requiredColumns: match.requiredColumns,
      relationshipClass,
    }))).toEqual([
      {
        requiredColumns: ["Outcome ID", "Source IDs"],
        relationshipClass: "execution_plan_source_anchors_outcome",
      },
      {
        requiredColumns: ["Action ID", "Outcome IDs"],
        relationshipClass: "execution_plan_outcome_implemented_by_action",
      },
      {
        requiredColumns: ["Gate ID", "Outcome IDs"],
        relationshipClass: "execution_plan_outcome_validated_by_gate",
      },
    ]);
    expect(EXECUTION_PLAN_PROFILE.requiredPaths).toEqual([
      expect.objectContaining({
        pathId: "execution-plan.source-to-action",
        sourceFamilies: ["EP-SRC"],
        steps: [
          {
            relationshipClass: "execution_plan_source_anchors_outcome",
            targetFamilies: ["EP-OUT"],
          },
          {
            relationshipClass: "execution_plan_outcome_implemented_by_action",
            targetFamilies: ["EP-ACT"],
          },
        ],
      }),
      expect.objectContaining({
        pathId: "execution-plan.source-to-gate",
        sourceFamilies: ["EP-SRC"],
        steps: [
          {
            relationshipClass: "execution_plan_source_anchors_outcome",
            targetFamilies: ["EP-OUT"],
          },
          {
            relationshipClass: "execution_plan_outcome_validated_by_gate",
            targetFamilies: ["EP-GATE"],
          },
        ],
      }),
    ]);
    expect(EXECUTION_PLAN_PROFILE.diagnosticRules).toBe(
      EXECUTION_SPEC_FIRST_SLICE_PROFILE.diagnosticRules,
    );
    expect(Object.isFrozen(EXECUTION_PLAN_PROFILE)).toBe(true);
    expect(Object.isFrozen(EXECUTION_PLAN_PROFILE.idFamilies)).toBe(true);
    expect(Object.isFrozen(EXECUTION_PLAN_PROFILE.idFamilies[0])).toBe(true);
    expect(graphProfileHash(structuredClone(EXECUTION_PLAN_PROFILE))).toBe(
      graphProfileHash(EXECUTION_PLAN_PROFILE),
    );
  });

  it("proves source-to-action and source-to-gate paths through the public APIs", async () => {
    const evidence = await extractTraceEvidenceFromFile(
      positiveFixture,
      EXECUTION_PLAN_PROFILE,
    );
    const result = validateGraphEvidence(evidence, EXECUTION_PLAN_PROFILE);

    expect(evidence.profile).toMatchObject({
      profileId: "markdown-trace.execution-plan.core",
      artifactFamily: "execution-plan",
    });
    expect(evidence.definitions.map(({ label, family }) => ({ label, family }))).toEqual([
      { label: "EP-SRC-1", family: "EP-SRC" },
      { label: "EP-OUT-1", family: "EP-OUT" },
      { label: "EP-ACT-1", family: "EP-ACT" },
      { label: "EP-GATE-1", family: "EP-GATE" },
    ]);
    expect(result.status).toBe("pass");
    expect(result.diagnostics).toEqual([]);
    expect(result.requiredPathResults).toEqual([
      {
        pathId: "execution-plan.source-to-action",
        sourceId: "EP-SRC-1",
        status: "satisfied",
        nodeIds: ["EP-SRC-1", "EP-OUT-1", "EP-ACT-1"],
        relationshipClasses: [
          "execution_plan_source_anchors_outcome",
          "execution_plan_outcome_implemented_by_action",
        ],
      },
      {
        pathId: "execution-plan.source-to-gate",
        sourceId: "EP-SRC-1",
        status: "satisfied",
        nodeIds: ["EP-SRC-1", "EP-OUT-1", "EP-GATE-1"],
        relationshipClasses: [
          "execution_plan_source_anchors_outcome",
          "execution_plan_outcome_validated_by_gate",
        ],
      },
    ]);
    expect(result.relationships.map(({ class: relationshipClass, sourceId, targetId }) => ({
      relationshipClass,
      sourceId,
      targetId,
    }))).toEqual([
      {
        relationshipClass: "execution_plan_outcome_implemented_by_action",
        sourceId: "EP-OUT-1",
        targetId: "EP-ACT-1",
      },
      {
        relationshipClass: "execution_plan_outcome_validated_by_gate",
        sourceId: "EP-OUT-1",
        targetId: "EP-GATE-1",
      },
      {
        relationshipClass: "execution_plan_source_anchors_outcome",
        sourceId: "EP-SRC-1",
        targetId: "EP-OUT-1",
      },
    ]);
  });

  it("isolates a missing validation-gate link while preserving the action path", async () => {
    const evidence = await extractTraceEvidenceFromFile(
      missingGateFixture,
      EXECUTION_PLAN_PROFILE,
    );
    const result = validateGraphEvidence(evidence, EXECUTION_PLAN_PROFILE);

    expect(result.status).toBe("fail");
    expect(result.requiredPathResults).toEqual([
      {
        pathId: "execution-plan.source-to-action",
        sourceId: "EP-SRC-1",
        status: "satisfied",
        nodeIds: ["EP-SRC-1", "EP-OUT-1", "EP-ACT-1"],
        relationshipClasses: [
          "execution_plan_source_anchors_outcome",
          "execution_plan_outcome_implemented_by_action",
        ],
      },
      {
        pathId: "execution-plan.source-to-gate",
        sourceId: "EP-SRC-1",
        status: "missing",
        nodeIds: ["EP-SRC-1", "EP-OUT-1"],
        relationshipClasses: ["execution_plan_source_anchors_outcome"],
        missingRelationshipClass: "execution_plan_outcome_validated_by_gate",
      },
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: "markdown-trace.graph.missing_required_path",
        severity: "error",
        profileRuleId: "execution-plan.source-to-gate",
        affectedIds: ["EP-SRC-1", "EP-OUT-1"],
        blocking: true,
      }),
    ]);
    expect(result.diagnostics[0]?.sourceRanges.map((range) => range.start.line)).toEqual([
      7, 13,
    ]);
  });

  it("is deterministic and does not mutate either source fixture", async () => {
    const before = await fixtureHashes();

    for (const fixturePath of [positiveFixture, missingGateFixture]) {
      const firstEvidence = await extractTraceEvidenceFromFile(
        fixturePath,
        EXECUTION_PLAN_PROFILE,
      );
      const secondEvidence = await extractTraceEvidenceFromFile(
        fixturePath,
        EXECUTION_PLAN_PROFILE,
      );
      const firstResult = validateGraphEvidence(firstEvidence, EXECUTION_PLAN_PROFILE);
      const secondResult = validateGraphEvidence(secondEvidence, EXECUTION_PLAN_PROFILE);

      expect(JSON.stringify(secondEvidence)).toBe(JSON.stringify(firstEvidence));
      expect(JSON.stringify(secondResult)).toBe(JSON.stringify(firstResult));
    }

    expect(await fixtureHashes()).toEqual(before);
  });
});

async function fixtureHashes(): Promise<readonly string[]> {
  return Promise.all(
    [positiveFixture, missingGateFixture].map(async (fixturePath) =>
      createHash("sha256").update(await readFile(fixturePath)).digest("hex"),
    ),
  );
}
