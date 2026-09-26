import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export function proveContext(run, contract, source) {
  const spec = contract.context;
  const args = ["--format", "context", "--root", spec.root, "--direction", "outgoing",
    "--max-depth", String(spec.maxDepth), "--max-nodes", String(spec.maxNodes),
    "--max-fragments", String(spec.maxFragments)];
  const results = [];
  for (const [name, bytes] of [["context", spec.maxUtf8Bytes], ["context-omission", 0]]) {
    const { validation, context } = run([...args, "--max-utf8-bytes", String(bytes)]);
    assert.equal(validation.status, "pass");
    assert.equal(context.schemaVersion, "markdown-trace.document-context.v1");
    assert.equal(context.source.sha256, createHash("sha256").update(source).digest("hex"));
    assert.equal(context.source.utf8Bytes, Buffer.byteLength(source));
    assert.equal(context.source.utf16Length, source.length);
    assert.deepEqual(context.selection.nodes.map(node => node.identifier), spec.expectedIdentifiers);
    assert.deepEqual(context.selection.boundary, { depthLimited: false, nodeLimited: false, unresolvedRelationships: 0 });
    assert.deepEqual(context.parts.map(part => part.text), bytes === 0 ? [] : spec.expectedParts);
    for (const part of context.parts) {
      assert.equal(source.slice(part.range.start.offset, part.range.end.offset), part.text);
      assert.equal(part.range.start.offset, source.indexOf(part.text));
    }
    assert.deepEqual(context.includedIdentifiers, bytes === 0 ? [] : [...spec.expectedIdentifiers].sort());
    assert.deepEqual(context.omittedIdentifiers, bytes === 0
      ? [...spec.expectedIdentifiers].sort().map(identifier => ({ identifier, reason: "byte-budget" })) : []);
    assert.equal(context.usedUtf8Bytes, context.parts.reduce((total, part) => total + Buffer.byteLength(part.text), 0));
    assert.ok(context.usedUtf8Bytes <= bytes && context.parts.length <= spec.maxFragments);
    results.push({ case: name, passed: true, identifiers: context.includedIdentifiers,
      omissions: context.omittedIdentifiers, sourceSha256: context.source.sha256, usedUtf8Bytes: context.usedUtf8Bytes });
  }
  return results;
}
