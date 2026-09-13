import type { AnalysisSummary, IdentifierRecord, Occurrence, Relationship } from "./analysis.js";
import type { AnalysisId, Identifier, RelationshipId, RelationKind } from "./source.js";
declare const selectionHandle: unique symbol;
export interface LookupResult extends AnalysisSummary {
  readonly record: IdentifierRecord | null;
  readonly definitions: readonly Occurrence[];
  readonly referenceCount: number;
}
export interface ReferenceMatch {
  readonly relationship: Relationship;
  readonly occurrence: Occurrence;
}
export interface ReferenceQuery {
  readonly relations?: readonly RelationKind[];
  readonly offset?: number;
  readonly limit?: number;
}
export interface ReferencePage extends AnalysisSummary {
  readonly identifier: Identifier;
  readonly record: IdentifierRecord | null;
  readonly items: readonly ReferenceMatch[];
  readonly offset: number;
  readonly limit: number;
  readonly totalMatches: number;
  readonly nextOffset: number | null;
}
export interface TraversalQuery {
  readonly roots: readonly [Identifier, ...Identifier[]];
  readonly direction: "incoming" | "outgoing" | "both";
  readonly relations?: readonly RelationKind[];
  readonly maxDepth: number;
  readonly maxNodes: number;
}
export interface SelectedIdentifier {
  readonly identifier: Identifier;
  readonly depth: number;
  readonly via: { readonly from: Identifier; readonly relationshipId: RelationshipId; readonly kind: RelationKind } | null;
}
export interface TraversalBoundary {
  readonly depthLimited: boolean;
  readonly nodeLimited: boolean;
  readonly unresolvedRelationships: number;
}
export interface GraphSelection extends AnalysisSummary {
  readonly [selectionHandle]: true;
  readonly analysisId: AnalysisId;
  readonly query: TraversalQuery;
  readonly nodes: readonly SelectedIdentifier[];
  readonly boundary: TraversalBoundary;
}
