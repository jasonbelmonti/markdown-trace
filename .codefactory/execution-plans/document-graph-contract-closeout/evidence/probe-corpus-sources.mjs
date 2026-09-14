// Feasibility only: public Markdown Engine source maps, never Trace interpretation.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { parse, normalize, documentQueries } from '@jasonbelmonti/markdown-engine';
const base = 'docs/design/document-graph-api/examples/corpus';
const manifest = JSON.parse(readFileSync(`${base}/manifest.json`, 'utf8'));
const results = [], seen = new Set();
for (const entry of [...manifest.cases, ...manifest.scenarios]) {
  for (const item of [entry, ...(entry.additionalSources ?? [])]) {
    const file = resolve(base, item.source);
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, 'utf8');
    assert.equal(createHash('sha256').update(text).digest('hex'), item.sourceSha256);
    const parsed = parse(text, { path: item.source });
    const normalized = normalize(parsed.parsed);
    const nodes = documentQueries.nodes(normalized.document).filter(n => n.source);
    for (const node of nodes) {
      const { start, end } = node.source.range;
      assert.equal(text.slice(start.offset, end.offset), node.source.text);
      for (const point of [start, end]) {
        const prefix = text.slice(0, point.offset);
        assert.equal(point.line, prefix.split('\n').length);
        assert.equal(point.column, point.offset - prefix.lastIndexOf('\n'));
      }
    }
    const diagnostics = [...parsed.diagnostics, ...normalized.diagnostics];
    assert.deepEqual(diagnostics, [], item.source);
    results.push({ source: item.source, sha256: item.sourceSha256, rawSlices: nodes.length, diagnostics });
  }
}
console.log(JSON.stringify({ status: 'pass', parserVersion: '3.5.0', sourceCount: results.length, scope: 'Public parser/source-map feasibility only; no Trace recognition, ownership, queries or context executed', sources: results }, null, 2));
