import assert from 'node:assert/strict';

export const analysisSummary = s => ({ analysisId: s.analysisId, coverage: s.coverage, diagnosticCount: s.diagnostics.length });
export function checkSnapshot(s, graph) {
  const { a, text, occurrences } = graph;
  const owner = ids => ids.length === 0 ? { status: 'unowned' } : ids.length === 1
    ? { status: 'owned', identifier: occurrences.get(ids[0]).identifier, declarationId: ids[0] }
    : { status: 'ambiguous', declarationIds: ids };
  assert.equal(s.schemaVersion, 'markdown-trace.document-graph.v1');
  assert.equal(s.analysisId, `@analysis:${a.source.sha256}`);
  assert.equal(s.interpretationHash, '@interpretation:standard');
  assert.equal(s.analyzerVersion, '@analyzer-version');
  assert.equal(s.parserVersion, '3.5.0');
  assert.equal(s.coverage, a.coverage);
  assert.deepEqual(s.source, { documentId: a.source.file, sha256: a.source.sha256, utf8Bytes: Buffer.byteLength(text), utf16Length: text.length });
  assert.deepEqual(s.identifiers, a.identifiers.map(i => ({ identifier: i.identifier, entityKind: i.entityKind,
    definition: i.declarations.length === 0 ? { status: 'missing' } : i.declarations.length === 1
      ? { status: 'resolved', occurrenceId: i.declarations[0] } : { status: 'duplicate', occurrenceIds: i.declarations } })));
  assert.deepEqual(s.occurrences, a.occurrences.map(({ id, identifier, role, range, fragmentId }) => ({ id, identifier, role, range, fragmentId })));
  assert.deepEqual(s.relationships, a.relationships.map(r => ({ id: r.id, kind: r.kind, source: owner(r.owners), target: r.target, occurrenceId: r.occurrenceId })));
  assert.deepEqual(s.fragments, a.fragments.map(f => ({ id: f.id, range: f.range, owner: owner(f.owners), structure: f.structure, requiredContext: f.requiredContext })));
  assert.deepEqual(s.exclusions, a.exclusions.map(({ range, reason }) => ({ range, reason })));
  const diagnosticFacts = [
    ...a.languageDiagnostics.map(d => ({ code: d.code, identifiers: d.owners.map(id => occurrences.get(id).identifier), sourceRanges: [d.range] })),
    ...a.relationships.filter(r => r.owners.length !== 1).map(r => ({
      code: `markdown-trace.language.${r.owners.length ? 'ambiguous' : 'unowned'}-reference`,
      identifiers: [r.target], sourceRanges: [occurrences.get(r.occurrenceId).range],
    })),
  ].sort((x, y) => x.sourceRanges[0].start.offset - y.sourceRanges[0].start.offset || x.code.localeCompare(y.code));
  assert.deepEqual(s.diagnostics.map(({ code, identifiers, sourceRanges }) => ({ code, identifiers, sourceRanges })), diagnosticFacts);
  for (const d of s.diagnostics) { assert.equal(d.severity, 'error'); assert(typeof d.message === 'string' && d.message.length); }
}
