import assert from 'node:assert/strict';
import { analysisSummary } from './snapshot.mjs';

export function checkDirect(operation, s) {
  const { identifier, query = {} } = operation.arguments;
  const expected = operation.expected;
  assert.equal(expected.ok, true);
  const record = s.identifiers.find(i => i.identifier === identifier) ?? null;
  const meta = analysisSummary(s);
  if (operation.operation === 'lookupIdentifier') {
    assert.deepEqual(expected.value, { ...meta, record,
      definitions: s.occurrences.filter(o => o.identifier === identifier && o.role === 'definition'),
      referenceCount: s.occurrences.filter(o => o.identifier === identifier && o.role === 'reference').length });
    return;
  }
  const offset = query.offset ?? 0, limit = query.limit ?? 100;
  assert(Number.isSafeInteger(offset) && offset >= 0);
  assert(Number.isSafeInteger(limit) && limit >= 1 && limit <= 1000);
  const matched = s.relationships.filter(r =>
    (operation.operation === 'findIncoming' ? r.target === identifier : r.source.status === 'owned' && r.source.identifier === identifier)
    && (query.relations === undefined || query.relations.includes(r.kind)));
  assert.deepEqual(expected.value, { ...meta, identifier, record,
    items: matched.slice(offset, offset + limit).map(relationship => ({ relationship,
      occurrence: s.occurrences.find(o => o.id === relationship.occurrenceId) })),
    offset, limit, totalMatches: matched.length, nextOffset: offset + limit < matched.length ? offset + limit : null });
}

export function checkTraversal(operation, s) {
  const { query } = operation.arguments;
  const ids = new Map(s.identifiers.map(i => [i.identifier, i]));
  const usable = label => ids.get(label)?.definition.status === 'resolved' && ids.get(label)?.entityKind !== null;
  const roots = [...new Set(query.roots)].sort();
  if (roots.some(id => !usable(id))) {
    assert.equal(operation.expected.ok, false); assert.equal(operation.expected.error.code, 'unresolved-root'); return;
  }
  assert.equal(operation.expected.ok, true);
  const result = operation.expected.value;
  const reached = new Map(roots.map(identifier => [identifier, { identifier, depth: 0, via: null }]));
  const pending = [...reached.values()], unresolved = new Set();
  let depthLimited = false, nodeLimited = false;
  const allowed = s.relationships.filter(r => query.relations === undefined || query.relations.includes(r.kind));
  for (let cursor = 0; cursor < pending.length; cursor++) {
    const node = pending[cursor];
    for (const edge of allowed) {
      const outgoing = query.direction !== 'incoming' && edge.source.status === 'owned' && edge.source.identifier === node.identifier;
      const incoming = query.direction !== 'outgoing' && edge.target === node.identifier;
      if (!incoming && !outgoing) continue;
      if (edge.source.status !== 'owned' || !usable(edge.source.identifier) || !usable(edge.target)) { unresolved.add(edge.id); continue; }
      const target = outgoing ? edge.target : edge.source.identifier;
      if (reached.has(target)) continue;
      if (node.depth === query.maxDepth) { depthLimited = true; continue; }
      if (reached.size === query.maxNodes) { nodeLimited = true; continue; }
      const next = { identifier: target, depth: node.depth + 1, via: { from: node.identifier, relationshipId: edge.id, kind: edge.kind } };
      reached.set(target, next); pending.push(next);
    }
  }
  assert.deepEqual(result, { ...analysisSummary(s), query, nodes: [...reached.values()],
    boundary: { depthLimited, nodeLimited, unresolvedRelationships: unresolved.size } });
}
