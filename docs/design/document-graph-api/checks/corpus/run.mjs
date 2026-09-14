import assert from 'node:assert/strict';
import { checkAnnotation } from './annotation.mjs';
import { checkSnapshot } from './snapshot.mjs';
import { checkInventory, loadCorpus } from './inventory.mjs';
import { checkOperations } from './operations.mjs';
import { checkProfiles } from './profiles.mjs';

function checkIdentities(c) {
  const snapshotFor = id => c.snapshots.get(c.records.get(id).snapshot);
  for (const record of c.records.values()) {
    const s = c.snapshots.get(record.snapshot), a = record.identityAssertions;
    if (!a) continue;
    if (a.sameSnapshotAs) {
      assert.deepEqual(s, snapshotFor(a.sameSnapshotAs));
      assert.equal(a.interpretationHash, s.interpretationHash);
      assert.equal(a.validationHash, '@validation:forbidden');
      assert.equal(a.differentValidationHashFrom, '@validation:example');
      assert.notEqual(a.validationHash, a.differentValidationHashFrom);
    }
    if (a.equivalentGraphTo) {
      const before = snapshotFor(a.equivalentGraphTo);
      assert.deepEqual(s.identifiers, before.identifiers); assert.deepEqual(s.relationships, before.relationships);
      assert.deepEqual(s.occurrences.map(({ range, ...o }) => o), before.occurrences.map(({ range, ...o }) => o));
      assert.notEqual(s.source.sha256, before.source.sha256); assert.notEqual(s.analysisId, before.analysisId);
    }
    if (record.inputMutation) {
      assert.equal(record.inputMutation.profile, 'example');
      assert.deepEqual(record.inputMutation.changes, { 'validation.allowedRelations': [], 'interpretation.entityKinds[0].prefixes': ['OTHER'] });
      assert.equal(a.compiledInterpretationHash, s.interpretationHash);
      assert.equal(a.compiledValidationHash, '@validation:example'); assert.equal(a.analysisId, s.analysisId);
      assert.equal(a.REQEntityKind, s.identifiers.find(i => i.identifier === 'REQ-1').entityKind);
      assert.equal(record.operations.find(o => o.operation === 'validateGraph').expected.value.status, 'pass');
    }
  }
}
export function checkCorpus(c = loadCorpus()) {
  checkInventory(c);
  checkProfiles(c.profiles);
  const graphs = new Map(), seenSnapshots = new Set();
  for (const [path, annotation] of c.annotations) {
    if (annotation.annotationRef) {
      const shared = c.annotations.get(annotation.annotationRef); assert(shared && !shared.annotationRef);
      assert.equal(shared.source.sha256, annotation.source.sha256);
    } else graphs.set(path, checkAnnotation(annotation, c.root));
  }
  const results = [];
  for (const record of c.records.values()) {
    const graph = graphs.get(record.annotation), snapshot = c.snapshots.get(record.snapshot); assert(graph);
    checkSnapshot(snapshot, graph); seenSnapshots.add(record.snapshot);
    const additional = new Map();
    for (const [alias, path] of Object.entries(record.additionalSnapshots ?? {})) {
      const s = c.snapshots.get(path); assert(s);
      const g = [...graphs.values()].find(g => g.a.source.sha256 === s.source.sha256); assert(g);
      checkSnapshot(s, g); additional.set(alias, s); seenSnapshots.add(path);
    }
    for (const [alias, input] of Object.entries(record.injectedStates ?? {})) {
      assert.equal(record.caseId, 'CASE-13'); assert(['partial', 'warning'].includes(alias));
      assert.equal(input.baseSnapshot, record.snapshot);
      const state = c.states.get(input.snapshot); assert(state);
      const partial = alias === 'partial';
      const code = partial ? 'markdown-trace.language.unsupported-node' : 'markdown-engine.parser.warning';
      assert.equal(input.finding, code);
      assert.deepEqual(state, { ...snapshot, analysisId: `@analysis:model-${alias}:${snapshot.source.sha256}`,
        parserVersion: `@parser:model-${alias}`, coverage: partial ? 'partial' : 'complete', diagnostics: [{
          code, severity: partial ? 'error' : 'warning', message: 'Injected dependency finding for API result contract; not a parse result of this source.', identifiers: [], sourceRanges: [],
        }] });
      additional.set(alias, state);
    }
    checkOperations(record, snapshot, graph, c.profiles, additional);
    results.push({ caseId: record.caseId, operations: record.operations.length, status: 'pass' });
  }
  assert.equal(seenSnapshots.size, c.snapshots.size, 'Unreviewed snapshot');
  checkIdentities(c);
  return { status: 'pass', caseCount: results.length, annotationCount: c.annotations.size, sourceCount: c.snapshots.size,
    modelStateCount: c.states.size, operationCount: results.reduce((n, r) => n + r.operations, 0), cases: results,
    scope: 'Checks independently authored design fixtures and DTO consistency; no proposed API or Markdown extraction runs.' };
}
