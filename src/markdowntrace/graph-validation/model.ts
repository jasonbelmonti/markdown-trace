import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import type { GraphRelationshipClass } from "../graph-profile/index.js";
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
  readonly status: "pass" | "fail" | "operational-error";
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
