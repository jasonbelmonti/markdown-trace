// EP-ACT-2 mechanical integrity only. Never extract expected semantic facts from source.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const base = 'docs/design/document-graph-api/examples/corpus';
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');
const manifest = json(`${base}/manifest.json`);
const cases = [...manifest.cases, ...manifest.scenarios];
assert.equal(manifest.cases.length, 55);
assert.equal(manifest.scenarios.length, 24);
assert.equal(new Set(cases.map(c => c.id)).size, 79);
const checked = new Set();
let slices = 0;
function checkAnnotation(file) {
  if (checked.has(file)) return;
  checked.add(file);
  const a = json(file), text = readFileSync(resolve(base, a.source.file), 'utf8');
  assert.equal(hash(text), a.source.sha256, file);
  if (a.annotationRef) {
    const referred = json(resolve(base, a.annotationRef));
    assert.equal(referred.source.sha256, a.source.sha256, file);
    checkAnnotation(resolve(base, a.annotationRef));
    return;
  }
  assert.equal(Buffer.byteLength(text), a.source.utf8Bytes, file);
  assert.equal(text.length, a.source.utf16Length, file);
  function checkSlice(item) {
    const { start, end } = item.range;
    assert(start.offset >= 0 && end.offset > start.offset && end.offset <= text.length, file);
    for (const p of [start, end]) {
      const before = text.slice(0, p.offset).split('\n');
      assert.equal(p.line, before.length, file);
      assert.equal(p.column, before.at(-1).length + 1, file);
    }
    assert.equal(text.slice(start.offset, end.offset), item.sourceText, file);
    slices++;
  }
  const occurrences = new Map(a.occurrences.map(o => [o.id, o]));
  const fragments = new Map(a.fragments.map(f => [f.id, f]));
  assert.equal(occurrences.size, a.occurrences.length, file);
  assert.equal(fragments.size, a.fragments.length, file);
  for (const item of [...a.occurrences, ...a.fragments, ...a.exclusions, ...a.languageDiagnostics]) checkSlice(item);
  for (const o of a.occurrences) {
    const f = fragments.get(o.fragmentId);
    assert(f && f.range.start.offset <= o.range.start.offset && f.range.end.offset >= o.range.end.offset, `${file}: ${o.id}`);
  }
  for (const item of [...a.relationships, ...a.fragments, ...a.languageDiagnostics]) {
    assert.equal(new Set(item.owners).size, item.owners.length, file);
    for (const owner of item.owners) assert.equal(occurrences.get(owner)?.role, 'definition', file);
  }
  assert.equal(a.relationships.length, a.occurrences.filter(o => o.role === 'reference').length, file);
  for (const r of a.relationships) {
    const o = occurrences.get(r.occurrenceId);
    assert.equal(o?.role, 'reference', file);
    assert.equal(o.identifier, r.target, file);
    assert.deepEqual(r.owners, fragments.get(o.fragmentId).owners, file);
  }
  for (const f of a.fragments) for (const dependency of f.requiredContext) assert(fragments.has(dependency), file);
  for (const i of a.identifiers) {
    assert.deepEqual(i.declarations, a.occurrences.filter(o => o.identifier === i.identifier && o.role === 'definition').map(o => o.id), file);
  }
}
for (const c of cases) {
  assert.equal(hash(readFileSync(resolve(base, c.source))), c.sourceSha256, c.id);
  const expected = json(resolve(base, c.expected));
  assert.equal(expected.caseId, c.id);
  assert.equal(expected.source.sha256, c.sourceSha256);
  checkAnnotation(resolve(base, c.expected));
  for (const s of c.additionalSources ?? []) assert.equal(hash(readFileSync(resolve(base, s.source))), s.sourceSha256);
}
for (const dir of ['language', 'scenarios']) for (const file of readdirSync(`${base}/${dir}`)) {
  if (file.endsWith('.expected.json')) checkAnnotation(resolve(base, dir, file));
}
console.log(JSON.stringify({status: 'pass', cases: cases.map(c => c.id), annotations: checked.size, exactSlices: slices, scope: 'Materialization integrity only; no semantic extraction or API execution'}, null, 2));
