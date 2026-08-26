import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import type {
  GraphArtifactFamily,
  GraphRelationshipClass,
} from "../graph-profile/index.js";
import type { TraceEvidenceAnchor, TraceEvidenceResult } from "../trace-evidence/index.js";

export interface GraphValidationNode {
  readonly id: string;
  readonly family: string;
  readonly authority: "trace-evidence";
  readonly role: "primary_definition" | "terminal_coverage_node";
  readonly sourceRange?: SourceRange;
}

export interface GraphValidationRelationship {
  readonly class: GraphRelationshipClass;
  readonly sourceId: string;
  readonly targetId: string;
  readonly sourceRanges: readonly SourceRange[];
  readonly rawEvidenceAnchors: readonly TraceEvidenceAnchor[];
}

export interface RequiredPathResult {
  readonly pathId: string;
  readonly sourceId: string;
  readonly status: "satisfied" | "missing";
  readonly nodeIds: readonly string[];
  readonly relationshipClasses: readonly GraphRelationshipClass[];
  readonly missingRelationshipClass?: GraphRelationshipClass;
}

export interface GraphDiagnostic {
  readonly code: "markdown-trace.graph.missing_required_path";
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly sourceRanges: readonly SourceRange[];
  readonly blocking: true;
}

export interface GraphValidationResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "pass" | "fail";
  readonly source: TraceEvidenceResult["source"];
  readonly profile: TraceEvidenceResult["profile"];
  readonly run: TraceEvidenceResult["run"];
  readonly nodes: readonly GraphValidationNode[];
  readonly relationships: readonly GraphValidationRelationship[];
  readonly requiredPathResults: readonly RequiredPathResult[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphDiagnostic[];
  readonly summary: {
    readonly nodes: number;
    readonly relationships: number;
    readonly requiredPaths: number;
    readonly satisfiedRequiredPaths: number;
    readonly diagnostics: number;
  };
  readonly hashes: {
    readonly sourceSha256: string;
    readonly profileSha256: string;
    readonly traceEvidenceSha256: string;
  };
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
  readonly sourceRanges: readonly SourceRange[];
  readonly blocking: true;
  readonly stage: GraphValidationOperationalStage;
  readonly source?: string;
}

export interface GraphValidationOperationalResult {
  readonly schemaVersion: "markdown-trace.graph-validation-result.v1";
  readonly status: "operational-error";
  readonly source: {
    readonly path: string;
    readonly sha256: null;
    readonly lineCount: null;
  };
  readonly profile: {
    readonly path: string;
    readonly profileId: string | null;
    readonly artifactFamily: GraphArtifactFamily | null;
    readonly profileVersion: string | null;
    readonly sha256: string | null;
  };
  readonly run: TraceEvidenceResult["run"];
  readonly nodes: readonly never[];
  readonly relationships: readonly never[];
  readonly requiredPathResults: readonly never[];
  readonly matrixCoverageResults: readonly never[];
  readonly diagnostics: readonly GraphValidationOperationalDiagnostic[];
  readonly summary: {
    readonly nodes: 0;
    readonly relationships: 0;
    readonly requiredPaths: 0;
    readonly satisfiedRequiredPaths: 0;
    readonly diagnostics: number;
  };
  readonly hashes: {
    readonly sourceSha256: null;
    readonly profileSha256: string | null;
    readonly traceEvidenceSha256: null;
  };
}

export type GraphValidationRunResult =
  | GraphValidationResult
  | GraphValidationOperationalResult;
