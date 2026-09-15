import type {
  AnalysisId,
  Diagnostic,
  EntityKind,
  FragmentId,
  Identifier,
  OccurrenceId,
  RelationshipId,
  RelationKind,
  Sha256,
  SourceIdentity,
  SourceRange,
} from "./source.js";
declare const analysisHandle: unique symbol;
export type DefinitionState =
  | { readonly status: "resolved"; readonly occurrenceId: OccurrenceId }
  | { readonly status: "missing" }
  | {
      readonly status: "duplicate";
      readonly occurrenceIds: readonly [
        OccurrenceId,
        OccurrenceId,
        ...OccurrenceId[],
      ];
    };
export interface IdentifierRecord {
  readonly identifier: Identifier;
  readonly entityKind: EntityKind | null;
  readonly definition: DefinitionState;
}
export type Owner =
  | {
      readonly status: "owned";
      readonly identifier: Identifier;
      readonly declarationId: OccurrenceId;
    }
  | { readonly status: "unowned" }
  | {
      readonly status: "ambiguous";
      readonly declarationIds: readonly [
        OccurrenceId,
        OccurrenceId,
        ...OccurrenceId[],
      ];
    };
export interface Occurrence {
  readonly id: OccurrenceId;
  readonly identifier: Identifier;
  readonly role: "definition" | "reference";
  readonly range: SourceRange;
  readonly fragmentId: FragmentId;
}
export interface Relationship {
  readonly id: RelationshipId;
  readonly kind: RelationKind;
  readonly source: Owner;
  readonly target: Identifier;
  readonly occurrenceId: OccurrenceId;
}
export interface SourceFragment {
  readonly id: FragmentId;
  readonly range: SourceRange;
  readonly owner: Owner;
  readonly structure:
    "heading" | "paragraph" | "list-item" | "table-row" | "code" | "other";
  readonly requiredContext: readonly FragmentId[];
}
export interface GraphSnapshot {
  readonly schemaVersion: "markdown-trace.document-graph.v1";
  readonly analysisId: AnalysisId;
  readonly source: SourceIdentity;
  readonly interpretationHash: Sha256;
  readonly analyzerVersion: string;
  readonly parserVersion: string;
  readonly coverage: "complete" | "partial";
  readonly identifiers: readonly IdentifierRecord[];
  readonly occurrences: readonly Occurrence[];
  readonly relationships: readonly Relationship[];
  readonly fragments: readonly SourceFragment[];
  readonly exclusions: readonly {
    readonly range: SourceRange;
    readonly reason: string;
  }[];
  readonly diagnostics: readonly Diagnostic[];
}
export interface DocumentAnalysis {
  readonly [analysisHandle]: true;
  readonly snapshot: GraphSnapshot;
}
export interface AnalysisLimits {
  readonly maxSourceUtf8Bytes: number;
  readonly maxOccurrences: number;
}
export interface AnalysisSummary {
  readonly analysisId: AnalysisId;
  readonly coverage: GraphSnapshot["coverage"];
  readonly diagnosticCount: number;
}
