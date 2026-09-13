import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse, normalize, documentQueries } from "@jasonbelmonti/markdown-engine";

// A parser feasibility probe, not an implementation of the proposed language.
const source = [
  "# {#REQ-1} Access", "", "😀 requires REQ-2 and `REQ-3`.", "",
  "- {#WP-1} Apply {implements:REQ-1}.", "  - Also REQ-2.", "",
  "> {#VAL-1} Check {verifies:WP-1}.", "",
  "| ID | Ref |", "| --- | --- |", "| {#WP-2} | {implements:REQ-2} |", "",
  "```text", "REQ-999", "```", "",
].join("\r\n");
const parsed = parse(source, { path: "probe.md" });
const normalized = normalize(parsed.parsed);
const diagnostics = [...parsed.diagnostics, ...normalized.diagnostics];
assert.deepEqual(diagnostics, []);
const nodes = documentQueries.nodes(normalized.document);
const located = nodes.filter(node => node.source);
assert(located.length > 0);
for (const node of located) {
  const { start, end } = node.source.range;
  assert(Number.isSafeInteger(start.offset) && Number.isSafeInteger(end.offset));
  assert.equal(source.slice(start.offset, end.offset), node.source.text);
  for (const point of [start, end]) {
    const prefix = source.slice(0, point.offset);
    assert.equal(point.line, prefix.split("\n").length);
    assert.equal(point.column, point.offset - prefix.lastIndexOf("\n"));
  }
}
const codeLabel = nodes.find(node => node.type === "inlineCode" && node.text === "REQ-3");
assert.equal(codeLabel?.source?.text, "`REQ-3`");
const kinds = [...new Set(nodes.map(node => node.type))].sort();
for (const kind of ["heading", "paragraph", "listItem", "blockquote", "tableRow", "code"]) {
  assert(kinds.includes(kind), `Missing public node type: ${kind}`);
}
console.log(JSON.stringify({
  status: "pass", sourceSha256: createHash("sha256").update(source).digest("hex"),
  sourceUtf8Bytes: Buffer.byteLength(source), nodeCount: nodes.length,
  verifiedRawSlices: located.length, kinds, diagnostics,
  scope: "Public parser nodes/raw slices only; no graph extraction executed",
}, null, 2));
