import assert from 'node:assert/strict';

// Cross-check authored report obligations against frozen facts; no source interpretation.
export function checkValidation(operation, s, profiles) {
  const p = profiles[operation.arguments.profile]; assert(p);
  const report = operation.expected.value; assert.equal(operation.expected.ok, true);
  assert.equal(report.schemaVersion, 'markdown-trace.document-validation.v1');
  assert.equal(report.analysisId, s.analysisId); assert.equal(report.interpretationHash, s.interpretationHash);
  assert.equal(report.validationHash, `@validation:${operation.arguments.profile}`); assert.equal(report.profileId, p.profileId);
  const ids = new Map(s.identifiers.map(i => [i.identifier, i])), os = new Map(s.occurrences.map(o => [o.id, o]));
  const entities = s.identifiers.filter(i => i.definition.status === 'resolved' && i.entityKind !== null);
  const partial = s.coverage === 'partial', expected = [];
  const observation = (code, identifiers, sourceRanges) => ({ code, identifiers, sourceRanges });
  const add = (ruleId, count, observations, status) => expected.push({ ruleId, count, observations, status: status ?? (observations.length ? 'fail' : 'pass') });
  const language = s.diagnostics.filter(d => !d.code.endsWith('unowned-reference') && !d.code.endsWith('ambiguous-reference'));
  const languageStatus = language.some(d => d.code.endsWith('malformed-expression')) ? 'fail' : language.some(d => d.severity === 'error') ? 'indeterminate' : 'pass';
  add('integrity.language', language.length, language.map(d => observation(d.code, d.identifiers, d.sourceRanges)), languageStatus);
  const defined = s.identifiers.filter(i => i.definition.status !== 'missing');
  add('integrity.definitions', defined.length, defined.filter(i => i.definition.status === 'duplicate').map(i =>
    observation('markdown-trace.integrity.duplicate-definition', [i.identifier], i.definition.occurrenceIds.map(id => os.get(id).range))));
  const references = s.relationships;
  const edgeFindings = (predicate, code) => references.filter(predicate).map(r => observation(code, [r.target], [os.get(r.occurrenceId).range]));
  add('integrity.targets', references.length, edgeFindings(r => ids.get(r.target).definition.status !== 'resolved', 'markdown-trace.integrity.unresolved-target'));
  add('integrity.kinds', ids.size, s.identifiers.filter(i => i.entityKind === null).map(i =>
    observation('markdown-trace.integrity.unknown-kind', [i.identifier], s.occurrences.filter(o => o.identifier === i.identifier).map(o => o.range))));
  add('integrity.owners', references.length, edgeFindings(r => r.source.status !== 'owned', 'markdown-trace.integrity.unresolved-owner'));
  const countStatus = (n, min, max) => max !== null && n > max ? 'fail' : n < min
    ? (partial ? 'indeterminate' : 'fail') : partial && max !== null ? 'indeterminate' : 'pass';
  const minStatus = countStatus(entities.length, p.validation.minEntities, null);
  add('policy.minEntities', entities.length, minStatus === 'fail' ? [observation('markdown-trace.policy.min-entities', [], [])] : [], minStatus);
  let unknown = false;
  const forbidden = [];
  for (const r of references) {
    const source = r.source.status === 'owned' ? ids.get(r.source.identifier) : null, target = ids.get(r.target);
    if (!source?.entityKind || !target.entityKind) { unknown = true; continue; }
    if (!p.validation.allowedRelations.some(a => a.kind === r.kind && a.from.includes(source.entityKind) && a.to.includes(target.entityKind)))
      forbidden.push(observation('markdown-trace.policy.forbidden-relation', [source.identifier, target.identifier], [os.get(r.occurrenceId).range]));
  }
  add('policy.allowedRelations', references.length, forbidden, forbidden.length ? 'fail' : unknown ? 'indeterminate' : 'pass');
  for (const rule of p.validation.rules) {
    const selected = entities.filter(i => (rule.kinds ?? rule.sourceKinds).includes(i.entityKind));
    const ruleId = `profile.${rule.id}`;
    if (rule.op === 'entity-count') {
      const status = countStatus(selected.length, rule.min, rule.max);
      add(ruleId, selected.length, status === 'fail' ? [observation('markdown-trace.profile.entity-count', [], [])] : [], status);
    } else {
      assert.equal(rule.op, 'require-relation');
      const failures = [], states = [];
      for (const source of selected) {
        const targets = new Set(references.filter(r => r.source.status === 'owned' && r.source.identifier === source.identifier && r.kind === rule.relation
          && ids.get(r.target).definition.status === 'resolved' && rule.targetKinds.includes(ids.get(r.target).entityKind)).map(r => r.target));
        const state = countStatus(targets.size, rule.minTargets, rule.maxTargets); states.push(state);
        if (state === 'fail') failures.push(observation('markdown-trace.profile.require-relation', [source.identifier], [os.get(source.definition.occurrenceId).range]));
      }
      add(ruleId, selected.length, failures, !selected.length ? 'not-applicable' : states.includes('fail') ? 'fail' : states.includes('indeterminate') ? 'indeterminate' : 'pass');
    }
  }
  assert.deepEqual(report.ruleResults.map(r => r.ruleId), expected.map(r => r.ruleId), 'Missing or reordered obligations');
  for (const [i, obligation] of expected.entries()) {
    const r = report.ruleResults[i]; assert.equal(r.status, obligation.status, obligation.ruleId);
    assert.equal(r.matchedSubjects, obligation.count); assert.equal(r.evaluatedSubjects, obligation.count);
    assert.deepEqual(r.diagnostics.map(({ code, identifiers, sourceRanges }) => ({ code, identifiers, sourceRanges })), obligation.observations);
    for (const d of r.diagnostics) { assert.equal(d.ruleId, r.ruleId); assert.equal(d.severity, d.code === 'markdown-engine.parser.warning' ? 'warning' : 'error'); assert(typeof d.message === 'string' && d.message.length); }
  }
  const diagnostics = report.ruleResults.flatMap(r => r.diagnostics).sort((a, b) =>
    (a.sourceRanges[0]?.start.offset ?? -1) - (b.sourceRanges[0]?.start.offset ?? -1) || a.ruleId.localeCompare(b.ruleId) || a.code.localeCompare(b.code));
  assert.deepEqual(report.diagnostics, diagnostics);
  assert.equal(report.status, expected.some(r => r.status === 'fail') ? 'fail' : partial || expected.some(r => r.status === 'indeterminate') ? 'indeterminate' : 'pass');
}
