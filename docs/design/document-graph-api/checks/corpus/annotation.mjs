import assert from 'node:assert/strict';
import { checkRange, compareRange, keyBy, sourceInput } from './source.mjs';

export function checkAnnotation(a, root) {
  assert.equal(a.schemaVersion, 'markdown-trace.design-annotation.v1');
  const text = sourceInput(a, root);
  const ids = keyBy(a.identifiers, 'identifier'), occurrences = keyBy(a.occurrences);
  const fragments = keyBy(a.fragments), relationships = keyBy(a.relationships);
  const ownerCheck = owners => {
    assert(Array.isArray(owners));
    assert.equal(new Set(owners).size, owners.length);
    for (const id of owners) assert.equal(occurrences.get(id)?.role, 'definition', `Invalid owner ${id}`);
    assert.deepEqual(owners, [...owners].sort((x, y) => compareRange(occurrences.get(x), occurrences.get(y))));
  };
  for (const collection of [a.occurrences, a.fragments, a.exclusions, a.languageDiagnostics]) {
    assert.deepEqual(collection, [...collection].sort(compareRange), 'Source order');
    for (const item of collection) checkRange(text, item.range, item.sourceText);
  }
  for (const [i, o] of a.occurrences.entries()) {
    assert(['definition', 'reference'].includes(o.role));
    assert(ids.has(o.identifier));
    const f = fragments.get(o.fragmentId);
    assert(f && f.range.start.offset <= o.range.start.offset && f.range.end.offset >= o.range.end.offset);
    if (i) assert(a.occurrences[i - 1].range.end.offset <= o.range.start.offset, 'Overlapping occurrences');
  }
  assert.deepEqual([...ids.keys()], [...ids.keys()].sort(), 'Identifier order');
  assert.deepEqual([...ids.keys()], [...new Set(a.occurrences.map(o => o.identifier))].sort());
  for (const i of ids.values()) {
    const defs = a.occurrences.filter(o => o.role === 'definition' && o.identifier === i.identifier).map(o => o.id);
    assert.deepEqual(i.declarations, defs);
    assert.equal(i.definitionStatus, defs.length === 0 ? 'missing' : defs.length === 1 ? 'resolved' : 'duplicate');
    assert.equal(i.entityKind, { REQ: 'requirement', WP: 'work', VAL: 'validation' }[i.identifier.split('-')[0]] ?? null);
  }
  assert.deepEqual(a.relationships.map(r => r.occurrenceId), a.occurrences.filter(o => o.role === 'reference').map(o => o.id), 'Exactly one ordered relationship per reference');
  for (const r of relationships.values()) {
    const o = occurrences.get(r.occurrenceId);
    assert.equal(r.target, o.identifier); ownerCheck(r.owners);
    assert.deepEqual(r.owners, fragments.get(o.fragmentId).owners);
    assert(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(r.kind));
  }
  for (const f of fragments.values()) {
    ownerCheck(f.owners);
    assert(['heading', 'paragraph', 'list-item', 'table-row', 'code', 'other'].includes(f.structure));
    assert.equal(new Set(f.requiredContext).size, f.requiredContext.length);
    const visit = (id, ancestors) => {
      assert(fragments.has(id), `Missing support ${id}`); assert(!ancestors.has(id), `Cyclic support ${id}`);
      for (const next of fragments.get(id).requiredContext) visit(next, new Set([...ancestors, id]));
    };
    visit(f.id, new Set());
  }
  for (const item of [...a.exclusions, ...a.languageDiagnostics]) {
    assert(!a.occurrences.some(o => o.range.start.offset < item.range.end.offset && o.range.end.offset > item.range.start.offset), 'Excluded/diagnosed source leaked an occurrence');
  }
  for (const d of a.languageDiagnostics) {
    assert.equal(d.code, 'markdown-trace.language.malformed-expression');
    assert.equal(d.severity, 'error'); ownerCheck(d.owners);
  }
  const partial = a.languageDiagnostics.length > 0 || a.relationships.some(r => r.owners.length !== 1);
  assert.equal(a.coverage, partial ? 'partial' : 'complete');
  for (const observation of a.integrityObservations) {
    for (const id of observation.occurrenceIds ?? []) assert(occurrences.has(id));
    ownerCheck(observation.declarationIds ?? []);
  }
  return { a, text, ids, occurrences, fragments, relationships };
}
