import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  compileValidationProfile,
  createCorpus,
  extractContext,
  traverseCorpus,
  checkCorpusSelection,
  validateGraph,
  type CorpusBinding,
  type CorpusCapture,
  type CorpusOutcome,
  type CorpusSelection,
  type DocumentAnalysis,
  type DocumentCorpus,
  type QualifiedEntity,
} from "../src/markdowntrace/document-graph/index.js";

const profileInput = JSON.parse(readFileSync("fixtures/document-graph/profile.json", "utf8"));
const profileResult = compileProfile(profileInput);
if (!profileResult.ok) throw new Error("profile fixture did not compile");
const profile = profileResult.value;
const validationResult = compileValidationProfile(JSON.stringify({
  schemaVersion: "markdown-trace.validation-profile.experimental.v1",
  profileId: "corpus-traversal",
  interpretation: profileInput.interpretation,
  validation: { minEntities: 1, allowedRelations: [], rules: [] },
}));
if (!validationResult.ok) throw new Error("validation fixture did not compile");
const validationProfile = validationResult.value;

const declaration = (id: string) => `[${id}](ctx://trace/entity/${id}?role=definition)`;
const reference = (id: string) => `[${id}](ctx://trace/entity/${id}?rel=depends-on)`;
const analyze = (documentId: string, id: string, refs: string[] = []): DocumentAnalysis => {
  const text = [`# ${declaration(id)}`, refs.map(reference).join(" ")].filter(Boolean).join("\n\n");
  const result = analyzeDocument({ documentId, text }, profile, { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const capture = (analysis: DocumentAnalysis, alias: string): CorpusCapture => ({
  alias,
  analysis,
  expected: { analysisId: analysis.snapshot.analysisId, source: { ...analysis.snapshot.source } },
});
const makeCorpus = (analyses: DocumentAnalysis[], bindings: CorpusBinding[] = []): DocumentCorpus => {
  const result = createCorpus({
    captures: analyses.map((analysis, index) => capture(analysis, `capture-${index}`)),
    bindings,
    limits: { maxCaptures: 20, maxBindings: 100, maxSourceUtf8Bytes: 100_000 },
  });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const value = <T>(result: CorpusOutcome<T>): T => {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const entity = (analysis: DocumentAnalysis, identifier: string): QualifiedEntity => ({ analysisId: analysis.snapshot.analysisId, identifier });
const bind = (source: DocumentAnalysis, occurrenceId: string, target: DocumentAnalysis, identifier: string): CorpusBinding => ({
  source: { analysisId: source.snapshot.analysisId, occurrenceId }, target: entity(target, identifier),
});
const query = (roots: readonly [QualifiedEntity, ...QualifiedEntity[]], direction: "incoming" | "outgoing" | "both" = "outgoing", maxDepth = 8, maxNodes = 20) => ({ roots, direction, maxDepth, maxNodes });
const evidence = (selection: CorpusSelection) => selection.nodes.map((node) => [
  node.entity.identifier, node.depth, node.via?.from.identifier ?? null,
  node.via?.evidence.occurrenceId ?? null,
]);

describe("bounded corpus traversal", () => {
  it("uses canonical qualified BFS and occurrence predecessors across a diamond and cycle", () => {
    const a = analyze("a.md", "WP-A", ["WP-B", "WP-C", "WP-B", "WP-A"]);
    const b = analyze("b.md", "WP-B", ["WP-D"]);
    const c = analyze("c.md", "WP-C", ["WP-D"]);
    const d = analyze("d.md", "WP-D", ["WP-A"]);
    const corpus = makeCorpus([a, b, c, d], [
      bind(a, "O2", b, "WP-B"), bind(a, "O3", c, "WP-C"), bind(a, "O4", b, "WP-B"),
      bind(b, "O2", d, "WP-D"), bind(c, "O2", d, "WP-D"), bind(d, "O2", a, "WP-A"),
    ]);
    const before = analysesEvidence([a, b, c, d]);
    expect(JSON.parse(before[0]).validation.value.status).toBe("fail");
    const forward = value(traverseCorpus(corpus, query([entity(a, "WP-A")])));
    expect(evidence(forward)).toEqual([
      ["WP-A", 0, null, null], ["WP-B", 1, "WP-A", "O2"],
      ["WP-C", 1, "WP-A", "O3"], ["WP-D", 2, "WP-B", "O2"],
    ]);
    expect(forward.nodes[1].via?.evidence.analysisId).toBe(a.snapshot.analysisId);
    expect(forward.boundary).toEqual({ depthLimited: false, nodeLimited: false, unresolvedRelationships: 0 });
    const incoming = value(traverseCorpus(corpus, query([entity(d, "WP-D")], "incoming")));
    expect(evidence(incoming)).toEqual([
      ["WP-D", 0, null, null], ["WP-B", 1, "WP-D", "O2"],
      ["WP-C", 1, "WP-D", "O2"], ["WP-A", 2, "WP-B", "O2"],
    ]);
    expect(incoming.nodes.slice(1).map((node) => node.via?.evidence.analysisId)).toEqual([
      b.snapshot.analysisId, c.snapshot.analysisId, a.snapshot.analysisId,
    ]);
    expect(evidence(value(traverseCorpus(corpus, query([entity(a, "WP-A")], "both"))))).toEqual([
      ["WP-A", 0, null, null], ["WP-B", 1, "WP-A", "O2"],
      ["WP-C", 1, "WP-A", "O3"], ["WP-D", 1, "WP-A", "O2"],
    ]);
    const permuted = makeCorpus([d, c, b, a], [
      bind(d, "O2", a, "WP-A"), bind(c, "O2", d, "WP-D"), bind(b, "O2", d, "WP-D"),
      bind(a, "O4", b, "WP-B"), bind(a, "O3", c, "WP-C"), bind(a, "O2", b, "WP-B"),
    ]);
    expect(value(traverseCorpus(permuted, query([entity(a, "WP-A")]))).nodes).toEqual(forward.nodes);
    expect(analysesEvidence([a, b, c, d])).toEqual(before);
  });

  it("deduplicates roots and examined evidence, and reports filtered depth and node bounds", () => {
    const a = analyze("a.md", "WP-A", ["WP-B", "WP-B", "WP-A", "WP-MISSING"]);
    const b = analyze("b.md", "WP-B", ["WP-C"]);
    const c = analyze("c.md", "WP-C");
    const corpus = makeCorpus([a, b, c], [bind(a, "O2", b, "WP-B"), bind(a, "O3", b, "WP-B"), bind(b, "O2", c, "WP-C")]);
    const root = entity(a, "WP-A");
    const unrestricted = value(traverseCorpus(corpus, query([root, root], "both")));
    expect(unrestricted.query.roots).toEqual([root]);
    expect(unrestricted.nodes.map((node) => node.entity.identifier)).toEqual(["WP-A", "WP-B", "WP-C"]);
    expect(unrestricted.boundary.unresolvedRelationships).toBe(1);
    expect(value(traverseCorpus(corpus, query([root], "outgoing", 0))).boundary).toEqual({
      depthLimited: true, nodeLimited: false, unresolvedRelationships: 1,
    });
    expect(value(traverseCorpus(corpus, query([root], "outgoing", 8, 1))).boundary).toEqual({
      depthLimited: false, nodeLimited: true, unresolvedRelationships: 1,
    });
    expect(value(traverseCorpus(corpus, query([root], "outgoing", 0, 1))).boundary).toEqual({
      depthLimited: true, nodeLimited: true, unresolvedRelationships: 1,
    });
    expect(value(traverseCorpus(corpus, query([root], "outgoing", 8, 3))).boundary).toEqual({
      depthLimited: false, nodeLimited: false, unresolvedRelationships: 1,
    });
    expect(value(traverseCorpus(corpus, { ...query([root]), relations: [] })).nodes).toHaveLength(1);
    expect(value(traverseCorpus(corpus, { ...query([root]), relations: ["implements"] })).nodes).toHaveLength(1);
    expect(value(traverseCorpus(corpus, { ...query([root]), relations: ["depends-on"] })).nodes).toHaveLength(3);

    const conflict = makeCorpus([a, b, c], [
      bind(a, "O2", b, "WP-B"), bind(a, "O3", b, "WP-B"),
      bind(a, "O4", a, "WP-A"), bind(a, "O4", b, "WP-B"), bind(b, "O2", c, "WP-C"),
    ]);
    expect(value(traverseCorpus(conflict, query([root], "both"))).boundary.unresolvedRelationships).toBe(2);
    expect(value(traverseCorpus(conflict, query([root], "incoming"))).boundary.unresolvedRelationships).toBe(1);
  });

  it("rejects malformed and unresolved roots, copied or stale selections, and local projection", () => {
    const a = analyze("a.md", "WP-A", ["WP-B"]);
    const b = analyze("b.md", "WP-B");
    const unresolved = analyze("unresolved.md", "WP-X", ["WP-NOPE"]);
    const corpus = makeCorpus([a, b], [bind(a, "O2", b, "WP-B")]);
    const selected = value(traverseCorpus(corpus, query([entity(a, "WP-A")])));
    expect(checkCorpusSelection(corpus, selected)).toEqual({ ok: true, value: selected });
    expect(checkCorpusSelection(corpus, JSON.parse(JSON.stringify(selected)) as CorpusSelection)).toMatchObject({ ok: false, error: { code: "invalid-selection" } });
    const otherCorpus = makeCorpus([a, b], []);
    expect(checkCorpusSelection(otherCorpus, selected)).toMatchObject({ ok: false, error: { code: "stale-selection" } });
    const equivalent = makeCorpus([a, b], [bind(a, "O2", b, "WP-B")]);
    const compatible = checkCorpusSelection(equivalent, selected);
    expect(compatible).toEqual({ ok: true, value: selected });
    if (compatible.ok) expect(compatible.value).toBe(selected);
    expect(checkCorpusSelection(JSON.parse(JSON.stringify(corpus)) as DocumentCorpus, selected)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(extractContext(a, { selection: selected as never, budget: { maxUtf8Bytes: 10_000, maxFragments: 10 } })).toMatchObject({ ok: false, error: { code: "invalid-selection" } });
    expect(traverseCorpus(corpus, { ...query([entity(a, "WP-A")]), roots: [] } as never)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(traverseCorpus(corpus, { ...query([entity(a, "WP-A")]), maxDepth: 0.5 } as never)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(traverseCorpus(corpus, { ...query([entity(a, "WP-A")]), maxNodes: 0 } as never)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(traverseCorpus(corpus, { ...query([entity(a, "WP-A")]), extra: true } as never)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(traverseCorpus(corpus, query([entity(unresolved, "WP-X")]))).toMatchObject({ ok: false, error: { code: "unresolved-root" } });
    expect(traverseCorpus(corpus, query([entity(a, "WP-MISSING")]))).toMatchObject({ ok: false, error: { code: "unresolved-root" } });
    expect(Object.isFrozen(selected.nodes[0].entity)).toBe(true);
    const sameId = analyze("z.md", "WP-A");
    const roots: [QualifiedEntity, ...QualifiedEntity[]] = [entity(sameId, "WP-A"), entity(a, "WP-A")];
    const relations = ["depends-on"];
    const rootPermuted = value(traverseCorpus(makeCorpus([sameId, a, b], [bind(a, "O2", b, "WP-B")]), {
      roots, direction: "outgoing", relations, maxDepth: 1, maxNodes: 3,
    }));
    expect(rootPermuted.query.roots.map((root) => root.analysisId)).toEqual([a.snapshot.analysisId, sameId.snapshot.analysisId]);
    expect(rootPermuted.nodes.slice(0, 2).map((node) => node.entity.analysisId)).toEqual([a.snapshot.analysisId, sameId.snapshot.analysisId]);
    expect(Object.isFrozen(roots)).toBe(false);
    expect(Object.isFrozen(relations)).toBe(false);
    roots.reverse(); relations.pop();
    expect(rootPermuted.query.roots.map((root) => root.analysisId)).toEqual([a.snapshot.analysisId, sameId.snapshot.analysisId]);
  });
});

function analysesEvidence(analyses: DocumentAnalysis[]): string[] {
  return analyses.map((analysis) => {
    const localReport = validateGraph(analysis, validationProfile);
    return JSON.stringify({ snapshot: analysis.snapshot, validation: localReport });
  });
}
