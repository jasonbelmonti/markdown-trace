import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { corpusUrl, readJson, sha256, keyBy } from './source.mjs';
import { checkCoverage } from './coverage.mjs';

export const requiredCases = [
  ...Array.from({ length: 55 }, (_, i) => `LANG-${String(i + 1).padStart(2, '0')}`),
  'CASE-1', 'CASE-2', 'CASE-2D', 'CASE-3', 'CASE-3A', 'CASE-4', 'CASE-5', 'CASE-5A', 'CASE-6', 'CASE-7', 'CASE-8',
  'CASE-9', 'CASE-9D', 'CASE-9N', 'CASE-9C', 'CASE-10', 'CASE-11', 'CASE-11H', 'CASE-11Z', 'CASE-11A', 'CASE-11AZ', 'CASE-12', 'CASE-13', 'CASE-14',
];
export function loadCorpus(root = corpusUrl) {
  const manifest = readJson(new URL('manifest.json', root));
  const index = readJson(new URL(manifest.apiResultIndex, root));
  const resultRoot = new URL('./', new URL(manifest.apiResultIndex, root));
  const profiles = readJson(new URL(index.profiles, resultRoot));
  const lock = readJson(new URL('interpretation-lock.json', resultRoot));
  for (const input of lock.files) assert.equal(sha256(readFileSync(new URL(input.file, root))), input.sha256, `Reviewed interpretation changed: ${input.file}`);
  const annotations = new Map(), snapshots = new Map(), states = new Map(), records = new Map();
  for (const dir of ['language', 'scenarios']) for (const file of readdirSync(new URL(`${dir}/`, root))) {
    if (!file.endsWith('.expected.json')) continue;
    const path = `${dir}/${file}`, a = readJson(new URL(path, root));
    annotations.set(path, a);
  }
  for (const file of readdirSync(new URL('snapshots/', resultRoot))) {
    assert(file.endsWith('.json'));
    snapshots.set(`snapshots/${file}`, readJson(new URL(`snapshots/${file}`, resultRoot)));
  }
  for (const file of readdirSync(new URL('states/', resultRoot))) states.set(`states/${file}`, readJson(new URL(`states/${file}`, resultRoot)));
  for (const entry of index.cases) records.set(entry.caseId, readJson(new URL(entry.file, resultRoot)));
  return { root, manifest, index, profiles, annotations, snapshots, states, records };
}
export function checkInventory(c) {
  const cases = [...c.manifest.cases, ...c.manifest.scenarios];
  assert.equal(c.manifest.schemaVersion, 'markdown-trace.design-corpus.v1');
  assert.equal(c.index.schemaVersion, 'markdown-trace.design-api-index.v1');
  assert.deepEqual(cases.map(x => x.id), requiredCases);
  assert.deepEqual(c.index.caseIds, requiredCases);
  assert.deepEqual(c.index.cases.map(x => x.caseId), requiredCases);
  assert.deepEqual([...c.records.keys()], requiredCases);
  assert.equal(c.annotations.size, 81); assert.equal(c.snapshots.size, 66);
  assert.deepEqual([...c.states.keys()].sort(), ['states/partial.json', 'states/warning.json']);
  for (const entry of cases) {
    const original = c.annotations.get(entry.expected); assert(original, `Missing ${entry.expected}`);
    assert.equal(original.caseId, entry.id);
    assert.equal(sha256(readFileSync(new URL(entry.source, c.root))), entry.sourceSha256);
    assert.equal(original.source.sha256, entry.sourceSha256);
    const record = c.records.get(entry.id);
    assert.equal(record.schemaVersion, 'markdown-trace.design-api-results.v1'); assert.equal(record.caseId, entry.id);
    assert.equal(record.sourceSha256, entry.sourceSha256);
    assert.equal(record.annotation, original.annotationRef ?? entry.expected);
    assert.equal(entry.apiResults, `results/cases/${entry.id.toLowerCase()}.json`);
    const indexed = c.index.cases.find(x => x.caseId === entry.id);
    assert.equal(`results/${indexed.file}`, entry.apiResults);
    assert.deepEqual([...keyBy(record.operations).keys()], indexed.operationIds, `${entry.id} operation membership`);
    assert(record.operations.length > 0);
    const snapshot = c.snapshots.get(record.snapshot); assert(snapshot, `Missing snapshot ${record.snapshot}`);
    assert.equal(snapshot.source.sha256, entry.sourceSha256);
    checkCoverage(record, snapshot);
    for (const source of entry.additionalSources ?? []) {
      assert.equal(sha256(readFileSync(new URL(source.source, c.root))), source.sourceSha256);
      assert(Object.values(record.additionalSnapshots ?? {}).some(path => c.snapshots.get(path)?.source.sha256 === source.sourceSha256));
    }
  }
}
