import assert from 'node:assert/strict';
import { checkDirect, checkTraversal } from './queries.mjs';
import { checkContext } from './context.mjs';
import { checkValidation } from './validation.mjs';

function admissionError(operation, snapshot, profiles, selections, additional) {
  const args = operation.arguments;
  if (operation.operation === 'compileProfile') {
    const input = args.input;
    if (input.schemaVersion !== 'markdown-trace.document-profile.v1') return 'unsupported-version';
    if (input.validation.rules.some(r => !['entity-count', 'require-relation'].includes(r.op))) return 'invalid-profile';
  }
  if (args.analysis === 'json-copy') return 'invalid-input';
  if (operation.operation === 'extractContext') {
    if (args.selection === 'json-copy') return 'invalid-selection';
    const selected = selections.get(args.selection); assert(selected, `Unknown selection ${args.selection}`);
    const analysis = args.analysis ? additional.get(args.analysis) : snapshot; assert(analysis, `Unknown analysis ${args.analysis}`);
    if (selected.analysisId !== analysis.analysisId) return 'stale-selection';
  }
  if (operation.operation === 'validateGraph') {
    assert(profiles[args.profile], `Unknown profile ${args.profile}`);
    if (args.profile === 'changed') return 'profile-mismatch';
  }
  if (operation.operation === 'analyzeDocument') {
    const l = args.limits;
    for (const value of Object.values(l)) assert(Number.isSafeInteger(value) && value > 0);
    if (snapshot.source.utf8Bytes > l.maxSourceUtf8Bytes || snapshot.occurrences.length > l.maxOccurrences) return 'analysis-limit';
  }
  return null;
}
export function checkOperations(record, snapshot, graph, profiles, additional) {
  const selections = new Map();
  for (const operation of record.operations) {
    try {
      const error = admissionError(operation, snapshot, profiles, selections, additional);
      if (error) {
        assert.equal(operation.expected.ok, false);
        const result = operation.expected.error;
        assert.equal(result.code, error); assert(typeof result.message === 'string' && result.message.length);
        if (operation.operation === 'compileProfile') {
          const operator = error === 'invalid-profile', field = operator ? 'validation.rules[0].op' : 'schemaVersion';
          assert.equal(result.diagnostics.length, 1);
          const d = result.diagnostics[0];
          assert.equal(d.code, `markdown-trace.profile.unsupported-${operator ? 'operator' : 'version'}`);
          assert.equal(d.severity, 'error'); assert(d.message.includes(field));
          assert.equal(d.ruleId, operator ? operation.arguments.input.validation.rules[0].id : undefined);
          assert.deepEqual(d.identifiers, []); assert.deepEqual(d.sourceRanges, []);
        } else assert.deepEqual(result.diagnostics, []);
        continue;
      }
      const selectedSnapshot = operation.arguments.analysis ? additional.get(operation.arguments.analysis) : snapshot;
      assert(selectedSnapshot, `Unknown analysis ${operation.arguments.analysis}`);
      switch (operation.operation) {
        case 'validateGraph': checkValidation(operation, selectedSnapshot, profiles); break;
        case 'lookupIdentifier': case 'findIncoming': case 'findOutgoing': checkDirect(operation, selectedSnapshot); break;
        case 'traverseGraph':
          checkTraversal(operation, selectedSnapshot);
          if (operation.expected.ok) selections.set(operation.id, operation.expected.value);
          else assert.deepEqual(operation.expected, { ok: false, error: { code: 'unresolved-root', message: 'unresolved-root', diagnostics: [] } });
          break;
        case 'extractContext': checkContext(operation, selectedSnapshot, graph, selections); break;
        case 'analyzeDocument': assert.deepEqual(operation.expected, { ok: true, value: { snapshot } }); break;
        case 'compileProfile':
          assert.deepEqual(operation.arguments.input, profiles.example);
          assert.deepEqual(operation.expected, { ok: true, value: { profileId: profiles.example.profileId,
            interpretationHash: '@interpretation:standard', validationHash: '@validation:example' } });
          break;
        default: assert.fail(`No check for operation ${operation.operation}`);
      }
    } catch (error) { error.message = `${record.caseId}/${operation.id}: ${error.message}`; throw error; }
  }
}
