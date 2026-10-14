import type { DisplayEdge, ViewerEntity, ViewerPayload, ViewOptions, ViewSelection } from "./contracts.js";

export const MAX_VIEW_NODES = 100;
export const MAX_VIEW_EDGES = 240;
export const DEFAULT_VIEW: ViewOptions = {
  root: null, direction: "both", depth: 1, maxNodes: 60,
  headings: false, kinds: null, relations: null, option: null,
};
const bounded = (value: number, max: number) => Number.isFinite(value)
  ? Math.max(0, Math.min(max, Math.floor(value))) : 0;

/** Filters are traversal barriers. The root is retained despite kind/heading filters. */
export function selectView(payload: Pick<ViewerPayload, "entities" | "relations">, options: ViewOptions): ViewSelection {
  const entities = new Map(payload.entities.map(entity => [entity.id, entity]));
  const selected = new Set<string>();
  const maxNodes = bounded(options.maxNodes, MAX_VIEW_NODES), depth = bounded(options.depth, 6);
  const kinds = options.kinds && new Set(options.kinds), relations = options.relations && new Set(options.relations);
  const rejected = (node: ViewerEntity): string | undefined => {
    if (options.option && node.kind === "option" && node.id !== options.option) return "other option";
    if (node.id === options.root) return undefined;
    if (!options.headings && node.heading) return "heading hidden";
    if (kinds && !kinds.has(node.kind ?? "unknown")) return "kind hidden";
    return undefined;
  };
  const adjacency = new Map<string, string[]>();
  for (const edge of payload.relations) {
    if (edge.source.status !== "owned" || (relations && !relations.has(edge.kind))) continue;
    const add = (from: string, to: string) => {
      const entries = adjacency.get(from) ?? []; entries.push(to); adjacency.set(from, entries);
    };
    if (options.direction !== "incoming") add(edge.source.identifier, edge.target);
    if (options.direction !== "outgoing") add(edge.target, edge.source.identifier);
  }
  const result: ViewSelection = { nodes: [], edges: [], boundary: [], nodeLimit: false, edgeLimit: false, depthLimit: false };
  const queue: { id: string; level: number }[] = [];
  const visit = (id: string, level: number) => {
    const node = entities.get(id);
    if (!node || rejected(node) || selected.has(id)) return;
    if (selected.size >= maxNodes) { result.nodeLimit = true; return; }
    selected.add(id); queue.push({ id, level });
  };
  if (options.root) visit(options.root, 0);
  else for (const node of payload.entities) visit(node.id, depth);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { id, level } = queue[cursor];
    for (const next of adjacency.get(id) ?? []) {
      const node = entities.get(next);
      if (!node || rejected(node) || selected.has(next)) continue;
      if (level >= depth) { if (options.root) result.depthLimit = true; continue; }
      visit(next, level + 1);
    }
  }
  result.nodes = [...selected].map(id => entities.get(id)!);
  const groups = new Map<string, DisplayEdge>();
  for (const edge of payload.relations) {
    const source = edge.source.status === "owned" ? edge.source.identifier : null;
    if (!selected.has(edge.target) && (!source || !selected.has(source))) continue;
    let reason: string | undefined;
    if (!source) reason = `${edge.source.status} source`;
    else if (relations && !relations.has(edge.kind)) reason = "relation hidden";
    else {
      const outside = [source, edge.target].filter(id => !selected.has(id));
      if (outside.length) reason = outside.map(id => entities.has(id) ? rejected(entities.get(id)!)
        ?? "outside focus or budget" : "unknown identity").join(", ");
    }
    if (!reason && source) {
      const key = JSON.stringify([source, edge.target, edge.kind]);
      let group = groups.get(key);
      if (!group && groups.size >= MAX_VIEW_EDGES) { reason = "edge limit"; result.edgeLimit = true; }
      else {
        if (!group) { group = { id: edge.id, source, target: edge.target, kind: edge.kind, occurrences: [] }; groups.set(key, group); }
        group.occurrences.push(edge.id);
      }
    }
    if (reason) result.boundary.push({ relationId: edge.id, reason });
  }
  result.edges = [...groups.values()];
  return result;
}
