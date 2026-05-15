export interface TraceGraphNode {
  readonly id: string;
  readonly label: string;
  readonly type: string;
}

export interface TraceGraphEdge {
  readonly source: string;
  readonly target: string;
}

export interface TraceGraph {
  readonly nodes: readonly TraceGraphNode[];
  readonly edges: readonly TraceGraphEdge[];
}
