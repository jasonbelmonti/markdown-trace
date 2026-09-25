import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  extractContext,
  traverseGraph,
  type ContextBudget,
  type DocumentAnalysis,
  type GraphSelection,
  type Outcome,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(outcome: Outcome<T>): T {
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.error));
  return outcome.value;
}
const profile = value(compileProfile(JSON.parse(readFileSync("fixtures/document-graph/profile.json", "utf8"))));
const declaration = (id: string) => `[${id}](ctx://trace/entity/${id}?role=definition)`;
const parentBody = "Parent body. ".repeat(20).trim();
const sourceText = [
  `# ${declaration("WP-1")}`,
  parentBody,
  `## ${declaration("WP-2")}`,
  "Child body.",
].join("\n\n");
function analyze(text = sourceText): DocumentAnalysis {
  return value(analyzeDocument(
    { documentId: "context.md", text }, profile,
    { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 },
  ));
}
function select(analysis: DocumentAnalysis, roots: string[]): GraphSelection {
  return value(traverseGraph(analysis, {
    roots: roots as [string, ...string[]], direction: "outgoing", maxDepth: 0, maxNodes: roots.length,
  }));
}
const generous = { maxUtf8Bytes: 10_000, maxFragments: 100 };
function context(analysis: DocumentAnalysis, selection: GraphSelection, budget: ContextBudget = generous) {
  return value(extractContext(analysis, { selection, budget }));
}

describe("public source context projection", () => {
  it("returns exact owned parts without a child scope and preserves serialized provenance", () => {
    const analysis = analyze();
    const selection = select(analysis, ["WP-1"]);
    const result = context(analysis, selection);
    expect(result.parts.map((part) => part.text)).toEqual([
      `# ${declaration("WP-1")}`,
      parentBody,
    ]);
    expect(result.parts.map((part) => part.forIdentifiers)).toEqual([["WP-1"], ["WP-1"]]);
    expect(result.parts.map((part) => part.roles)).toEqual([["owned-content"], ["owned-content"]]);
    expect(result.includedIdentifiers).toEqual(["WP-1"]);
    expect(result.omittedIdentifiers).toEqual([]);
    for (const part of result.parts)
      expect(part.text).toBe(sourceText.slice(part.range.start.offset, part.range.end.offset));
    expect(result.usedUtf8Bytes).toBe(Buffer.byteLength(`# ${declaration("WP-1")}`) + Buffer.byteLength(parentBody));
    const serialized = JSON.parse(JSON.stringify(result));
    expect(serialized).toMatchObject({
      schemaVersion: "markdown-trace.document-context.v1",
      analysisId: analysis.snapshot.analysisId,
      source: analysis.snapshot.source,
      coverage: analysis.snapshot.coverage,
      diagnosticCount: analysis.snapshot.diagnostics.length,
      selection: { query: selection.query, nodes: selection.nodes, boundary: selection.boundary },
    });
    expect(Object.isFrozen(result.parts[0].range.start)).toBe(true);
  });

  it("admits entity bundles atomically, preserves support and continues after a budget omission", () => {
    const analysis = analyze();
    const selection = select(analysis, ["WP-1", "WP-2"]);
    const onlyChild = context(analysis, select(analysis, ["WP-2"]));
    expect(onlyChild.parts.map((part) => part.text)).toEqual([
      `# ${declaration("WP-1")}`,
      `## ${declaration("WP-2")}`,
      "Child body.",
    ]);
    expect(onlyChild.parts[0].roles).toEqual(["heading"]);
    const result = context(analysis, selection, {
      maxUtf8Bytes: onlyChild.usedUtf8Bytes,
      maxFragments: onlyChild.parts.length,
    });
    expect(result.includedIdentifiers).toEqual(["WP-2"]);
    expect(result.omittedIdentifiers).toEqual([{ identifier: "WP-1", reason: "byte-budget" }]);
    expect(result.parts).toEqual(onlyChild.parts);
    expect(context(analysis, selection, { maxUtf8Bytes: 0, maxFragments: 0 })).toMatchObject({
      parts: [], includedIdentifiers: [], usedUtf8Bytes: 0,
      omittedIdentifiers: [
        { identifier: "WP-1", reason: "byte-budget" },
        { identifier: "WP-2", reason: "byte-budget" },
      ],
    });
  });

  it("omits ambiguous definition ownership before evaluating zero budgets", () => {
    const text = `${declaration("WP-1")} ${declaration("WP-2")}`;
    const analysis = analyze(text);
    const result = context(analysis, select(analysis, ["WP-1", "WP-2"]), {
      maxUtf8Bytes: 0, maxFragments: 0,
    });
    expect(result.parts).toEqual([]);
    expect(result.includedIdentifiers).toEqual([]);
    expect(result.omittedIdentifiers).toEqual([
      expect.objectContaining({ identifier: "WP-1", reason: "ambiguous-ownership", declarationIds: ["O1", "O2"] }),
      expect.objectContaining({ identifier: "WP-2", reason: "ambiguous-ownership", declarationIds: ["O1", "O2"] }),
    ]);
    for (const omission of result.omittedIdentifiers)
      if (omission.reason === "ambiguous-ownership")
        expect(text.slice(omission.sourceRange.start.offset, omission.sourceRange.end.offset)).toBe(text);
  });

  it("rejects invalid ingress, fabricated selections and stale identities", () => {
    const analysis = analyze();
    const selection = select(analysis, ["WP-1"]);
    for (const budget of [
      { maxUtf8Bytes: -1, maxFragments: 1 },
      { maxUtf8Bytes: 0.5, maxFragments: 1 },
      { maxUtf8Bytes: Number.MAX_SAFE_INTEGER + 1, maxFragments: 1 },
      { maxUtf8Bytes: 1, maxFragments: -1 },
    ])
      expect(extractContext(analysis, { selection, budget })).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(extractContext(JSON.parse(JSON.stringify(analysis)), { selection, budget: generous })).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    expect(extractContext(analysis, {
      selection: JSON.parse(JSON.stringify(selection)), budget: generous,
    })).toMatchObject({ ok: false, error: { code: "invalid-selection" } });
    expect(extractContext(analyze(`${sourceText}\n`), { selection, budget: generous })).toMatchObject({
      ok: false, error: { code: "stale-selection" },
    });
    expect(context(analyze(), selection).parts.map((part) => part.text)).toEqual([
      `# ${declaration("WP-1")}`, parentBody,
    ]);
  });
});
