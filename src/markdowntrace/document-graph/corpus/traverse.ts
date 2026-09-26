import type {
  CorpusOutcome,
  CorpusSelectedEntity,
  CorpusSelection,
  CorpusTraversalQuery,
  DocumentCorpus,
  QualifiedEntity,
  CorpusReference,
} from "./contracts.js";
import { corpusState, entityKey } from "./state.js";
import { compareEntity } from "./order.js";
import { identifierPattern, slugPattern, freeze } from "../value.js";
import { issueCorpusSelection } from "./selection-state.js";

const keys = (value: unknown, allowed: readonly string[]): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype &&
  Reflect.ownKeys(value).every((key) => typeof key === "string" && allowed.includes(key) &&
    Object.getOwnPropertyDescriptor(value, key)?.enumerable === true &&
    "value" in Object.getOwnPropertyDescriptor(value, key)!);

const dense = (value: unknown): value is unknown[] => Array.isArray(value) &&
  Reflect.ownKeys(value).length === value.length + 1 &&
  Reflect.ownKeys(value).filter((key) => key !== "length").every((key, index) =>
    key === String(index) && Object.getOwnPropertyDescriptor(value, key)?.enumerable === true &&
    "value" in Object.getOwnPropertyDescriptor(value, key)!);

const exact = (pattern: RegExp, value: string): boolean => {
  const match = pattern.exec(value);
  return !!match && match[0] === value;
};

const validEntity = (value: unknown): value is QualifiedEntity =>
  keys(value, ["analysisId", "identifier"]) && typeof value.analysisId === "string" &&
  exact(/^[0-9a-f]{64}$/, value.analysisId) && typeof value.identifier === "string" &&
  exact(identifierPattern, value.identifier);

const fail = <T>(code: "invalid-input" | "unresolved-root", message: string): CorpusOutcome<T> =>
  freeze({ ok: false as const, error: { code, message, diagnostics: [] } });

const knownEntity = (state: NonNullable<ReturnType<typeof corpusState>>, entity: QualifiedEntity): boolean => {
  const record = state.records.get(entity.analysisId)?.get(entity.identifier);
  return !!record && record.definition.status === "resolved" && record.entityKind !== null;
};

function validQuery(value: unknown): value is CorpusTraversalQuery {
  if (!keys(value, ["roots", "direction", "relations", "maxDepth", "maxNodes"]) ||
      !dense(value.roots) || value.roots.length === 0 || !value.roots.every(validEntity) ||
      !["incoming", "outgoing", "both"].includes(value.direction as string) ||
      !Number.isSafeInteger(value.maxDepth) || (value.maxDepth as number) < 0 ||
      !Number.isSafeInteger(value.maxNodes) || (value.maxNodes as number) < 1) return false;
  if (value.relations !== undefined && (!dense(value.relations) ||
      !value.relations.every((relation) => typeof relation === "string" && exact(slugPattern, relation)))) return false;
  const uniqueRoots = new Set((value.roots as unknown as QualifiedEntity[]).map((root) => entityKey(root.analysisId, root.identifier)));
  return (value.maxNodes as number) >= uniqueRoots.size;
}

function incident(reference: CorpusReference, key: string, direction: CorpusTraversalQuery["direction"]): boolean {
  const outgoing = reference.source !== null && entityKey(reference.source.analysisId, reference.source.identifier) === key;
  const incoming = reference.targets.some((target) => entityKey(target.analysisId, target.identifier) === key);
  return direction === "outgoing" ? outgoing : direction === "incoming" ? incoming : outgoing || incoming;
}

function neighbor(reference: CorpusReference, current: QualifiedEntity, direction: CorpusTraversalQuery["direction"]): QualifiedEntity | null {
  if (reference.resolution.status !== "resolved" || !reference.source) return null;
  const currentKey = entityKey(current.analysisId, current.identifier);
  const sourceKey = entityKey(reference.source.analysisId, reference.source.identifier);
  const targetKey = entityKey(reference.resolution.target.analysisId, reference.resolution.target.identifier);
  if (direction !== "incoming" && sourceKey === currentKey) return reference.resolution.target;
  if (direction !== "outgoing" && targetKey === currentKey) return reference.source;
  return null;
}

/** Select a canonical shortest dependency explanation across admitted captures. */
export function traverseCorpus(corpus: DocumentCorpus, query: CorpusTraversalQuery): CorpusOutcome<CorpusSelection> {
  const state = corpusState(corpus);
  if (!state || !validQuery(query)) return fail("invalid-input", "Invalid corpus traversal query");

  const roots = [...new Map((query.roots as unknown as QualifiedEntity[]).map((root) =>
    [entityKey(root.analysisId, root.identifier), { analysisId: root.analysisId, identifier: root.identifier }])).values()]
    .sort((a, b) => compareEntity(a, b, state.captures));
  if (roots.some((root) => !state.captures.has(root.analysisId) || !knownEntity(state, root)))
    return fail("unresolved-root", "Every root must have one known definition in an admitted capture");

  const normalizedQuery: CorpusTraversalQuery = {
    roots: roots as [QualifiedEntity, ...QualifiedEntity[]],
    direction: query.direction,
    ...(query.relations === undefined ? {} : { relations: [...query.relations] }),
    maxDepth: query.maxDepth,
    maxNodes: query.maxNodes,
  };
  const nodes: CorpusSelectedEntity[] = roots.map((entity) => ({ entity, depth: 0, via: null }));
  const visited = new Set(roots.map((root) => entityKey(root.analysisId, root.identifier)));
  const unresolved = new Set<string>();
  let depthLimited = false;
  let nodeLimited = false;

  for (let cursor = 0; cursor < nodes.length; cursor += 1) {
    const current = nodes[cursor];
    const currentKey = entityKey(current.entity.analysisId, current.entity.identifier);
    for (const reference of state.references) {
      if (normalizedQuery.relations !== undefined && !normalizedQuery.relations.includes(reference.relationship.kind)) continue;
      if (!incident(reference, currentKey, normalizedQuery.direction)) continue;
      if (reference.resolution.status === "unresolved") {
        unresolved.add(entityKey(reference.evidence.analysisId, reference.evidence.occurrenceId));
        continue;
      }
      const next = neighbor(reference, current.entity, normalizedQuery.direction);
      if (!next || !knownEntity(state, next) || !reference.source || !knownEntity(state, reference.source)) continue;
      const nextKey = entityKey(next.analysisId, next.identifier);
      if (visited.has(nextKey)) continue;
      if (current.depth >= normalizedQuery.maxDepth) depthLimited = true;
      if (nodes.length >= normalizedQuery.maxNodes) nodeLimited = true;
      if (current.depth >= normalizedQuery.maxDepth || nodes.length >= normalizedQuery.maxNodes) continue;
      visited.add(nextKey);
      nodes.push({ entity: next, depth: current.depth + 1, via: {
        from: current.entity,
        evidence: reference.evidence,
        relationshipId: reference.relationship.id,
        kind: reference.relationship.kind,
      } });
    }
  }

  return freeze({ ok: true as const, value: issueCorpusSelection({
    corpusId: corpus.snapshot.corpusId,
    query: normalizedQuery,
    nodes,
    boundary: { depthLimited, nodeLimited, unresolvedRelationships: unresolved.size },
    coverage: [...state.captures.values()].some((capture) => capture.coverage === "partial") ? "partial" : "complete",
    diagnosticCount: [...state.captures.values()].reduce((total, capture) => total + capture.diagnosticCount, 0),
  }) as unknown as CorpusSelection });
}
