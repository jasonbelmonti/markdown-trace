import type { DocumentAnalysis, IdentifierRecord, Occurrence, Relationship } from "../contracts/analysis.js";
import type { SourceIdentity, Diagnostic } from "../contracts/source.js";
import type { ReferenceQuery, TraversalBoundary } from "../contracts/query.js";

export interface QualifiedEntity { readonly analysisId: string; readonly identifier: string }
export interface QualifiedOccurrence { readonly analysisId: string; readonly occurrenceId: string }
export interface CapturePin { readonly analysisId: string; readonly source: SourceIdentity }
export interface CorpusCapture { readonly alias: string; readonly analysis: DocumentAnalysis; readonly expected: CapturePin }
export interface CorpusBinding { readonly source: QualifiedOccurrence; readonly target: QualifiedEntity }
export interface CorpusLimits { readonly maxCaptures: number; readonly maxBindings: number; readonly maxSourceUtf8Bytes: number }
export interface CorpusInput { readonly captures: readonly CorpusCapture[]; readonly bindings: readonly CorpusBinding[]; readonly limits: CorpusLimits }
export type CorpusErrorCode = 'invalid-input' | 'stale-capture' | 'incompatible-capture' | 'corpus-limit' | 'unresolved-root' | 'invalid-selection' | 'stale-selection';
export type CorpusOutcome<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: { readonly code: CorpusErrorCode; readonly message: string; readonly diagnostics: readonly Diagnostic[] } };
export type CorpusUnresolvedReason = 'conflicting-bindings' | 'local-target-not-missing' | 'target-id-mismatch' | 'unusable-owner' | 'missing-capture' | 'missing-definition' | 'duplicate-definition' | 'unknown-kind';
export interface CorpusReference {
  readonly evidence: QualifiedOccurrence; readonly relationship: Relationship; readonly occurrence: Occurrence;
  readonly source: QualifiedEntity | null; readonly targets: readonly QualifiedEntity[]; readonly binding: boolean;
  readonly resolution: { readonly status: 'resolved'; readonly target: QualifiedEntity } | { readonly status: 'unresolved'; readonly reason: CorpusUnresolvedReason };
}
export interface CorpusCaptureSummary extends CapturePin { readonly aliases: readonly string[]; readonly coverage: 'complete' | 'partial'; readonly diagnosticCount: number }
export interface CorpusSnapshot {
  readonly schemaVersion: 'markdown-trace.corpus.v1'; readonly corpusId: string; readonly interpretationHash: string;
  readonly analyzerVersion: string; readonly parserVersion: string; readonly captures: readonly CorpusCaptureSummary[];
  readonly references: readonly CorpusReference[];
}
declare const corpusHandle: unique symbol;
export interface DocumentCorpus { readonly [corpusHandle]: true; readonly snapshot: CorpusSnapshot }
export interface CorpusLookupResult { readonly corpusId: string; readonly entity: QualifiedEntity; readonly capture: CorpusCaptureSummary | null; readonly record: IdentifierRecord | null; readonly definitions: readonly Occurrence[]; readonly referenceCount: number }
export interface CorpusReferencePage extends CorpusLookupResult { readonly items: readonly CorpusReference[]; readonly offset: number; readonly limit: number; readonly totalMatches: number; readonly nextOffset: number | null }
export interface CorpusTraversalQuery { readonly roots: readonly [QualifiedEntity, ...QualifiedEntity[]]; readonly direction: 'incoming' | 'outgoing' | 'both'; readonly relations?: readonly string[]; readonly maxDepth: number; readonly maxNodes: number }
export interface CorpusSelectedEntity { readonly entity: QualifiedEntity; readonly depth: number; readonly via: { readonly from: QualifiedEntity; readonly evidence: QualifiedOccurrence; readonly relationshipId: string; readonly kind: string } | null }
declare const corpusSelectionHandle: unique symbol;
export interface CorpusSelection { readonly [corpusSelectionHandle]: true; readonly corpusId: string; readonly query: CorpusTraversalQuery; readonly nodes: readonly CorpusSelectedEntity[]; readonly boundary: TraversalBoundary; readonly coverage: 'complete' | 'partial'; readonly diagnosticCount: number }
