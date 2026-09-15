import type {
  AnalysisSummary,
  IdentifierRecord,
  Occurrence,
  Relationship,
} from "./analysis.js";
import type { Identifier, RelationKind } from "./source.js";
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
