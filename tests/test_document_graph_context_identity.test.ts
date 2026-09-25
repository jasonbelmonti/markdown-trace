import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument, extractContext,
  type DocumentAnalysis, type GraphSelection,
} from "../src/markdowntrace/document-graph/index.js";
import {
  analyze, declaration, expectedRange, generous, limits, profile, project, reference, select, value,
} from "./document-graph-context/fixture.js";

describe("captured context and issued provenance", () => {
  const work = `# ${declaration("WP-1")}`;
  const linked = `${reference("REQ-1", "implements")} [bad](ctx://trace/entity/REQ-9?rel=bad_slug)`;
  const requirement = `# ${declaration("REQ-1")}`;
  const body = "Requirement evidence.";
  const original = [work, linked, requirement, body].join("\n\n");

  it("retains a file and object capture after external mutation, then gives fresh analysis a new identity", () => {
    const directory = mkdtempSync(join(tmpdir(), "trace-context-"));
    const file = join(directory, "spec.md");
    try {
      writeFileSync(file, original);
      const input = { documentId: "spec.md", text: readFileSync(file, "utf8") };
      const analysis = value(analyzeDocument(input, profile, limits));
      const selection = select(analysis, ["WP-1"], { maxDepth: 1, maxNodes: 2 });
      writeFileSync(file, `# ${declaration("WP-9")}\n\nChanged.`);
      input.text = readFileSync(file, "utf8");

      const retained = project(analysis, selection);
      expect(retained.parts.map((p) => p.text)).toEqual([work, linked, requirement, body]);
      expect(retained.parts.map((p) => p.range)).toEqual([
        expectedRange(original, work), expectedRange(original, linked),
        expectedRange(original, requirement), expectedRange(original, body),
      ]);
      expect(retained.source).toEqual({
        documentId: "spec.md",
        sha256: createHash("sha256").update(original).digest("hex"),
        utf8Bytes: Buffer.byteLength(original), utf16Length: original.length,
      });
      expect(retained.analysisId).toBe(analysis.snapshot.analysisId);
      expect(retained.coverage).toBe("partial");
      expect(retained.diagnosticCount).toBe(1);
      expect(retained.includedIdentifiers).toEqual(["WP-1", "REQ-1"]);
      expect(retained.omittedIdentifiers).toEqual([]);
      expect(retained.usedUtf8Bytes).toBe([work, linked, requirement, body].reduce(
        (sum, excerpt) => sum + Buffer.byteLength(excerpt), 0,
      ));

      const fresh = analyze(input.text, input.documentId);
      expect(fresh.snapshot.analysisId).not.toBe(analysis.snapshot.analysisId);
      expect(fresh.snapshot.source.sha256).not.toBe(analysis.snapshot.source.sha256);
      expect(extractContext(fresh, { selection, budget: generous })).toMatchObject({
        ok: false, error: { code: "stale-selection" },
      });
      expect(project(analyze(original, "spec.md"), selection)).toEqual(retained);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects copied and fabricated selections while retaining JSON explanation paths", () => {
    const analysis = analyze(original, "spec.md");
    const selection = select(analysis, ["WP-1"], { maxDepth: 1, maxNodes: 2 });
    const result = project(analysis, selection);
    const json = JSON.parse(JSON.stringify(result));
    expect(json).toMatchObject({
      schemaVersion: "markdown-trace.document-context.v1",
      analysisId: analysis.snapshot.analysisId,
      coverage: "partial", diagnosticCount: 1,
      source: { documentId: "spec.md", utf16Length: original.length },
      selection: {
        query: { roots: ["WP-1"], direction: "outgoing", maxDepth: 1, maxNodes: 2 },
        nodes: [
          { identifier: "WP-1", depth: 0, via: null },
          { identifier: "REQ-1", depth: 1, via: {
            from: "WP-1", relationshipId: "R1", kind: "implements",
          } },
        ],
        boundary: { depthLimited: false, nodeLimited: false, unresolvedRelationships: 0 },
      },
    });
    expect(json.parts.map((p: { text: string; forIdentifiers: string[] }) => [p.text, p.forIdentifiers])).toEqual([
      [work, ["WP-1"]], [linked, ["WP-1"]],
      [requirement, ["REQ-1"]], [body, ["REQ-1"]],
    ]);
    for (const forged of [
      JSON.parse(JSON.stringify(selection)), { ...selection }, { ...selection, analysisId: analysis.snapshot.analysisId },
    ])
      expect(extractContext(analysis, { selection: forged as GraphSelection, budget: generous })).toMatchObject({
        ok: false, error: { code: "invalid-selection" },
      });
    expect(extractContext(JSON.parse(JSON.stringify(analysis)) as DocumentAnalysis,
      { selection, budget: generous })).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
  });

  it("serializes actual depth, node and unresolved-edge boundaries", () => {
    const source = [
      work,
      `${reference("REQ-1", "implements")} ${reference("REQ-MISSING", "depends-on")}`,
      requirement,
    ].join("\n\n");
    const analysis = analyze(source);
    const selection = select(analysis, ["WP-1"], { maxDepth: 0, maxNodes: 1 });
    const json = JSON.parse(JSON.stringify(project(analysis, selection)));
    expect(json.selection.nodes).toEqual([{ identifier: "WP-1", depth: 0, via: null }]);
    expect(json.selection.boundary).toEqual({
      depthLimited: true, nodeLimited: true, unresolvedRelationships: 1,
    });
    expect(json.includedIdentifiers).toEqual(["WP-1"]);
    expect(json.parts.map((part: { text: string }) => part.text)).toEqual([
      work, `${reference("REQ-1", "implements")} ${reference("REQ-MISSING", "depends-on")}`,
    ]);
  });

  it("freezes nested results and detaches caller budgets", () => {
    const analysis = analyze(original);
    const selection = select(analysis, ["WP-1"], { maxDepth: 1, maxNodes: 2 });
    const budget = { maxUtf8Bytes: 100_000, maxFragments: 100 };
    const result = project(analysis, selection, budget);
    const before = JSON.stringify(result);
    budget.maxUtf8Bytes = 0;
    budget.maxFragments = 0;
    expect(JSON.stringify(result)).toBe(before);
    expect(project(analysis, selection, budget).omittedIdentifiers).toEqual([
      { identifier: "WP-1", reason: "byte-budget" },
      { identifier: "REQ-1", reason: "byte-budget" },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.source)).toBe(true);
    expect(Object.isFrozen(result.parts)).toBe(true);
    expect(Object.isFrozen(result.parts[0].range.start)).toBe(true);
    expect(Object.isFrozen(result.parts[0].forIdentifiers)).toBe(true);
    expect(Object.isFrozen(result.parts[0].roles)).toBe(true);
    expect(Object.isFrozen(result.selection.query.roots)).toBe(true);
    expect(Object.isFrozen(result.selection.nodes[1].via)).toBe(true);
    expect(Object.isFrozen(result.selection.boundary)).toBe(true);
    expect(() => (result.parts as unknown as unknown[]).pop()).toThrow();
    expect(() => ((result.selection.nodes[1].via as { from: string }).from = "WP-9")).toThrow();
    expect(JSON.stringify(result)).toBe(before);
  });
});
