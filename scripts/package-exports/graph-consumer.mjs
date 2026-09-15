import { run } from "./process.mjs";

export function runGraphApiSmoke(consumerDirectory, packageName) {
  const program = `
    import assert from 'node:assert/strict';
    import * as graph from ${JSON.stringify(`${packageName}/experimental/graph`)};
    assert.deepEqual(Object.keys(graph).sort(), [
      'analyzeDocument', 'compileProfile', 'findIncoming', 'findOutgoing', 'lookupIdentifier'
    ]);
    const unwrap = result => { assert.equal(result.ok, true); return result.value; };
    const profile = unwrap(graph.compileProfile({
      schemaVersion: 'markdown-trace.document-profile.v1', profileId: 'consumer',
      interpretation: { language: 'markdown-trace.identity.draft1', entityKinds: [
        {name: 'requirement', prefixes: ['REQ']}, {name: 'work', prefixes: ['WP']}
      ] },
      validation: { minEntities: 0, allowedRelations: [], rules: [] }
    }));
    const text = '# Requirement {#REQ-1}\\n\\n- {#WP-1} {implements:REQ-1}';
    const analysis = unwrap(graph.analyzeDocument({documentId: 'spec.md', text}, profile,
      {maxSourceUtf8Bytes: 1000, maxOccurrences: 100}));
    assert.equal(analysis.snapshot.coverage, 'complete');
    assert.equal(unwrap(graph.lookupIdentifier(analysis, 'REQ-1')).referenceCount, 1);
    const incoming = unwrap(graph.findIncoming(analysis, 'REQ-1'));
    const outgoing = unwrap(graph.findOutgoing(analysis, 'WP-1'));
    assert.deepEqual(incoming.items, outgoing.items);
    const match = incoming.items[0];
    assert.equal(match.relationship.source.identifier, 'WP-1');
    assert.equal(match.relationship.kind, 'implements');
    assert.equal(text.slice(match.occurrence.range.start.offset, match.occurrence.range.end.offset), '{implements:REQ-1}');
  `;
  run(process.execPath, ["--input-type=module", "--eval", program], {
    cwd: consumerDirectory,
  });
}
