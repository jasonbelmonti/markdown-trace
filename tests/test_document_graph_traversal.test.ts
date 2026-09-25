import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  compileValidationProfile,
  findIncoming,
  findOutgoing,
  traverseGraph,
  validateGraph,
  type DocumentAnalysis,
  type Outcome,
  type TraversalQuery,
} from "../src/markdowntrace/document-graph/index.js";
import { issuedSelectionAnalysisId } from "../src/markdowntrace/document-graph/selection-state.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

const profileInput = JSON.parse(
  readFileSync("fixtures/document-graph/profile.json", "utf8"),
);
const profile = value(compileProfile(profileInput));
const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 10_000 };
function analyze(text: string): DocumentAnalysis {
  return value(analyzeDocument({ documentId: "selection.md", text }, profile, limits));
}
const declaration = (id: string) => `[${id}](ctx://trace/entity/${id}?role=definition)`;
const relation = (id: string, kind = "depends-on") =>
  `[${id}](ctx://trace/entity/${id}?rel=${kind})`;

// Source order gives R1 A->B, R2 A->C, R3 A->B, R4 A->A,
// R5 B->D, R6 C->D, R7 D->A. B->D wins D's shortest explanation.
const diamond = [
  `# ${declaration("WP-A")}`,
  `${relation("WP-B")} ${relation("WP-C")} ${relation("WP-B")} ${relation("WP-A")}`,
  `# ${declaration("WP-B")}`,
  relation("WP-D"),
  `# ${declaration("WP-C")}`,
  relation("WP-D"),
  `# ${declaration("WP-D")}`,
  relation("WP-A"),
].join("\n\n");
const query = (overrides: Partial<TraversalQuery> = {}): TraversalQuery => ({
  roots: ["WP-A"], direction: "outgoing", maxDepth: 3, maxNodes: 4,
  ...overrides,
});
const selected = (analysis: DocumentAnalysis, input = query()) =>
  value(traverseGraph(analysis, input));
const reasons = (analysis: DocumentAnalysis, input = query()) =>
  selected(analysis, input).nodes.map((node) => [
    node.identifier, node.depth, node.via?.from ?? null,
    node.via?.relationshipId ?? null,
  ]);

