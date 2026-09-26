import { run } from "./process.mjs";

export function runGraphApiSmoke(consumerDirectory, specifier) {
  const program = `
    import assert from 'node:assert/strict';
    import * as graph from ${JSON.stringify(specifier)};
    assert.deepEqual(Object.keys(graph).sort(), [
      'analyzeDocument', 'checkCorpusSelection', 'compileProfile', 'compileValidationProfile', 'createCorpus', 'exportMermaid', 'extractContext', 'findCorpusIncoming', 'findCorpusOutgoing', 'findIncoming', 'findOutgoing', 'lookupCorpusIdentifier', 'lookupIdentifier', 'traverseCorpus', 'traverseGraph', 'validateGraph'
    ]);
    const unwrap = result => { assert.equal(result.ok, true); return result.value; };
    const profile = unwrap(graph.compileProfile({
      schemaVersion: 'markdown-trace.document-profile.v1', profileId: 'consumer',
      interpretation: { language: 'markdown-trace.identity.draft2', entityKinds: [
        {name: 'requirement', prefixes: ['REQ']}, {name: 'work', prefixes: ['WP']}
      ] },
      validation: { minEntities: 0, allowedRelations: [], rules: [] }
    }));
    const text = '# Requirement [REQ-1](ctx://trace/entity/REQ-1?role=definition)\\n\\n- [WP-1](ctx://trace/entity/WP-1?role=definition) [REQ-1](ctx://trace/entity/REQ-1?rel=implements)';
    const analysis = unwrap(graph.analyzeDocument({documentId: 'spec.md', text}, profile,
      {maxSourceUtf8Bytes: 1000, maxOccurrences: 100}));
    assert.equal(analysis.snapshot.coverage, 'complete');
    assert.equal(analysis.snapshot.parserVersion, '3.6.0');
    assert.equal(unwrap(graph.lookupIdentifier(analysis, 'REQ-1')).referenceCount, 1);
    const incoming = unwrap(graph.findIncoming(analysis, 'REQ-1'));
    const outgoing = unwrap(graph.findOutgoing(analysis, 'WP-1'));
    assert.deepEqual(incoming.items, outgoing.items);
    const match = incoming.items[0];
    assert.equal(match.relationship.source.identifier, 'WP-1');
    assert.equal(match.relationship.kind, 'implements');
    const selection = unwrap(graph.traverseGraph(analysis, {
      roots: ['WP-1'], direction: 'outgoing', relations: ['implements'],
      maxDepth: 1, maxNodes: 2,
    }));
    assert.deepEqual(selection.nodes.map(node => [node.identifier, node.depth, node.via?.relationshipId ?? null]),
      [['WP-1', 0, null], ['REQ-1', 1, match.relationship.id]]);
    assert.deepEqual(selection.boundary,
      {depthLimited: false, nodeLimited: false, unresolvedRelationships: 0});
    assert.equal(selection.analysisId, analysis.snapshot.analysisId);
    assert.equal(Object.isFrozen(selection.nodes), true);
    const mermaid = graph.exportMermaid(analysis.snapshot);
    assert.ok(mermaid.includes('n0["REQ-1"]'));
    assert.ok(mermaid.includes('n1["WP-1"]'));
    assert.ok(mermaid.includes('n1 -->|"implements"| n0'));
    assert.equal(graph.exportMermaid(JSON.parse(JSON.stringify(analysis.snapshot))), mermaid);
    assert.equal(text.slice(match.occurrence.range.start.offset, match.occurrence.range.end.offset), '[REQ-1](ctx://trace/entity/REQ-1?rel=implements)');
    const policy = {
      schemaVersion: 'markdown-trace.validation-profile.experimental.v1', profileId: 'consumer-validation',
      interpretation: { language: 'markdown-trace.identity.draft2', entityKinds: [
        {name: 'requirement', prefixes: ['REQ']}, {name: 'work', prefixes: ['WP']}
      ] },
      validation: { minEntities: 2, allowedRelations: [{kind: 'implements', from: ['work'], to: ['requirement']}], rules: [
        {id: 'implemented', op: 'require-relation', kinds: ['requirement'], direction: 'incoming', relation: 'implements', relatedKinds: ['work'], min: 1, max: null},
        {id: 'source-links', op: 'references', relation: 'implements', select: {target: 'node', nodeType: 'listItem'}, min: 1, max: 1, minSelections: 1, matchText: false, exclusive: true}
      ] }
    };
    const validator = unwrap(graph.compileValidationProfile(JSON.stringify(policy)));
    const before = JSON.stringify(analysis.snapshot);
    assert.equal(unwrap(graph.validateGraph(analysis, validator)).status, 'pass');
    policy.validation.rules[0].min = 2;
    const stricter = unwrap(graph.compileValidationProfile(JSON.stringify(policy)));
    const failed = unwrap(graph.validateGraph(analysis, stricter));
    assert.equal(failed.status, 'fail');
    assert.equal(failed.diagnostics[0].ruleId, 'implemented');
    assert.equal(JSON.stringify(analysis.snapshot), before);
    assert.equal(unwrap(graph.findIncoming(analysis, 'REQ-1')).totalMatches, 1);
  `;
  run(process.execPath, ["--input-type=module", "--eval", program], {
    cwd: consumerDirectory,
  });
}
