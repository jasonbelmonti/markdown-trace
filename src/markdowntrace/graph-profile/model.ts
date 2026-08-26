export const GRAPH_PROFILE_SCHEMA_VERSION = "markdown-trace.graph-profile.v1";

export const GRAPH_ARTIFACT_FAMILIES = Object.freeze([
  "execution-spec",
  "execution-plan",
  "design-spec",
] as const);

export const GRAPH_RELATIONSHIP_CLASSES = Object.freeze([
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
] as const);

export const GRAPH_ID_FAMILY_POLICIES = Object.freeze([
  "primary_definition",
  "supplemental_definition",
  "terminal_coverage_node",
  "mention_only",
  "coverage_or_mention_only",
] as const);

export const GRAPH_REPEATED_ID_POLICIES = Object.freeze([
  "single_primary_with_references",
  "primary_with_supplemental_definition",
  "terminal_coverage_node",
  "coverage_or_reference_only",
  "mention_only",
  "non_authoritative_table_candidate",
] as const);

export const GRAPH_EVIDENCE_ROLES = Object.freeze([
  "primary_definition",
  "supplemental_definition",
  "coverage_reference",
  "mention",
  "table_evidence_candidate",
  "range_evidence",
  "matrix_coverage",
] as const);

export const GRAPH_TABLE_EFFECTS = Object.freeze([
  "create_relationships",
  "create_coverage_rows",
  "create_supplemental_definitions",
  "emit_diagnostics",
] as const);

export const GRAPH_DIAGNOSTIC_CODES = Object.freeze([
  "markdown-trace.graph.unresolved_reference",
  "markdown-trace.graph.duplicate_primary_definition",
  "markdown-trace.graph.invalid_range_endpoint",
  "markdown-trace.graph.missing_matrix_coverage",
  "markdown-trace.graph.missing_required_path",
  "markdown-trace.graph.profile_error",
] as const);

export const GRAPH_REPAIR_ACTION_KINDS = Object.freeze([
  "define_missing_id",
  "remove_or_replace_reference",
  "deduplicate_primary_definition",
  "define_range_endpoint",
  "narrow_range",
  "add_matrix_coverage",
  "add_required_relationship_evidence",
  "fix_graph_profile",
] as const);

export const GRAPH_RELATIONSHIP_DIRECTIONS = Object.freeze([
  "source-to-target",
  "target-to-source",
] as const);

export const GRAPH_SERIALIZATION_ORDERING_CATEGORIES = Object.freeze([
  "definitions",
  "coverageRows",
  "ranges",
  "relationships",
  "diagnostics",
  "repairActions",
] as const);

export type GraphArtifactFamily = (typeof GRAPH_ARTIFACT_FAMILIES)[number];
export type GraphRelationshipClass = (typeof GRAPH_RELATIONSHIP_CLASSES)[number];
export type GraphIdFamilyPolicy = (typeof GRAPH_ID_FAMILY_POLICIES)[number];
export type GraphRepeatedIdPolicy = (typeof GRAPH_REPEATED_ID_POLICIES)[number];
export type GraphEvidenceRole = (typeof GRAPH_EVIDENCE_ROLES)[number];
export type GraphTableEffect = (typeof GRAPH_TABLE_EFFECTS)[number];
export type GraphDiagnosticCode = (typeof GRAPH_DIAGNOSTIC_CODES)[number];
export type GraphRepairActionKind = (typeof GRAPH_REPAIR_ACTION_KINDS)[number];
export type GraphRelationshipDirection =
  (typeof GRAPH_RELATIONSHIP_DIRECTIONS)[number];
export type GraphSerializationOrderingCategory =
  (typeof GRAPH_SERIALIZATION_ORDERING_CATEGORIES)[number];

export interface GraphIdFamily {
  readonly family: string;
  readonly labelPattern: string;
  readonly policy: GraphIdFamilyPolicy;
}

export interface GraphTableMatch {
  readonly headingIncludes: readonly string[];
  readonly requiredColumns: readonly string[];
}

