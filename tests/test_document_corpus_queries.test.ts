import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  createCorpus,
  findCorpusIncoming,
  findCorpusOutgoing,
  lookupCorpusIdentifier,
  type CorpusBinding,
  type CorpusCapture,
  type DocumentAnalysis,
  type DocumentCorpus,
  type QualifiedEntity,
} from "../src/markdowntrace/document-graph/index.js";
import { readFileSync } from "node:fs";
import { declaration, reference } from "./document-graph-context/fixture.js";

const profileInput = JSON.parse(readFileSync("fixtures/document-graph/profile.json", "utf8"));
const compiled = compileProfile(profileInput);
if (!compiled.ok) throw new Error("fixture profile failed to compile");
const analyze = (text: string, documentId: string): DocumentAnalysis => {
  const result = analyzeDocument({ documentId, text }, compiled.value, { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const capture = (analysis: DocumentAnalysis, alias: string): CorpusCapture => ({
  alias,
  analysis,
  expected: { analysisId: analysis.snapshot.analysisId, source: { ...analysis.snapshot.source } },
});
const create = (captures: CorpusCapture[], bindings: CorpusBinding[] = []): DocumentCorpus => {
  const result = createCorpus({ captures, bindings, limits: { maxCaptures: 10, maxBindings: 20, maxSourceUtf8Bytes: 100_000 } });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const value = <T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T => {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};

describe("document corpus qualified lookup and reference pages", () => {
  it("indexes outgoing structural ownership and incoming intended targets, retaining unresolved evidence", () => {
    const sourceText = `# ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")} ${reference("REQ-2", "depends-on")} ${reference("REQ-3", "references")}`;
    const source = analyze(sourceText, "plan.md");
    const target = analyze(`${declaration("REQ-1")}\n\n${declaration("REQ-2")}`, "task.md");
    const missingCapture = "a".repeat(64);
    const bindings: CorpusBinding[] = [
      { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: target.snapshot.analysisId, identifier: "REQ-1" } },
      { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O3" }, target: { analysisId: target.snapshot.analysisId, identifier: "REQ-2" } },
      { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O4" }, target: { analysisId: missingCapture, identifier: "REQ-3" } },
    ];
    const corpus = create([capture(source, "plan"), capture(target, "task")], bindings);
    const sourceEntity = { analysisId: source.snapshot.analysisId, identifier: "WP-1" };
    const missingEntity = { analysisId: missingCapture, identifier: "REQ-3" };

    const outgoing = value(findCorpusOutgoing(corpus, sourceEntity));
    expect(outgoing.items.map((item) => item.relationship.kind)).toEqual(["implements", "depends-on", "references"]);
    expect(outgoing.items.map((item) => item.evidence.occurrenceId)).toEqual(["O2", "O3", "O4"]);
    expect(outgoing.items[2]).toMatchObject({
      source: sourceEntity,
      targets: [missingEntity],
      resolution: { status: "unresolved", reason: "missing-capture" },
    });
    const incoming = value(findCorpusIncoming(corpus, missingEntity));
    expect(incoming.items).toEqual([outgoing.items[2]]);
    expect(incoming.totalMatches).toBe(1);
    expect(incoming.capture).toBeNull();
    expect(incoming.referenceCount).toBe(1);
    expect(value(lookupCorpusIdentifier(corpus, missingEntity))).toMatchObject({
      capture: null,
      record: null,
      definitions: [],
      referenceCount: 1,
    });
  });

  it("qualifies same local IDs by capture and filters before exact-count pagination", () => {
    const source = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")} ${reference("REQ-1", "depends-on")}`, "plan.md");
    const targetA = analyze(declaration("REQ-1"), "task-a.md");
    const targetB = analyze(declaration("REQ-1"), "task-b.md");
    const corpus = create([capture(source, "plan"), capture(targetA, "a"), capture(targetB, "b")], [
      { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" } },
      { source: { analysisId: source.snapshot.analysisId, occurrenceId: "O3" }, target: { analysisId: targetB.snapshot.analysisId, identifier: "REQ-1" } },
    ]);
    const a = value(lookupCorpusIdentifier(corpus, { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" }));
    const b = value(lookupCorpusIdentifier(corpus, { analysisId: targetB.snapshot.analysisId, identifier: "REQ-1" }));
    expect(a.capture?.source.documentId).toBe("task-a.md");
    expect(b.capture?.source.documentId).toBe("task-b.md");
    expect(a.record?.identifier).toBe("REQ-1");
    expect(a.definitions).toHaveLength(1);
    expect(a.referenceCount).toBe(1);
    expect(b.referenceCount).toBe(1);
    expect(a.record).not.toBe(targetA.snapshot.identifiers.find((record) => record.identifier === "REQ-1"));
    expect(a.definitions[0]).not.toBe(targetA.snapshot.occurrences.find((occurrence) => occurrence.role === "definition"));
    expect(a.capture).not.toBe(corpus.snapshot.captures.find((captureSummary) => captureSummary.analysisId === targetA.snapshot.analysisId));

    const entity: QualifiedEntity = { analysisId: source.snapshot.analysisId, identifier: "WP-1" };
    const page = value(findCorpusOutgoing(corpus, entity, { relations: ["implements", "depends-on"], offset: 1, limit: 1 }));
    expect(page.items.map((item) => item.relationship.kind)).toEqual(["depends-on"]);
    expect(page.totalMatches).toBe(2);
    expect(page.offset).toBe(1);
    expect(page.limit).toBe(1);
    expect(page.nextOffset).toBeNull();
    expect(page.items[0]).not.toBe(corpus.snapshot.references.find((item) => item.evidence.occurrenceId === "O3"));
    expect(Object.isFrozen(page.items[0].occurrence.range.start)).toBe(true);
    expect(value(findCorpusOutgoing(corpus, entity, { relations: [] })).totalMatches).toBe(0);
    expect(value(findCorpusOutgoing(corpus, entity, { relations: ["unknown-relation"] })).totalMatches).toBe(0);
    expect(value(findCorpusOutgoing(corpus, entity, { relations: ["implements", "depends-on"], offset: 0, limit: 1 })).nextOffset).toBe(1);
    expect(value(lookupCorpusIdentifier(corpus, { analysisId: targetA.snapshot.analysisId, identifier: "REQ-9" })).capture?.analysisId).toBe(targetA.snapshot.analysisId);
    expect(value(lookupCorpusIdentifier(corpus, { analysisId: targetA.snapshot.analysisId, identifier: "REQ-9" })).record).toBeNull();
  });

  it("retains structurally owned unresolved sources and repeats conflicting intent once per incoming target", () => {
    const conflictSource = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")}`, "conflict-plan.md");
    const sourceZ = analyze(`# ${declaration("WP-3")}\n\n${reference("REQ-1", "implements")}`, "z-plan.md");
    const duplicateSource = analyze(`# ${declaration("WP-2")}\n\n${reference("REQ-4", "implements")}\n\n${declaration("WP-2")}`, "duplicate-source.md");
    const unknownSource = analyze(`# ${declaration("ZZZ-1")}\n\n${reference("REQ-5", "references")}`, "unknown-source.md");
    const targetA = analyze(declaration("REQ-1"), "task-a.md");
    const targetB = analyze(declaration("REQ-1"), "task-b.md");
    const missingTarget = analyze(declaration("REQ-4"), "task-c.md");
    const conflictBindings: CorpusBinding[] = [
      { source: { analysisId: conflictSource.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" } },
      { source: { analysisId: conflictSource.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: targetB.snapshot.analysisId, identifier: "REQ-1" } },
      { source: { analysisId: sourceZ.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" } },
      { source: { analysisId: duplicateSource.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: missingTarget.snapshot.analysisId, identifier: "REQ-4" } },
      { source: { analysisId: unknownSource.snapshot.analysisId, occurrenceId: "O2" }, target: { analysisId: "b".repeat(64), identifier: "REQ-5" } },
    ];
    const captures = [capture(conflictSource, "conflict"), capture(sourceZ, "z"), capture(duplicateSource, "duplicate"), capture(unknownSource, "unknown"), capture(targetA, "a"), capture(targetB, "b"), capture(missingTarget, "c")];
    const corpus = create(captures, conflictBindings);
    const permuted = create([...captures].reverse(), [...conflictBindings].reverse());
    for (const target of [targetA, targetB]) {
      const page = value(findCorpusIncoming(corpus, { analysisId: target.snapshot.analysisId, identifier: "REQ-1" }));
      expect(page.items.map((item) => item.evidence)).toEqual([
        { analysisId: conflictSource.snapshot.analysisId, occurrenceId: "O2" },
        ...(target === targetA ? [{ analysisId: sourceZ.snapshot.analysisId, occurrenceId: "O2" }] : []),
      ]);
      expect(page.totalMatches).toBe(target === targetA ? 2 : 1);
      expect(page.items[0].resolution).toEqual({ status: "unresolved", reason: "conflicting-bindings" });
    }
    const duplicateOutgoing = value(findCorpusOutgoing(corpus, { analysisId: duplicateSource.snapshot.analysisId, identifier: "WP-2" }));
    expect(duplicateOutgoing.items).toHaveLength(1);
    expect(duplicateOutgoing.items[0]).toMatchObject({
      source: { analysisId: duplicateSource.snapshot.analysisId, identifier: "WP-2" },
      resolution: { status: "unresolved", reason: "unusable-owner" },
    });
    const unknownOutgoing = value(findCorpusOutgoing(corpus, { analysisId: unknownSource.snapshot.analysisId, identifier: "ZZZ-1" }));
    expect(unknownOutgoing.items).toHaveLength(1);
    expect(unknownOutgoing.items[0]).toMatchObject({
      source: { analysisId: unknownSource.snapshot.analysisId, identifier: "ZZZ-1" },
      resolution: { status: "unresolved", reason: "unusable-owner" },
    });
    const firstPage = value(findCorpusIncoming(corpus, { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" }));
    const permutedPage = value(findCorpusIncoming(permuted, { analysisId: targetA.snapshot.analysisId, identifier: "REQ-1" }));
    expect(firstPage.items.map((item) => item.evidence)).toEqual([
      { analysisId: conflictSource.snapshot.analysisId, occurrenceId: "O2" },
      { analysisId: sourceZ.snapshot.analysisId, occurrenceId: "O2" },
    ]);
    expect(permutedPage.items.map((item) => item.evidence)).toEqual(firstPage.items.map((item) => item.evidence));
  });

  it("rejects malformed qualified keys and query records before matching", () => {
    const source = analyze(`# ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")}`, "plan.md");
    const corpus = create([capture(source, "plan")]);
    const entity = { analysisId: source.snapshot.analysisId, identifier: "WP-1" };
    expect(findCorpusOutgoing(corpus, { ...entity, identifier: "WP-1\n" })).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(lookupCorpusIdentifier(corpus, { ...entity, analysisId: `${entity.analysisId}\n` })).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(findCorpusOutgoing(corpus, entity, { offset: -1 })).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(findCorpusOutgoing(corpus, entity, { relations: ["implements\n"] })).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    const extra = Object.defineProperty({ offset: 0 }, "hidden", { value: true, enumerable: false });
    expect(findCorpusOutgoing(corpus, entity, extra)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    const symbol = { offset: 0, [Symbol("extra")]: true };
    expect(findCorpusOutgoing(corpus, entity, symbol)).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    const callerEntity = { ...entity };
    const callerQuery = { offset: 0, relations: ["implements"] };
    const result = value(findCorpusOutgoing(corpus, callerEntity, callerQuery));
    expect(Object.isFrozen(callerEntity)).toBe(false);
    expect(Object.isFrozen(callerQuery)).toBe(false);
    expect(Object.isFrozen(callerQuery.relations)).toBe(false);
    callerEntity.identifier = "REQ-1";
    callerQuery.relations.push("depends-on");
    expect(result.entity.identifier).toBe("WP-1");
    expect(result.items).toHaveLength(1);
  });
});
