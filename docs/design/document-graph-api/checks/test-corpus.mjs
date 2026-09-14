import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCorpus } from './corpus/inventory.mjs';
import { checkCorpus } from './corpus/run.mjs';
import { checkResultTypes } from './check-result-types.mjs';

const baseline = loadCorpus();
function copy() {
  return { root: baseline.root, ...structuredClone(Object.fromEntries(Object.entries(baseline).filter(([key]) => key !== 'root'))) };
}
const operation = (c, id, op) => c.records.get(id).operations.find(x => x.id === op);
const snapshot = (c, id) => c.snapshots.get(c.records.get(id).snapshot);
function rejects(name, corrupt) {
  test(`rejects ${name}`, () => { const c = copy(); corrupt(c); assert.throws(() => checkCorpus(c)); });
}
test('all 79 real corpus cases pass with explicit operation coverage', () => {
  const result = checkCorpus(copy());
  assert.equal(result.caseCount, 79); assert.equal(result.operationCount, 1183); assert.equal(result.sourceCount, 66);
});
rejects('a case removed from both inventories', c => {
  c.manifest.cases.shift(); c.index.caseIds.shift(); c.index.cases.shift(); c.records.delete('LANG-01');
});
rejects('a missing operation', c => { c.records.get('CASE-12').operations.pop(); });
rejects('an operation removed from the result and its index', c => {
  c.records.get('CASE-12').operations.pop(); c.index.cases.find(x => x.caseId === 'CASE-12').operationIds.pop();
});
rejects('missing input-mutation assertions', c => { delete c.records.get('CASE-14').inputMutation; });
rejects('missing injected incompleteness coverage', c => { delete c.records.get('CASE-13').injectedStates.partial; });
rejects('a dangling target promoted to a definition', c => {
  snapshot(c, 'CASE-2').identifiers.find(i => i.identifier === 'REQ-2').definition = { status: 'resolved', occurrenceId: 'O4' };
});
rejects('first-owner-wins ambiguity', c => {
  snapshot(c, 'CASE-3A').relationships[0].source = { status: 'owned', identifier: 'WP-1', declarationId: 'O1' };
});
rejects('missing occurrence evidence', c => { snapshot(c, 'CASE-9').occurrences.splice(5, 1); });
rejects('partial coverage represented as complete', c => { snapshot(c, 'CASE-3').coverage = 'complete'; });
rejects('an incorrect UTF-16 emoji offset', c => { snapshot(c, 'CASE-13').occurrences[3].range.start.offset--; });
rejects('a cyclic context dependency', c => { c.annotations.get('language/lang-44.expected.json').fragments[0].requiredContext.push('F2'); });
rejects('an omitted malformed diagnostic', c => { snapshot(c, 'LANG-45').diagnostics = []; });
rejects('lost dangling backlinks', c => { operation(c, 'CASE-2', 'incoming:REQ-2').expected.value.items.pop(); });
rejects('lost repeated reference count', c => { operation(c, 'CASE-9', 'lookup:REQ-2').expected.value.referenceCount--; });
rejects('a non-progressing page offset', c => { operation(c, 'CASE-9', 'page:0').expected.value.nextOffset = 0; });
rejects('an empty filter interpreted as all relations', c => {
  operation(c, 'CASE-9', 'filter:[]').expected = operation(c, 'CASE-9', 'incoming:REQ-2').expected;
});
rejects('validation policy erasing graph facts', c => { snapshot(c, 'CASE-4').relationships = []; });
rejects('a forbidden relation accepted by validation', c => {
  operation(c, 'CASE-4', 'validateGraph').expected.value.ruleResults.find(r => r.ruleId === 'policy.allowedRelations').status = 'pass';
});
rejects('an obligation silently skipped', c => { operation(c, 'CASE-2', 'validateGraph').expected.value.ruleResults.pop(); });
rejects('incorrect empty-document subject counts', c => {
  operation(c, 'CASE-5', 'validateGraph').expected.value.ruleResults.find(r => r.ruleId === 'profile.work-has-requirement').evaluatedSubjects = 1;
});
rejects('a hidden traversal node boundary', c => { operation(c, 'CASE-9N', 'selection').expected.value.boundary.nodeLimited = false; });
rejects('a noncanonical predecessor', c => { operation(c, 'CASE-9C', 'selection').expected.value.nodes[1].via.relationshipId = 'R3'; });
rejects('an unreported unresolved incident edge', c => { operation(c, 'CASE-3A', 'selection').expected.value.boundary.unresolvedRelationships = 0; });
rejects('descendant context leakage', c => {
  operation(c, 'LANG-44', 'context:REQ-1').expected.value.parts.push(operation(c, 'LANG-44', 'context:REQ-2').expected.value.parts[1]);
});
rejects('a missing required table header', c => { operation(c, 'CASE-11H', 'extractContext').expected.value.parts.splice(1, 1); });
rejects('incorrect context UTF-8 accounting', c => { operation(c, 'CASE-13', 'extractContext').expected.value.usedUtf8Bytes--; });
rejects('numeric budgets overriding ownership omission', c => {
  operation(c, 'CASE-11AZ', 'context:0').expected.value.omittedIdentifiers[0].reason = 'byte-budget';
});
rejects('a budget omission represented as partial admission', c => {
  operation(c, 'CASE-11H', 'fragment-limit').expected.value.includedIdentifiers = ['WP-2'];
});
rejects('stale selection accepted for changed source', c => {
  operation(c, 'CASE-10', 'extractContext').expected = operation(c, 'CASE-11', 'extractContext').expected;
});
rejects('a failed admission returning a snapshot', c => {
  operation(c, 'CASE-12', 'limit:0').expected = { ok: true, value: { snapshot: snapshot(c, 'CASE-12') } };
});
rejects('JSON-copied handles being treated as issued', c => {
  operation(c, 'CASE-14', 'lookupIdentifier').expected = operation(c, 'CASE-11', 'lookup:REQ-1').expected;
});
rejects('profile data diverging from its example', c => { c.profiles.example.validation.minEntities = 0; });
rejects('a compiler failure without a field diagnostic', c => { operation(c, 'CASE-6', 'operator').expected.error.diagnostics = []; });
test('all complete DTOs fit the existing declarations', () => assert.equal(checkResultTypes(copy()).status, 'pass'));
test('DTO checks reject an undeclared result field', () => {
  const c = copy(); operation(c, 'CASE-1', 'lookup:REQ-1').expected.value.unexpected = true;
  assert.throws(() => checkResultTypes(c));
});

rejects('incomplete analysis claimed valid', c => { operation(c, 'CASE-13', 'validation:partial').expected.value.status = 'pass'; });
rejects('parser warnings making coverage partial', c => { operation(c, 'CASE-13', 'incoming:warning').expected.value.coverage = 'partial'; });
