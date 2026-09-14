import assert from 'node:assert/strict';
import { analysisSummary } from './snapshot.mjs';
import { rangeAt } from './source.mjs';

const roleOrder = ['owned-content', 'heading', 'table-header'];
function partsFor(demands, text, order) {
  const merged = [];
  for (const demand of [...demands].sort((a, b) => a.start - b.start || a.end - b.end)) {
    const last = merged.at(-1);
    if (last && demand.start < last.end) {
      last.end = Math.max(last.end, demand.end);
      last.labels.add(demand.label); last.roles.add(demand.role);
    } else merged.push({ start: demand.start, end: demand.end, labels: new Set([demand.label]), roles: new Set([demand.role]) });
  }
  return merged.map(part => ({ range: rangeAt(text, part.start, part.end), text: text.slice(part.start, part.end),
    forIdentifiers: order.filter(label => part.labels.has(label)), roles: roleOrder.filter(role => part.roles.has(role)) }));
}
export function checkContext(operation, s, graph, selections) {
  const { selection: id, budget } = operation.arguments;
  const selection = selections.get(id);
  assert(selection, `Unknown selection ${id}`);
  assert.equal(operation.expected.ok, true);
  const order = selection.nodes.map(n => n.identifier), demands = [], includedIdentifiers = [], omittedIdentifiers = [];
  for (const label of order) {
    const identifier = s.identifiers.find(i => i.identifier === label);
    const definition = graph.occurrences.get(identifier.definition.occurrenceId);
    const definitionFragment = graph.fragments.get(definition.fragmentId);
    if (definitionFragment.owners.length > 1) {
      omittedIdentifiers.push({ identifier: label, reason: 'ambiguous-ownership', fragmentId: definition.fragmentId,
        sourceRange: definitionFragment.range, declarationIds: definitionFragment.owners });
      continue;
    }
    const bundle = new Map();
    for (const f of s.fragments) if (f.owner.status === 'owned' && f.owner.identifier === label) bundle.set(f.id, 'owned-content');
    const addSupport = id => {
      for (const supportId of graph.fragments.get(id).requiredContext) {
        if (bundle.has(supportId)) continue;
        const f = graph.fragments.get(supportId);
        bundle.set(supportId, f.structure === 'heading' ? 'heading' : 'table-header');
        addSupport(supportId);
      }
    };
    for (const id of [...bundle.keys()]) addSupport(id);
    const extra = [...bundle].map(([id, role]) => {
      const f = graph.fragments.get(id);
      return { start: f.range.start.offset, end: f.range.end.offset, label, role };
    });
    const candidate = partsFor([...demands, ...extra], graph.text, order);
    const byteCount = candidate.reduce((n, part) => n + Buffer.byteLength(part.text), 0);
    const reason = byteCount > budget.maxUtf8Bytes ? 'byte-budget' : candidate.length > budget.maxFragments ? 'fragment-budget' : null;
    if (reason) omittedIdentifiers.push({ identifier: label, reason });
    else { demands.push(...extra); includedIdentifiers.push(label); }
  }
  const parts = partsFor(demands, graph.text, order);
  assert.deepEqual(operation.expected.value, { ...analysisSummary(s), schemaVersion: 'markdown-trace.document-context.v1', source: s.source,
    parts, includedIdentifiers, omittedIdentifiers, usedUtf8Bytes: parts.reduce((n, part) => n + Buffer.byteLength(part.text), 0),
    selection: { query: selection.query, nodes: selection.nodes, boundary: selection.boundary } });
}
