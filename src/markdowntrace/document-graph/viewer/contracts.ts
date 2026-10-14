import type { GraphSnapshot, IdentifierRecord, Relationship } from "../contracts/analysis.js";
import type { SourceRange } from "../contracts/source.js";
import type { GraphValidationReport } from "../contracts/validation.js";

/** Internal presentation transport, not a replacement graph or public API. */
export interface ViewerField { name: string; value: string; range?: SourceRange }
export interface ViewerEvidence {
  occurrenceId: string;
  range: SourceRange;
  fragmentId: string;
}
export interface ViewerEntity {
  id: string;
  kind: string | null;
  label: string;
  definition: IdentifierRecord["definition"];
  heading: boolean;
  sourceSelected: boolean;
  evidence: ViewerEvidence[];
}
export interface ViewerRelation extends Relationship {
  range: SourceRange;
  fragmentId: string;
}
export interface ViewerPayload {
  version: "trace-explorer.v1";
  title: string;
  sourceText: string;
  contexts: Record<string, { range: SourceRange; fields: ViewerField[] }>;
  graph: GraphSnapshot;
  validation: GraphValidationReport;
  entities: ViewerEntity[];
  relations: ViewerRelation[];
}
export interface ViewOptions {
  root: string | null;
  direction: "incoming" | "outgoing" | "both";
  depth: number;
  maxNodes: number;
  headings: boolean;
  kinds: readonly string[] | null;
  relations: readonly string[] | null;
  option: string | null;
}
export interface DisplayEdge {
  id: string;
  source: string;
  target: string;
  kind: string;
  occurrences: string[];
}
export interface ViewSelection {
  nodes: ViewerEntity[];
  edges: DisplayEdge[];
  boundary: { relationId: string; reason: string }[];
  nodeLimit: boolean;
  edgeLimit: boolean;
  depthLimit: boolean;
}
