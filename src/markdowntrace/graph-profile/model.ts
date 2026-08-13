export type GraphArtifactFamily = "execution-spec";

export type GraphRelationshipClass =
  | "objective_implemented_by"
  | "work_validated_by"
  | "validation_supported_by";

export type GraphIdFamilyPolicy = "primary_definition" | "terminal_coverage_node";

export interface GraphIdFamily {
  readonly family: string;
  readonly labelPattern: string;
  readonly policy: GraphIdFamilyPolicy;
}

export interface GraphTableRole {
  readonly selectorId: string;
  readonly sourceFamilies: readonly string[];
  readonly sourceColumns: readonly string[];
  readonly targetColumns: readonly string[];
  readonly relationshipClass: GraphRelationshipClass;
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

export interface GraphRequiredPath {
  readonly pathId: string;
  readonly sourceFamilies: readonly string[];
  readonly steps: readonly GraphRequiredPathStep[];
  readonly severity: "error";
  readonly diagnosticCode: "markdown-trace.graph.missing_required_path";
}

export interface GraphDiagnosticRule {
  readonly code: "markdown-trace.graph.missing_required_path";
  readonly severity: "error";
  readonly blocking: true;
  readonly repairActionKind: "add_required_relationship_evidence";
}

export interface GraphProfile {
  readonly schemaVersion: "markdown-trace.graph-profile.v1";
  readonly profileId: string;
  readonly artifactFamily: GraphArtifactFamily;
  readonly profileVersion: string;
  readonly idFamilies: readonly GraphIdFamily[];
  readonly definitionPolicies: {
    readonly primaryColumns: readonly string[];
    readonly supplementalColumns: readonly string[];
    readonly repeatedIdPolicy: "single_primary_with_references";
  };
  readonly tableRoles: readonly GraphTableRole[];
  readonly rangePolicy: {
    readonly sameFamilyOnly: true;
    readonly requireDefinedEndpoints: true;
  };
  readonly matrixSemantics: {
    readonly authority: "coverage-only";
    readonly definitionsFromCells: false;
  };
  readonly relationshipClasses: readonly GraphRelationshipDefinition[];
  readonly requiredPaths: readonly GraphRequiredPath[];
  readonly diagnosticRules: readonly GraphDiagnosticRule[];
  readonly serialization: {
    readonly definitionSortKeys: readonly string[];
    readonly relationshipSortKeys: readonly string[];
    readonly diagnosticSortKeys: readonly string[];
  };
}
