import type { DocumentAnalysis } from "./contracts/analysis.js";
import type {
  GraphSelection,
  ReferenceMatch,
  SelectedIdentifier,
  TraversalQuery,
} from "./contracts/query.js";
import type { Outcome } from "./contracts/source.js";
import { analysisState, type AnalysisState } from "./analysis-state.js";
import { issueSelection } from "./selection-state.js";
import { failure, identifierPattern, slugPattern } from "./value.js";

const queryKeys = new Set([
  "roots",
  "direction",
  "relations",
  "maxDepth",
  "maxNodes",
]);

function denseStrings(
  value: unknown,
  pattern: RegExp,
  nonempty: boolean,
): value is string[] {
  return (
    Array.isArray(value) &&
    (!nonempty || value.length > 0) &&
    Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index)) &&
    value.every((item) => typeof item === "string" && pattern.test(item))
  );
}

function validQuery(value: unknown): value is TraversalQuery {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !queryKeys.has(key))
  )
    return false;
  const query = value as Record<string, unknown>;
  if (!denseStrings(query.roots, identifierPattern, true)) return false;
  if (
    query.direction !== "incoming" &&
    query.direction !== "outgoing" &&
    query.direction !== "both"
  )
    return false;
  if (
    query.relations !== undefined &&
    !denseStrings(query.relations, slugPattern, false)
  )
    return false;
  return (
    Number.isSafeInteger(query.maxDepth) &&
    (query.maxDepth as number) >= 0 &&
    Number.isSafeInteger(query.maxNodes) &&
    (query.maxNodes as number) >= new Set(query.roots).size
  );
}

function compare(a: ReferenceMatch, b: ReferenceMatch): number {
  return (
    a.occurrence.range.start.offset - b.occurrence.range.start.offset ||
    a.occurrence.range.end.offset - b.occurrence.range.end.offset ||
    lexical(a.relationship.kind, b.relationship.kind) ||
    lexical(a.relationship.id, b.relationship.id)
  );
}

function lexical(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function adjacent(
  state: AnalysisState,
  identifier: string,
  direction: TraversalQuery["direction"],
): ReferenceMatch[] {
  const matches = new Map<string, ReferenceMatch>();
  if (direction !== "outgoing")
    for (const match of state.incoming.get(identifier) ?? [])
      matches.set(match.relationship.id, match);
  if (direction !== "incoming")
    for (const match of state.outgoing.get(identifier) ?? [])
      matches.set(match.relationship.id, match);
  return [...matches.values()].sort(compare);
}

function resolvedNeighbor(
  state: AnalysisState,
  identifier: string,
  match: ReferenceMatch,
  direction: TraversalQuery["direction"],
): string | null {
  const relationship = match.relationship;
  if (relationship.source.status !== "owned") return null;
  const source = state.identifiers.get(relationship.source.identifier);
  const target = state.identifiers.get(relationship.target);
  if (
    !source ||
    source.definition.status !== "resolved" ||
    source.entityKind === null ||
    !target ||
    target.definition.status !== "resolved" ||
    target.entityKind === null
  )
    return null;
  if (direction !== "outgoing" && relationship.target === identifier)
    return relationship.source.identifier;
  if (direction !== "incoming" && relationship.source.identifier === identifier)
    return relationship.target;
  return null;
}

/** Select one canonical shortest explanation for each reachable identifier. */
export function traverseGraph(
  analysis: DocumentAnalysis,
  query: TraversalQuery,
): Outcome<GraphSelection> {
  const state = analysisState(analysis);
  if (!state || !validQuery(query))
    return failure("invalid-input", "Expected an issued analysis and bounded traversal query");

  const roots = [...new Set(query.roots)].sort(lexical);
  for (const root of roots) {
    const record = state.identifiers.get(root);
    if (!record || record.definition.status !== "resolved" || record.entityKind === null)
      return failure("unresolved-root", `Root ${root} has no unique known definition`);
  }

  const nodes: SelectedIdentifier[] = roots.map((identifier) => ({
    identifier,
    depth: 0,
    via: null,
  }));
  const visited = new Set(roots);
  const unresolved = new Set<string>();
  let depthLimited = false;
  let nodeLimited = false;
  for (const node of nodes) {
    for (const match of adjacent(state, node.identifier, query.direction)) {
      const relationship = match.relationship;
      if (query.relations !== undefined && !query.relations.includes(relationship.kind))
        continue;
      const neighbor = resolvedNeighbor(state, node.identifier, match, query.direction);
      if (neighbor === null) {
        unresolved.add(relationship.id);
        continue;
      }
      if (visited.has(neighbor)) continue;
      if (node.depth >= query.maxDepth) depthLimited = true;
      if (nodes.length >= query.maxNodes) nodeLimited = true;
      if (node.depth >= query.maxDepth || nodes.length >= query.maxNodes) continue;
      visited.add(neighbor);
      nodes.push({
        identifier: neighbor,
        depth: node.depth + 1,
        via: {
          from: node.identifier,
          relationshipId: relationship.id,
          kind: relationship.kind,
        },
      });
    }
  }
  const normalizedQuery: TraversalQuery = {
    roots: roots as [string, ...string[]],
    direction: query.direction,
    ...(query.relations === undefined ? {} : { relations: [...query.relations] }),
    maxDepth: query.maxDepth,
    maxNodes: query.maxNodes,
  };
  const selection = issueSelection({
    analysisId: analysis.snapshot.analysisId,
    coverage: analysis.snapshot.coverage,
    diagnosticCount: analysis.snapshot.diagnostics.length,
    query: normalizedQuery,
    nodes,
    boundary: {
      depthLimited,
      nodeLimited,
      unresolvedRelationships: unresolved.size,
    },
  });
  return { ok: true, value: selection };
}
