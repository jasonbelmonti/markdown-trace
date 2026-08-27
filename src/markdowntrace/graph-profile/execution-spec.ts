import type {
  GraphProfile,
  GraphRelationshipRequiredPath,
} from "./model.js";
import { GRAPH_DIAGNOSTIC_RULES } from "./diagnostic-rules.js";

export { graphProfileHash } from "./serialization.js";

export const EXECUTION_SPEC_FIRST_SLICE_PROFILE: GraphProfile<
  "execution-spec",
  GraphRelationshipRequiredPath
> = {
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
    repeatedIdPolicy: {
      EVD: "terminal_coverage_node",
      OBJ: "single_primary_with_references",
      VAL: "single_primary_with_references",
      WP: "single_primary_with_references",
    },
  },
  tableRoles: [
    {
      selectorId: "exec.objective_table",
      match: { headingIncludes: [], requiredColumns: ["ID", "Work package"] },
      sourceFamilies: ["OBJ"],
      sourceColumns: ["ID"],
      targetColumns: ["Work package"],
      role: "coverage_reference",
      effects: ["create_relationships", "create_coverage_rows"],
      relationshipClass: "objective_implemented_by",
      relationshipDirection: "source-to-target",
    },
    {
      selectorId: "exec.work_package_table",
      match: { headingIncludes: [], requiredColumns: ["ID", "Validation checkpoint"] },
      sourceFamilies: ["WP"],
      sourceColumns: ["ID"],
      targetColumns: ["Validation checkpoint"],
      role: "coverage_reference",
      effects: ["create_relationships", "create_coverage_rows"],
      relationshipClass: "work_validated_by",
      relationshipDirection: "source-to-target",
    },
    {
      selectorId: "exec.validation_table",
      match: { headingIncludes: [], requiredColumns: ["ID", "Evidence"] },
      sourceFamilies: ["VAL"],
      sourceColumns: ["ID"],
      targetColumns: ["Evidence"],
      role: "coverage_reference",
      effects: ["create_relationships", "create_coverage_rows"],
      relationshipClass: "validation_supported_by",
      relationshipDirection: "source-to-target",
    },
  ],
  rangePolicy: {
    syntax: "<FAMILY>-<n> through <FAMILY>-<m>",
    sameFamilyOnly: true,
    requireDefinedEndpoints: true,
    endpointRoles: ["primary_definition", "supplemental_definition"],
    diagnosticCode: "markdown-trace.graph.invalid_range_endpoint",
  },
  matrixSemantics: {
    authority: "coverage-only",
    rowRole: "matrix_coverage",
    firstColumnMaySourceRelationships: true,
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
      sourceSelector: {
        families: ["OBJ"],
        roles: ["primary_definition"],
        excludedTableRoleIds: [],
      },
      steps: [
        { relationshipClass: "objective_implemented_by", targetFamilies: ["WP"] },
        { relationshipClass: "work_validated_by", targetFamilies: ["VAL"] },
        { relationshipClass: "validation_supported_by", targetFamilies: ["EVD"] },
      ],
      alternativeSteps: [],
      severity: "error",
      diagnosticCode: "markdown-trace.graph.missing_required_path",
    },
  ],
  diagnosticRules: GRAPH_DIAGNOSTIC_RULES,
  serialization: {
    ordering: {
      definitions: ["sourceRange.start.offset", "label"],
      coverageRows: ["sourceRange.start.offset", "sourceLabel", "coverageRowId"],
      ranges: ["sourceRange.start.offset", "expression"],
      relationships: ["sourceId", "class", "targetId"],
      diagnostics: ["sourceRanges[0].start.offset", "code", "message"],
      repairActions: ["diagnosticCode", "actionKind", "actionId"],
    },
  },
};
