/** Experimental document graph API. */
export type Identifier = string;
export type EntityKind = string;
export type RelationKind = string;
export type OccurrenceId = string;
export type RelationshipId = string;
export type FragmentId = string;
export type AnalysisId = string;
export type Sha256 = string;
export type NonEmpty<T> = readonly [T, ...T[]];
export interface SourcePosition {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}
export interface SourceRange {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
}
export interface DocumentSource {
  readonly documentId: string;
  readonly text: string;
}
export interface SourceIdentity {
  readonly documentId: string;
  readonly sha256: Sha256;
  readonly utf8Bytes: number;
  readonly utf16Length: number;
}
export interface Diagnostic {
  readonly code: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly identifiers: readonly Identifier[];
  readonly sourceRanges: readonly SourceRange[];
  readonly ruleId?: string;
}
export interface OperationError {
  readonly code:
    | "invalid-input"
    | "invalid-profile"
    | "unsupported-version"
    | "profile-mismatch"
    | "analysis-limit"
    | "source-map-unavailable"
    | "unresolved-root"
    | "stale-selection"
    | "invalid-selection";
  readonly message: string;
  readonly diagnostics: readonly Diagnostic[];
}
export type Outcome<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: OperationError };