export interface GraphTableRole {
  readonly selectorId: string;
  readonly match: GraphTableMatch;
  readonly sourceFamilies: readonly string[];
  readonly sourceColumns: readonly string[];
  readonly targetColumns: readonly string[];
  readonly role: GraphEvidenceRole;
  readonly effects: readonly GraphTableEffect[];
  readonly relationshipClass: GraphRelationshipClass;
  readonly relationshipDirection: GraphRelationshipDirection;
}

export interface GraphRelationshipDefinition {
  readonly class: GraphRelationshipClass;
  readonly sourceFamilies: readonly string[];
  readonly targetFamilies: readonly string[];
  readonly direction: "source-to-target";
  readonly acceptedEvidenceBases: readonly string[];
}

export interface GraphRequiredPathStep {
  readonly relationshipClass: GraphRelationshipClass;
  readonly targetFamilies: readonly string[];
}

export interface GraphRequiredPathSourceSelector {
  readonly families: readonly string[];
  readonly roles: readonly GraphEvidenceRole[];
  readonly excludedTableRoleIds: readonly string[];
}

interface GraphRequiredPathBase {
  readonly pathId: string;
  readonly sourceFamilies: readonly string[];
  readonly sourceSelector: GraphRequiredPathSourceSelector;
  readonly severity: "error";
}

export interface GraphRelationshipRequiredPath extends GraphRequiredPathBase {
  readonly steps: readonly GraphRequiredPathStep[];
  readonly alternativeSteps: readonly (readonly GraphRequiredPathStep[])[];
  readonly diagnosticCode: "markdown-trace.graph.missing_required_path";
}

export interface GraphMatrixCoverageRequirement {
  readonly sourceFamilies: readonly string[];
  readonly requiredTargetFamilies: readonly string[];
}

export interface GraphMatrixCoverageRequiredPath extends GraphRequiredPathBase {
  readonly steps: readonly [];
  readonly alternativeSteps: readonly [];
  readonly rowRequirements: readonly GraphMatrixCoverageRequirement[];
  readonly diagnosticCode: "markdown-trace.graph.missing_matrix_coverage";
}

export type GraphRequiredPath =
  | GraphRelationshipRequiredPath
  | GraphMatrixCoverageRequiredPath;

export interface GraphDiagnosticRule {
  readonly code: GraphDiagnosticCode;
  readonly severity: "error";
  readonly blocking: true;
  readonly repairActionKinds: readonly GraphRepairActionKind[];
}

export interface GraphProfile<
  TArtifactFamily extends GraphArtifactFamily = "execution-spec",
  TRequiredPath extends GraphRequiredPath = GraphRequiredPath,
> {
  readonly schemaVersion: typeof GRAPH_PROFILE_SCHEMA_VERSION;
  readonly profileId: string;
  readonly artifactFamily: TArtifactFamily;
  readonly profileVersion: string;
  readonly idFamilies: readonly GraphIdFamily[];
  readonly definitionPolicies: {
    readonly primaryColumns: readonly string[];
    readonly supplementalColumns: readonly string[];
    readonly repeatedIdPolicy: Readonly<Record<string, GraphRepeatedIdPolicy>>;
  };
  readonly tableRoles: readonly GraphTableRole[];
  readonly rangePolicy: {
    readonly syntax: "<FAMILY>-<n> through <FAMILY>-<m>";
    readonly sameFamilyOnly: true;
    readonly requireDefinedEndpoints: true;
    readonly endpointRoles: readonly ("primary_definition" | "supplemental_definition")[];
    readonly diagnosticCode: "markdown-trace.graph.invalid_range_endpoint";
  };
  readonly matrixSemantics: {
    readonly authority: "coverage-only";
    readonly rowRole: "matrix_coverage";
    readonly firstColumnMaySourceRelationships: true;
    readonly definitionsFromCells: false;
  };
  readonly relationshipClasses: readonly GraphRelationshipDefinition[];
  readonly requiredPaths: readonly TRequiredPath[];
  readonly diagnosticRules: readonly GraphDiagnosticRule[];
  readonly serialization: {
    readonly ordering: Readonly<
      Record<GraphSerializationOrderingCategory, readonly string[]>
    >;
  };
}
