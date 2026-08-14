import { createHash } from "node:crypto";

import type { GraphProfile } from "./model.js";

export const EXECUTION_SPEC_FIRST_SLICE_PROFILE: GraphProfile = {
  schemaVersion: "markdown-trace.graph-profile.v1",
  profileId: "markdown-trace.execution-spec.first-slice",
  artifactFamily: "execution-spec",
  profileVersion: "1.0.0",
  idFamilies: [
    { family: "OBJ", labelPattern: "^OBJ-[0-9]+$", policy: "primary_definition" },
    { family: "WP", labelPattern: "^WP-[0-9]+$", policy: "primary_definition" },
    { family: "VAL", labelPattern: "^VAL-[0-9]+$", policy: "primary_definition" },
    { family: "EVD", labelPattern: "^EVD-[0-9]+$", policy: "terminal_coverage_node" },
  ],
  definitionPolicies: {
    primaryColumns: ["ID"],
    supplementalColumns: [],
    repeatedIdPolicy: "single_primary_with_references",
  },
  tableRoles: [
    {
      selectorId: "exec.objective_table",
      sourceFamilies: ["OBJ"],
      sourceColumns: ["ID"],
      targetColumns: ["Work package"],
      relationshipClass: "objective_implemented_by",
    },
    {
      selectorId: "exec.work_package_table",
      sourceFamilies: ["WP"],
      sourceColumns: ["ID"],
      targetColumns: ["Validation checkpoint"],
      relationshipClass: "work_validated_by",
    },
    {
      selectorId: "exec.validation_table",
      sourceFamilies: ["VAL"],
      sourceColumns: ["ID"],
      targetColumns: ["Evidence"],
      relationshipClass: "validation_supported_by",
    },
  ],
  rangePolicy: {
    sameFamilyOnly: true,
    requireDefinedEndpoints: true,
  },
  matrixSemantics: {
    authority: "coverage-only",
    definitionsFromCells: false,
  },
  relationshipClasses: [
    {
      class: "objective_implemented_by",
      sourceFamilies: ["OBJ"],
      targetFamilies: ["WP"],
      direction: "source-to-target",
      acceptedEvidenceBases: ["objective row"],
    },
    {
      class: "work_validated_by",
      sourceFamilies: ["WP"],
      targetFamilies: ["VAL"],
      direction: "source-to-target",
      acceptedEvidenceBases: ["work-package validation checkpoint cell"],
    },
    {
      class: "validation_supported_by",
      sourceFamilies: ["VAL"],
      targetFamilies: ["EVD"],
      direction: "source-to-target",
      acceptedEvidenceBases: ["validation evidence cell"],
    },
  ],
  requiredPaths: [
    {
      pathId: "exec.objective_to_evidence",
      sourceFamilies: ["OBJ"],
      steps: [
        { relationshipClass: "objective_implemented_by", targetFamilies: ["WP"] },
        { relationshipClass: "work_validated_by", targetFamilies: ["VAL"] },
        { relationshipClass: "validation_supported_by", targetFamilies: ["EVD"] },
      ],
      severity: "error",
      diagnosticCode: "markdown-trace.graph.missing_required_path",
    },
  ],
  diagnosticRules: [
    {
      code: "markdown-trace.graph.missing_required_path",
      severity: "error",
      blocking: true,
      repairActionKind: "add_required_relationship_evidence",
    },
  ],
  serialization: {
    definitionSortKeys: ["sourceRange.start.offset", "label"],
    relationshipSortKeys: ["sourceId", "class", "targetId"],
    diagnosticSortKeys: ["sourceRanges[0].start.offset", "code", "message"],
  },
};

export function graphProfileHash(profile: GraphProfile): string {
  return createHash("sha256").update(JSON.stringify(profile)).digest("hex");
}
