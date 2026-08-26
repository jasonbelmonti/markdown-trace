import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import type {
  GraphArtifactFamily,
  GraphRelationshipClass,
} from "../graph-profile/index.js";
import type { RuntimeMetadata } from "../runtime-metadata.js";

export type TraceEvidenceRole =
  | "primary_definition"
  | "coverage_reference"
  | "terminal_coverage_node";

export interface TraceEvidenceOccurrence {
  readonly occurrenceId: string;
  readonly label: string;
  readonly family: string;
  readonly role: TraceEvidenceRole;
  readonly sourceKind: "table_cell";
  readonly sourceRange?: SourceRange;
}

export interface TraceEvidenceAnchor {
  readonly tableTargetId: string;
  readonly rowIndex: number;
  readonly columnIndex: number;
  readonly columnHeader: string;
  readonly sourceRange?: SourceRange;
}

export interface TraceEvidenceCandidateEdge {
  readonly edgeId: string;
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly relationshipClass: GraphRelationshipClass;
  readonly rawEvidenceAnchor: TraceEvidenceAnchor;
}

export interface TraceEvidenceCoverageRow {
  readonly coverageRowId: string;
  readonly sourceLabel: string;
  readonly targetLabels: readonly string[];
  readonly relationshipClasses: readonly GraphRelationshipClass[];
  readonly sourceRange?: SourceRange;
  readonly targetSourceRanges: readonly SourceRange[];
}

export interface TraceEvidenceDiagnostic {
  readonly stage: "parse" | "normalize";
  readonly code: string;
  readonly message: string;
  readonly severity: string;
  readonly sourceRange?: SourceRange;
}

export interface TraceEvidenceResult<
  TArtifactFamily extends GraphArtifactFamily = GraphArtifactFamily,
> {
  readonly schemaVersion: "markdown-trace.trace-evidence.v1";
  readonly authority: "trace-evidence";
  readonly source: {
    readonly path: string;
    readonly sha256: string;
    readonly lineCount: number;
  };
  readonly profile: {
    readonly profileId: string;
    readonly artifactFamily: TArtifactFamily;
    readonly profileVersion: string;
    readonly sha256: string;
  };
  readonly run: RuntimeMetadata;
  readonly definitions: readonly TraceEvidenceOccurrence[];
  readonly supplementalDefinitions: readonly TraceEvidenceOccurrence[];
  readonly coverageRows: readonly TraceEvidenceCoverageRow[];
  readonly mentions: readonly TraceEvidenceOccurrence[];
  readonly ranges: readonly never[];
  readonly candidateEdges: readonly TraceEvidenceCandidateEdge[];
  readonly diagnostics: readonly TraceEvidenceDiagnostic[];
  readonly hashes: {
    readonly sourceSha256: string;
    readonly profileSha256: string;
  };
}
