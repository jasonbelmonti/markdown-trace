import type { AnalysisSummary } from "./analysis.js";
import type { GraphSelection } from "./query.js";
import type { Identifier, NonEmpty, SourceIdentity, SourceRange } from "./source.js";
export interface ContextBudget {
  readonly maxUtf8Bytes: number;
  readonly maxFragments: number;
}
export interface ContextPart {
  readonly range: SourceRange;
  readonly text: string;
  readonly forIdentifiers: NonEmpty<Identifier>;
  readonly roles: NonEmpty<"owned-content" | "heading" | "table-header">;
}
export interface ContextBundle extends AnalysisSummary {
  readonly schemaVersion: "markdown-trace.document-context.v1";
  readonly source: SourceIdentity;
  readonly parts: readonly ContextPart[];
  readonly includedIdentifiers: readonly Identifier[];
  readonly omittedIdentifiers: readonly { readonly identifier: Identifier; readonly reason: "byte-budget" | "fragment-budget" }[];
  readonly usedUtf8Bytes: number;
  readonly selection: Pick<GraphSelection, "query" | "nodes" | "boundary">;
}
export interface ContextRequest {
  readonly selection: GraphSelection;
  readonly budget: ContextBudget;
}