describe("bounded graph traversal", () => {
  it("chooses source-ordered shortest explanations across directions", () => {
    const analysis = analyze(diamond);
    expect(reasons(analysis)).toEqual([
      ["WP-A", 0, null, null],
      ["WP-B", 1, "WP-A", "R1"],
      ["WP-C", 1, "WP-A", "R2"],
      ["WP-D", 2, "WP-B", "R5"],
    ]);
    expect(reasons(analysis, query({ roots: ["WP-D"], direction: "incoming" }))).toEqual([
      ["WP-D", 0, null, null],
      ["WP-B", 1, "WP-D", "R5"],
      ["WP-C", 1, "WP-D", "R6"],
      ["WP-A", 2, "WP-B", "R1"],
    ]);
    expect(reasons(analysis, query({ direction: "both" }))).toEqual([
      ["WP-A", 0, null, null],
      ["WP-B", 1, "WP-A", "R1"],
      ["WP-C", 1, "WP-A", "R2"],
      ["WP-D", 1, "WP-A", "R7"],
    ]);
    const roots = selected(analysis, query({ roots: ["WP-D", "WP-A", "WP-D"] }));
    expect(roots.query.roots).toEqual(["WP-A", "WP-D"]);
    expect(roots.nodes.map((node) => [
      node.identifier, node.depth, node.via?.from ?? null, node.via?.relationshipId ?? null,
    ])).toEqual([
      ["WP-A", 0, null, null], ["WP-D", 0, null, null],
      ["WP-B", 1, "WP-A", "R1"], ["WP-C", 1, "WP-A", "R2"],
    ]);
    expect(roots.boundary).toEqual({
      depthLimited: false, nodeLimited: false, unresolvedRelationships: 0,
    });
  });

  it("keeps relation filtering explicit, including empty and unknown filters", () => {
    const analysis = analyze(diamond);
    for (const relations of [[], ["unknown-edge"]])
      expect(reasons(analysis, query({ relations }))).toEqual([["WP-A", 0, null, null]]);
    expect(reasons(analysis, query({ relations: ["depends-on"] }))).toEqual(reasons(analysis));
    expect(reasons(analysis, query({ relations: undefined }))).toEqual(reasons(analysis));
  });

  it("reports only examined depth and node boundaries", () => {
    const analysis = analyze(diamond);
    expect(selected(analysis, query({ maxDepth: 0 })).boundary).toEqual({
      depthLimited: true, nodeLimited: false, unresolvedRelationships: 0,
    });
    expect(selected(analysis, query({ maxDepth: 3, maxNodes: 1 })).boundary).toEqual({
      depthLimited: false, nodeLimited: true, unresolvedRelationships: 0,
    });
    expect(selected(analysis, query({ maxDepth: 0, maxNodes: 1 })).boundary).toEqual({
      depthLimited: true, nodeLimited: true, unresolvedRelationships: 0,
    });
    expect(selected(analysis, query({ maxDepth: 2, maxNodes: 4 })).boundary).toEqual({
      depthLimited: false, nodeLimited: false, unresolvedRelationships: 0,
    });
    expect(selected(analysis, query({ maxDepth: 1, maxNodes: 3 })).boundary).toEqual({
      depthLimited: true, nodeLimited: true, unresolvedRelationships: 0,
    });
    expect(reasons(analysis, query({ maxDepth: 1, maxNodes: 3 }))).toEqual([
      ["WP-A", 0, null, null], ["WP-B", 1, "WP-A", "R1"], ["WP-C", 1, "WP-A", "R2"],
    ]);

    const beyond = analyze([
      `# ${declaration("WP-A")}`, relation("WP-B"),
      `# ${declaration("WP-B")}`, relation("WP-MISSING"),
    ].join("\n\n"));
    expect(selected(beyond, query({ maxNodes: 1 })).boundary).toEqual({
      depthLimited: false, nodeLimited: true, unresolvedRelationships: 0,
    });
    expect(selected(beyond, query({ maxNodes: 2 })).boundary).toEqual({
      depthLimited: false, nodeLimited: false, unresolvedRelationships: 1,
    });
  });

  it("rejects malformed bounds, roots and non-issued analyses", () => {
    const analysis = analyze(diamond);
    for (const invalid of [
      { roots: [] }, { roots: ["WP-A", "WP-B"], maxNodes: 1 },
      { roots: ["wp-a"] }, { direction: "sideways" },
      { maxDepth: -1 }, { maxDepth: 0.5 }, { maxNodes: Number.MAX_SAFE_INTEGER + 1 },
      { relations: ["bad slug"] }, { relations: Array(1) }, { extra: true },
    ])
      expect(traverseGraph(analysis, { ...query(), ...invalid } as TraversalQuery)).toMatchObject({
        ok: false, error: { code: "invalid-input" },
      });
    expect(traverseGraph(JSON.parse(JSON.stringify(analysis)), query())).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    for (const root of ["WP-MISSING", "WP-DUPLICATE", "NEW-1"]) {
      const text = [
        `# ${declaration("WP-A")}`,
        relation("WP-MISSING"),
        `# ${declaration("WP-DUPLICATE")}`,
        `# ${declaration("WP-DUPLICATE")}`,
        `# ${declaration("NEW-1")}`,
      ].join("\n\n");
      expect(traverseGraph(analyze(text), query({ roots: [root] }))).toMatchObject({
        ok: false, error: { code: "unresolved-root" },
      });
    }
  });

  it("counts inspected unresolved edges without erasing direct-query evidence", () => {
    const text = [
      `# ${declaration("WP-A")}`,
      `${relation("WP-MISSING")} ${relation("WP-DUPLICATE")} ${relation("NEW-1")}`,
      `# ${declaration("WP-DUPLICATE")}`,
      `# ${declaration("WP-DUPLICATE")}`,
      `# ${declaration("NEW-1")}`,
    ].join("\n\n");
    const analysis = analyze(text);
    const before = JSON.stringify(analysis.snapshot);
    const outgoing = value(findOutgoing(analysis, "WP-A"));
    expect(outgoing.items.map((item) => item.relationship.id)).toEqual(["R1", "R2", "R3"]);
    expect(selected(analysis).nodes.map((node) => node.identifier)).toEqual(["WP-A"]);
    expect(selected(analysis).boundary).toEqual({
      depthLimited: false, nodeLimited: false, unresolvedRelationships: 3,
    });
    expect(value(findIncoming(analysis, "WP-DUPLICATE")).totalMatches).toBe(1);
    expect(value(findOutgoing(analysis, "WP-A"))).toEqual(outgoing);
    expect(JSON.stringify(analysis.snapshot)).toBe(before);

    const ambiguous = analyze([
      `# ${declaration("WP-A")}`,
      `${declaration("WP-B")} ${declaration("WP-C")} ${relation("WP-A")}`,
    ].join("\n\n"));
    expect(value(findIncoming(ambiguous, "WP-A")).items[0].relationship.source.status).toBe("ambiguous");
    expect(selected(ambiguous, query({ direction: "incoming" })).boundary.unresolvedRelationships).toBe(1);
  });

  it("traverses a resolved edge even when validation policy forbids its kind", () => {
    const analysis = analyze([`# ${declaration("WP-A")}`, relation("WP-B"), `# ${declaration("WP-B")}`].join("\n\n"));
    const policy = value(compileValidationProfile(JSON.stringify({
      schemaVersion: "markdown-trace.validation-profile.experimental.v1",
      profileId: "forbid-edge",
      interpretation: profileInput.interpretation,
      validation: { minEntities: 2, allowedRelations: [], rules: [] },
    })));
    expect(value(validateGraph(analysis, policy)).status).toBe("fail");
    expect(reasons(analysis)).toEqual([
      ["WP-A", 0, null, null], ["WP-B", 1, "WP-A", "R1"],
    ]);
  });

  it("returns detached immutable issued selections tied to analysis identity", () => {
    const analysis = analyze(diamond);
    const roots = ["WP-A"] as [string];
    const relations = ["depends-on"];
    const first = selected(analysis, query({ roots, relations }));
    roots[0] = "WP-D";
    relations.pop();
    expect(first.query.roots).toEqual(["WP-A"]);
    expect(first.query.relations).toEqual(["depends-on"]);
    expect(first.analysisId).toBe(analysis.snapshot.analysisId);
    expect(issuedSelectionAnalysisId(first)).toBe(first.analysisId);
    expect(issuedSelectionAnalysisId(JSON.parse(JSON.stringify(first)))).toBeUndefined();
    expect(() => (first.nodes as unknown as unknown[]).pop()).toThrow();
    expect(() => ((first.nodes[1].via as { from: string }).from = "WP-D")).toThrow();
    expect(selected(analysis)).toEqual(selected(analyze(diamond)));
    expect(selected(analyze(`${diamond}\n`)).analysisId).not.toBe(first.analysisId);
    const alternateProfile = value(compileProfile({
      ...profileInput,
      interpretation: {
        ...profileInput.interpretation,
        entityKinds: [...profileInput.interpretation.entityKinds, { name: "other", prefixes: ["OTHER"] }],
      },
    }));
    const alternate = value(analyzeDocument(
      { documentId: "selection.md", text: diamond }, alternateProfile, limits,
    ));
    expect(selected(alternate).analysisId).not.toBe(first.analysisId);
  });
});
