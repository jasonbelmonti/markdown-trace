import { describe, expect, it } from "vitest";

import {
  EXECUTION_SPEC_FIRST_SLICE_PROFILE,
  GRAPH_PROFILE_ERROR_CODE,
  graphProfileError,
  graphProfileHash,
  type GraphProfileResult,
} from "../src/markdowntrace/graph-profile/index.js";
import {
  GRAPH_ARTIFACT_FAMILIES,
  GRAPH_DIAGNOSTIC_CODES,
  GRAPH_EVIDENCE_ROLES,
  GRAPH_ID_FAMILY_POLICIES,
  GRAPH_PROFILE_SCHEMA_VERSION,
  GRAPH_RELATIONSHIP_CLASSES,
  GRAPH_RELATIONSHIP_DIRECTIONS,
  GRAPH_REPAIR_ACTION_KINDS,
  GRAPH_REPEATED_ID_POLICIES,
  GRAPH_SERIALIZATION_ORDERING_CATEGORIES,
  GRAPH_TABLE_EFFECTS,
  type GraphArtifactFamily,
  type GraphProfile,
  type GraphRequiredPath,
} from "../src/markdowntrace/graph-profile/model.js";

describe("graph profile model contract", () => {
  it("freezes the complete R2 token inventories", () => {
    expect(GRAPH_ARTIFACT_FAMILIES).toEqual([
      "execution-spec",
      "execution-plan",
      "design-spec",
    ]);
    expect(GRAPH_ID_FAMILY_POLICIES).toEqual([
      "primary_definition",
      "supplemental_definition",
      "terminal_coverage_node",
      "mention_only",
      "coverage_or_mention_only",
    ]);
    expect(GRAPH_REPEATED_ID_POLICIES).toEqual([
      "single_primary_with_references",
      "primary_with_supplemental_definition",
      "terminal_coverage_node",
      "coverage_or_reference_only",
      "mention_only",
      "non_authoritative_table_candidate",
    ]);
    expect(GRAPH_EVIDENCE_ROLES).toEqual([
      "primary_definition",
      "supplemental_definition",
      "coverage_reference",
      "mention",
      "table_evidence_candidate",
      "range_evidence",
      "matrix_coverage",
    ]);
    expect(GRAPH_TABLE_EFFECTS).toEqual([
      "create_relationships",
      "create_coverage_rows",
      "create_supplemental_definitions",
      "emit_diagnostics",
    ]);
    expect(GRAPH_RELATIONSHIP_DIRECTIONS).toEqual([
      "source-to-target",
      "target-to-source",
    ]);
    expect(GRAPH_RELATIONSHIP_CLASSES).toEqual([
      "objective_implemented_by",
      "work_validated_by",
      "validation_supported_by",
      "execution_plan_source_anchors_outcome",
      "execution_plan_outcome_implemented_by_action",
      "execution_plan_outcome_validated_by_gate",
      "objective_supported_by_evidence",
      "requirement_realized_by_behavior",
      "behavior_allocated_to_mechanism",
      "requirement_accepted_by",
      "behavior_accepted_by",
      "requirement_validated_by",
      "mechanism_verified_by",
      "matrix_coverage",
      "coverage_range",
    ]);
    expect(GRAPH_DIAGNOSTIC_CODES).toEqual([
      "markdown-trace.graph.unresolved_reference",
      "markdown-trace.graph.duplicate_primary_definition",
      "markdown-trace.graph.invalid_range_endpoint",
      "markdown-trace.graph.missing_matrix_coverage",
      "markdown-trace.graph.missing_required_path",
      "markdown-trace.graph.profile_error",
    ]);
    expect(GRAPH_REPAIR_ACTION_KINDS).toEqual([
      "define_missing_id",
      "remove_or_replace_reference",
      "deduplicate_primary_definition",
      "define_range_endpoint",
      "narrow_range",
      "add_matrix_coverage",
      "add_required_relationship_evidence",
      "fix_graph_profile",
    ]);
    expect(GRAPH_SERIALIZATION_ORDERING_CATEGORIES).toEqual([
      "definitions",
      "coverageRows",
      "ranges",
      "relationships",
      "diagnostics",
      "repairActions",
    ]);

    for (const inventory of [
      GRAPH_ARTIFACT_FAMILIES,
      GRAPH_ID_FAMILY_POLICIES,
      GRAPH_REPEATED_ID_POLICIES,
      GRAPH_EVIDENCE_ROLES,
      GRAPH_TABLE_EFFECTS,
      GRAPH_RELATIONSHIP_DIRECTIONS,
      GRAPH_RELATIONSHIP_CLASSES,
      GRAPH_DIAGNOSTIC_CODES,
      GRAPH_REPAIR_ACTION_KINDS,
      GRAPH_SERIALIZATION_ORDERING_CATEGORIES,
    ]) {
      expect(Object.isFrozen(inventory)).toBe(true);
    }

    const supportedFamilies: readonly GraphArtifactFamily[] = GRAPH_ARTIFACT_FAMILIES;
    expect(supportedFamilies).toHaveLength(3);
  });

  it("represents every required profile policy and ordering category", () => {
    const profile = EXECUTION_SPEC_FIRST_SLICE_PROFILE;

    expect(profile.schemaVersion).toBe(GRAPH_PROFILE_SCHEMA_VERSION);
    expect(profile.definitionPolicies.repeatedIdPolicy).toEqual({
      EVD: "terminal_coverage_node",
      OBJ: "single_primary_with_references",
      VAL: "single_primary_with_references",
      WP: "single_primary_with_references",
    });
    expect(profile.tableRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          match: expect.objectContaining({ requiredColumns: ["ID", "Work package"] }),
          role: "coverage_reference",
          effects: ["create_relationships", "create_coverage_rows"],
          relationshipDirection: "source-to-target",
        }),
      ]),
    );
    expect(profile.rangePolicy).toEqual({
      syntax: "<FAMILY>-<n> through <FAMILY>-<m>",
      sameFamilyOnly: true,
      requireDefinedEndpoints: true,
      endpointRoles: ["primary_definition", "supplemental_definition"],
      diagnosticCode: "markdown-trace.graph.invalid_range_endpoint",
    });
    expect(profile.matrixSemantics).toEqual({
      authority: "coverage-only",
      rowRole: "matrix_coverage",
      firstColumnMaySourceRelationships: true,
      definitionsFromCells: false,
    });
    expect(profile.diagnosticRules.map(({ code }) => code)).toEqual(
      GRAPH_DIAGNOSTIC_CODES,
    );
    expect(Object.keys(profile.serialization.ordering)).toEqual(
      GRAPH_SERIALIZATION_ORDERING_CATEGORIES,
    );
  });

  it("exposes immutable profile-error diagnostics and discriminated results", () => {
    const diagnostic = graphProfileError("schema", "profile is invalid", {
      profileRuleId: "graph-profile.schema.root",
      source: "profile.yaml",
    });
    const failure: GraphProfileResult = Object.freeze({
      ok: false,
      diagnostics: Object.freeze([diagnostic]),
    });
    const success: GraphProfileResult = Object.freeze({
      ok: true,
      profile: EXECUTION_SPEC_FIRST_SLICE_PROFILE,
    });

    expect(diagnostic).toEqual({
      code: GRAPH_PROFILE_ERROR_CODE,
      severity: "error",
      message: "profile is invalid",
      profileRuleId: "graph-profile.schema.root",
      affectedIds: [],
      blocking: true,
      repairActionKind: "fix_graph_profile",
      stage: "schema",
      source: "profile.yaml",
    });
    expect(Object.isFrozen(diagnostic)).toBe(true);
    expect(Object.isFrozen(diagnostic.affectedIds)).toBe(true);
    expect(Object.isFrozen(failure)).toBe(true);
    expect(Object.isFrozen(failure.ok ? [] : failure.diagnostics)).toBe(true);
    expect(success.ok).toBe(true);
    expect(failure.ok).toBe(false);
  });

  it("represents the R2 execution matrix row minimum", () => {
    const matrixCoverageDiagnostic: GraphRequiredPath["diagnosticCode"] =
      "markdown-trace.graph.missing_matrix_coverage";
    const matrixRowMinimum: GraphRequiredPath = {
      pathId: "exec.matrix_row_minimum",
      sourceFamilies: ["OBJ", "WP"],
      sourceSelector: {
        families: ["OBJ", "WP"],
        roles: ["matrix_coverage"],
        excludedTableRoleIds: [],
      },
      steps: [],
      alternativeSteps: [],
      rowRequirements: [
        {
          sourceFamilies: ["OBJ"],
          requiredTargetFamilies: ["WP", "VAL", "EVD"],
        },
        {
          sourceFamilies: ["WP"],
          requiredTargetFamilies: ["VAL", "EVD"],
        },
      ],
      severity: "error",
      diagnosticCode: matrixCoverageDiagnostic,
    };
    const profileWithMatrixCoverage: GraphProfile = {
      ...EXECUTION_SPEC_FIRST_SLICE_PROFILE,
      requiredPaths: [...EXECUTION_SPEC_FIRST_SLICE_PROFILE.requiredPaths, matrixRowMinimum],
    };

    expect(profileWithMatrixCoverage.requiredPaths.at(-1)).toMatchObject({
      pathId: "exec.matrix_row_minimum",
      diagnosticCode: "markdown-trace.graph.missing_matrix_coverage",
      rowRequirements: [
        { sourceFamilies: ["OBJ"], requiredTargetFamilies: ["WP", "VAL", "EVD"] },
        { sourceFamilies: ["WP"], requiredTargetFamilies: ["VAL", "EVD"] },
      ],
    });
  });

  it("preserves the WP-1 profile export and deterministic hash behavior", () => {
    const firstHash = graphProfileHash(EXECUTION_SPEC_FIRST_SLICE_PROFILE);
    const clonedHash = graphProfileHash(structuredClone(EXECUTION_SPEC_FIRST_SLICE_PROFILE));

    expect(EXECUTION_SPEC_FIRST_SLICE_PROFILE).toMatchObject({
      profileId: "markdown-trace.execution-spec.first-slice",
      artifactFamily: "execution-spec",
      profileVersion: "1.0.0",
    });
    expect(firstHash).toHaveLength(64);
    expect(clonedHash).toBe(firstHash);
  });
});
