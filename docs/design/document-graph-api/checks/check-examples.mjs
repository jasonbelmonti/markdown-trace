import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const hash = text => createHash("sha256").update(text).digest("hex");
const ledger = JSON.parse(read("../examples/expectations.json"));
const source = read("../examples/mixed-layout.md");
assert.equal(hash(source), ledger.source.sha256);
assert.equal(Buffer.byteLength(source), ledger.source.utf8Bytes);
assert.equal(source.split("\n").length - 1, ledger.source.lineCount);
const index = items => {
  const result = new Map(items.map(item => [item.id ?? item.identifier, item]));
  assert.equal(result.size, items.length, "Ledger keys must be unique");
  return result;
};
const identifiers = index(ledger.identifiers);
const occurrences = index(ledger.occurrences);
const fragments = index(ledger.fragments);
const relationships = index(ledger.relationships);
const slice = range => source.slice(range.start.offset, range.end.offset);
for (const item of [...ledger.occurrences, ...ledger.fragments, ...ledger.exclusions]) {
  assert(item.range.start.offset < item.range.end.offset);
  assert(item.range.end.offset <= source.length);
  for (const point of [item.range.start, item.range.end]) {
    const prefix = source.slice(0, point.offset);
    assert.equal(point.line, prefix.split("\n").length);
    assert.equal(point.column, point.offset - prefix.lastIndexOf("\n"));
  }
}
for (const occurrence of occurrences.values()) {
  assert.equal(slice(occurrence.range), occurrence.sourceText);
  assert(identifiers.has(occurrence.identifier));
  const fragment = fragments.get(occurrence.fragmentId);
  assert(fragment.range.start.offset <= occurrence.range.start.offset);
  assert(fragment.range.end.offset >= occurrence.range.end.offset);
}
for (const identifier of identifiers.values()) {
  const definition = occurrences.get(identifier.definition);
  assert.equal(definition.role, "definition");
  assert.equal(definition.identifier, identifier.identifier);
}
for (const relation of relationships.values()) {
  const mention = occurrences.get(relation.occurrence);
  assert.equal(mention.role, "reference");
  assert.equal(mention.identifier, relation.target);
  assert.equal(occurrences.get(relation.declaration).identifier, relation.source);
  assert.equal(fragments.get(mention.fragmentId).owner, relation.source);
}
for (const [key, endpoint, identifier] of [
  ["incomingREQ1", "target", "REQ-1"], ["incomingREQ2", "target", "REQ-2"],
  ["incomingWP1", "target", "WP-1"], ["outgoingWP1", "source", "WP-1"],
]) {
  assert.deepEqual(ledger.queries[key], ledger.relationships.filter(edge => edge[endpoint] === identifier).map(edge => edge.id));
}
const selectedNodes = ledger.queries.outgoingWP1Depth1.nodes;
for (const node of selectedNodes) {
  if (node.via === null) { assert.equal(node.depth, 0); continue; }
  const edge = relationships.get(node.via);
  assert.equal(edge.target, node.identifier);
  assert.equal(selectedNodes.find(parent => parent.identifier === edge.source).depth + 1, node.depth);
}
for (const fragment of fragments.values()) {
  assert(fragment.owner === null || identifiers.has(fragment.owner));
  const visit = (id, path) => {
    assert(!path.includes(id), "Cyclic support dependency");
    for (const dependency of fragments.get(id).requiredContext) visit(dependency, [...path, id]);
  };
  visit(fragment.id, []);
}
for (const context of [ledger.queries.contextWP1Depth1, ledger.queries.contextWP2Depth0]) {
  const selected = context.parts.map(id => fragments.get(id));
  assert(selected.every(Boolean));
  assert(selected.every((part, i) => i === 0 || selected[i - 1].range.end.offset <= part.range.start.offset));
  for (const part of selected) for (const support of part.requiredContext) assert(context.parts.includes(support));
  for (const excluded of context.excludedFragments ?? []) assert(!context.parts.includes(excluded));
  if (context.usedUtf8Bytes !== undefined) {
    assert.equal(selected.reduce((sum, part) => sum + Buffer.byteLength(slice(part.range)), 0), context.usedUtf8Bytes);
  }
}
const inventory = JSON.parse(read("../examples/source-inventory.json"));
for (const item of inventory.sources) {
  const text = read(`../../../../${item.file}`);
  assert.equal(hash(text), item.sha256);
  assert.equal(Buffer.byteLength(text), item.utf8Bytes);
  assert.equal(text.split("\n").length - 1, item.lines);
}
console.log(JSON.stringify({ status: "pass", identifiers: identifiers.size, occurrences: occurrences.size,
  relationships: relationships.size, fragments: fragments.size, contextUtf8Bytes: ledger.queries.contextWP1Depth1.usedUtf8Bytes,
  scope: "Hand-authored ledger consistency only; no proposed API executed" }, null, 2));
