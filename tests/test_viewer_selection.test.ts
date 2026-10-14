import { expect, it } from "vitest";
import { DEFAULT_VIEW, MAX_VIEW_EDGES, selectView } from "../src/markdowntrace/document-graph/viewer/selection.js";
import type { ViewerEntity, ViewerRelation, ViewOptions } from "../src/markdowntrace/document-graph/viewer/contracts.js";

const entities: ViewerEntity[] = [
  ["OPT-1", "option"], ["OPT-2", "option"], ["DEC-1", "decision"], ["RISK-1", "risk"],
  ["VAL-1", "validation"], ["CTX-1", "context"], ["Q-1", "question"],
].map(([id, kind]) => ({ id, kind, label: id, heading: id === "CTX-1", sourceSelected: id === "OPT-1",
  definition: { status: "resolved", occurrenceId: id }, evidence: [] }));
const pairs = [["DEC-1", "OPT-1"], ["DEC-1", "OPT-1"], ["DEC-1", "OPT-2"], ["OPT-2", "RISK-1"],
  ["VAL-1", "DEC-1", "verifies"], ["CTX-1", "OPT-1"], ["RISK-1", "Q-1"], ["Q-1", "RISK-1"]];
const relations: ViewerRelation[] = pairs.map(([source, target, kind], i) => ({ id: `r${i}`, kind: kind ?? "references",
  source: { status: "owned", identifier: source, declarationId: source }, target, occurrenceId: `o${i}`,
  range: { start: { offset: i, line: i + 1, column: 1 }, end: { offset: i + 1, line: i + 1, column: 2 } }, fragmentId: `fragment-${i}` }));
const payload = { entities, relations };
const view = (changes: Partial<ViewOptions> = {}) => selectView(payload, { ...DEFAULT_VIEW, root: "OPT-1", depth: 6, ...changes });

it("stops at excluded alternatives while preserving shared nodes and counted occurrences", () => {
  const before = JSON.stringify(payload), result = view({ option: "OPT-1" });
  expect(result.nodes.map(n => n.id)).toEqual(["OPT-1", "DEC-1", "VAL-1"]);
  expect(result.edges.map(e => [e.source, e.target, e.kind, e.occurrences.length])).toEqual([
    ["DEC-1", "OPT-1", "references", 2], ["VAL-1", "DEC-1", "verifies", 1],
  ]);
  expect(result.boundary).toEqual([{ relationId: "r2", reason: "other option" }, { relationId: "r5", reason: "heading hidden" }]);
  expect(JSON.stringify(payload)).toBe(before);
  expect(entities[0].sourceSelected).toBe(true);
});

it("handles direction, relation and kind barriers, depth and cycles with exact sets", () => {
  expect(view({ direction: "outgoing" }).nodes.map(n => n.id)).toEqual(["OPT-1"]);
  expect(view({ direction: "incoming" }).nodes.map(n => n.id)).toEqual(["OPT-1", "DEC-1", "VAL-1"]);
  expect(view({ relations: ["references"] }).nodes.map(n => n.id)).toEqual(["OPT-1", "DEC-1", "OPT-2", "RISK-1", "Q-1"]);
  expect(view({ kinds: ["risk"] }).nodes.map(n => n.id)).toEqual(["OPT-1"]);
  expect(view({ depth: 1 }).nodes.map(n => n.id)).toEqual(["OPT-1", "DEC-1"]);
  expect(view({ depth: 1 }).depthLimit).toBe(true);
  expect(view({ headings: true }).nodes).toHaveLength(7);
  expect(view({ root: "OPT-2", option: "OPT-2" }).nodes.map(n => n.id)).toEqual(["OPT-2", "DEC-1", "RISK-1", "VAL-1", "Q-1"]);
});

it("reports hard budgets, invalid roots and empty filters without inventing nodes", () => {
  expect(view({ maxNodes: 2 }).nodes.map(n => n.id)).toEqual(["OPT-1", "DEC-1"]);
  expect(view({ maxNodes: 2 }).nodeLimit).toBe(true);
  expect(view({ maxNodes: 0 }).nodes).toEqual([]);
  expect(view({ maxNodes: NaN }).nodes).toEqual([]);
  expect(view({ root: "absent" }).nodes).toEqual([]);
  expect(view({ relations: [] }).edges).toEqual([]);
  const dense = entities.flatMap((from, i) => entities.flatMap((to, j) => Array.from({ length: 8 }, (_, k) => ({
    ...relations[0], id: `${i}-${j}-${k}`, kind: `kind-${k}`,
    source: { status: "owned" as const, identifier: from.id, declarationId: from.id }, target: to.id,
  }))));
  const result = selectView({ entities, relations: dense }, { ...DEFAULT_VIEW, headings: true });
  expect(result.edges).toHaveLength(MAX_VIEW_EDGES);
  expect(result.edgeLimit).toBe(true);
  expect(result.boundary.filter(b => b.reason === "edge limit")).toHaveLength(dense.length - MAX_VIEW_EDGES);
});

it("retains ambiguous references at the boundary instead of inventing an owner", () => {
  const relation = { ...relations[0], source: { status: "ambiguous" as const, declarationIds: ["a", "b"] as const } };
  const result = selectView({ entities, relations: [relation] }, { ...DEFAULT_VIEW, root: "OPT-1" });
  expect(result.edges).toEqual([]);
  expect(result.boundary).toEqual([{ relationId: "r0", reason: "ambiguous source" }]);
});
