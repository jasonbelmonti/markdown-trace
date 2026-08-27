import { validateGraphDocument as runGraphValidation } from "./graph-validation/run.js";

export interface ValidateGraphDocumentOptions {
  readonly documentPath: string;
  readonly profilePath: string;
  readonly cwd?: string;
}

export function validateGraphDocument(
  options: ValidateGraphDocumentOptions,
): Promise<GraphValidationRunResult> {
  return runGraphValidation(options);
}

export interface GraphValidationSourcePosition {
  readonly line: number;
  readonly column: number;
  readonly offset?: number;
}

export interface GraphValidationSourceRange {
  readonly start: GraphValidationSourcePosition;
  readonly end: GraphValidationSourcePosition;
}

export type GraphArtifactFamily =
  | "execution-spec"
  | "execution-plan"
  | "design-spec";

export type GraphValidationRelationshipClass =
  | "objective_implemented_by"
  | "work_validated_by"
  | "validation_supported_by"
  | "execution_plan_source_anchors_outcome"
  | "execution_plan_outcome_implemented_by_action"
  | "execution_plan_outcome_validated_by_gate"
  | "objective_supported_by_evidence"
  | "requirement_realized_by_behavior"
  | "behavior_allocated_to_mechanism"
  | "requirement_accepted_by"
  | "behavior_accepted_by"
  | "requirement_validated_by"
  | "mechanism_verified_by"
  | "matrix_coverage"
  | "coverage_range";

export interface GraphValidationEvidenceAnchor {
  readonly tableTargetId: string;
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly columnHeader: string;
  readonly sourceRange?: GraphValidationSourceRange;
}

export interface GraphValidationSourceDescriptor {
  readonly path: string;
  readonly sha256: string | null;
  readonly lineCount: number | null;
}

export interface GraphValidationProfileDescriptor {
  readonly path: string;
  readonly profileId: string | null;
  readonly artifactFamily: GraphArtifactFamily | null;
  readonly profileVersion: string | null;
  readonly sha256: string | null;
}

export interface GraphValidationRuntimeMetadata {
  readonly packageVersion: "0.1.0";
  readonly markdownEngineVersion: "2.0.0";
  readonly runtimeVersion: string;
}

export interface GraphValidationNode {
  readonly id: string;
  readonly family: string;
  readonly authority: "trace-evidence";
  readonly role: "primary_definition" | "terminal_coverage_node";
  readonly sourceRange?: GraphValidationSourceRange;
}

export interface GraphValidationRelationship {
  readonly class: GraphValidationRelationshipClass;
  readonly sourceId: string;
  readonly targetId: string;
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly rawEvidenceAnchors: readonly GraphValidationEvidenceAnchor[];
}

export interface RequiredPathResult {
  readonly pathId: string;
  readonly sourceId: string;
  readonly status: "satisfied" | "missing";
  readonly nodeIds: readonly string[];
  readonly relationshipClasses: readonly GraphValidationRelationshipClass[];
  readonly missingRelationshipClass?: GraphValidationRelationshipClass;
}

export interface GraphDiagnostic {
  readonly code: "markdown-trace.graph.missing_required_path";
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly blocking: true;
}

export type GraphValidationOperationalStage =
  | "profile-load"
  | "profile-compatibility"
  | "document-read"
  | "evidence-extraction";

export interface GraphValidationOperationalDiagnostic {
  readonly code:
    | "markdown-trace.graph.profile_error"
    | "markdown-trace.graph.operational_error";
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly sourceRanges: readonly GraphValidationSourceRange[];
  readonly blocking: true;
  readonly stage: GraphValidationOperationalStage;
  readonly source?: string;
}

export interface GraphValidationSummary {
  readonly nodes: number;
  readonly relationships: number;
  readonly requiredPaths: number;
  readonly satisfiedRequiredPaths: number;
  readonly diagnostics: number;
}

export interface GraphValidationHashes {
  readonly sourceSha256: string | null;
  readonly profileSha256: string | null;
  readonly traceEvidenceSha256: string | null;
}

export interface GraphValidationResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "pass" | "fail";
  readonly source: GraphValidationSourceDescriptor & {
    readonly sha256: string;
    readonly lineCount: number;
  };
  readonly profile: GraphValidationProfileDescriptor & {
    readonly profileId: string;
    readonly artifactFamily: GraphArtifactFamily;
    readonly profileVersion: string;
    readonly sha256: string;
  };
  readonly run: GraphValidationRuntimeMetadata;
  readonly nodes: readonly GraphValidationNode[];
  readonly relationships: readonly GraphValidationRelationship[];
  readonly requiredPathResults: readonly RequiredPathResult[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphDiagnostic[];
  readonly summary: GraphValidationSummary;
  readonly hashes: GraphValidationHashes & {
    readonly sourceSha256: string;
    readonly profileSha256: string;
    readonly traceEvidenceSha256: string;
  };
}

export interface GraphValidationOperationalResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "operational-error";
  readonly source: GraphValidationSourceDescriptor;
  readonly profile: GraphValidationProfileDescriptor;
  readonly run: GraphValidationRuntimeMetadata;
  readonly nodes: readonly never[];
  readonly relationships: readonly never[];
  readonly requiredPathResults: readonly never[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphValidationOperationalDiagnostic[];
  readonly summary: GraphValidationSummary & {
    readonly nodes: 0;
    readonly relationships: 0;
    readonly requiredPaths: 0;
    readonly satisfiedRequiredPaths: 0;
  };
  readonly hashes: GraphValidationHashes & {
    readonly traceEvidenceSha256: null;
  };
}

export type GraphValidationRunResult =
  | GraphValidationResult
  | GraphValidationOperationalResult;
