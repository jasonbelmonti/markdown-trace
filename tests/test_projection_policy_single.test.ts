import { describe, expect, it } from "vitest";
import { fixturePolicyJson, fixtureProfileJson, fixtureSource, projectionOracle } from "./projection-policy/fixture.js";
import { compileProjectionPolicy, produceProjection } from "../src/markdowntrace/document-graph/projection/index.js";
import { analyzeDocument, compileValidationProfile } from "../src/markdowntrace/document-graph/index.js";
import { capturedSource } from "../src/markdowntrace/document-graph/analysis-state.js";
import { documentQueries } from "@jasonbelmonti/markdown-engine";
import type { ProjectionInput, ProjectionPacket } from "../src/markdowntrace/document-graph/projection/contracts.js";

export function fixtureInput(): ProjectionInput {
  const compiled = compileProjectionPolicy(fixturePolicyJson);
  if (!compiled.ok) throw new Error(compiled.error.message);
  return {
    assignmentId: "fixture", roots: [{ source: "task", identifier: "WP-1" }],
    sources: [{ alias: "task", revision: "fixture-r1", documentId: "tests/projection-policy/single-task.md", text: fixtureSource, validationProfileJson: fixtureProfileJson }],
    bindings: [], policy: compiled.value,
    expected: {
      policy: compiled.value.identity,
      producer: { packageVersion: "0.1.1", analyzerVersion: "0.1.0-experimental.3", parserVersion: "3.6.0", algorithmVersion: "markdown-trace.projection-algorithm.v1" },
      sources: [{ alias: "task", revision: "fixture-r1", pin: { analysisId: "ef6dfc495eb47d5860124d13d33567dfb15882c2b8bee849493211edeb087800", source: { documentId: "tests/projection-policy/single-task.md", sha256: "87884a414e1553c1be2191bd92aae00095422f70c86bb277143cbdab6b703eab", utf8Bytes: 697, utf16Length: 697 } }, profileFileSha256: "7e0d63d472c56de1eb7959b60d507da2d692261ab1549e53fdb3253868d4278a", interpretationHash: "2671b80ba5795010896aef789d642eba070ceeaf7d611ece8d146385c3a395ab", validationHash: "87559f43ba98e203f9adbd03cd02916acad6b289581936c3a01bdf93a0286532" }],
    },
    budget: { maxUtf8Bytes: 551, maxFragments: 11 },
    limits: { analysis: { maxSourceUtf8Bytes: 10_000, maxOccurrences: 100 }, corpus: { maxCaptures: 4, maxBindings: 100, maxSourceUtf8Bytes: 100_000 }, maxRuleEntityVisits: 1000, maxPacketUtf8Bytes: 100_000 },
  };
}
function packet(input: ProjectionInput): ProjectionPacket {
  const result = produceProjection(input);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe("required single-source projection", () => {
  it("admits the independent eleven-part oracle including four unlinked sections", () => {
    const result = packet(fixtureInput());
    expect(result.policyStatus).toBe("satisfied");
    expect(result.requiredSetComplete).toBe(true);
    expect(result.budget).toMatchObject({ requiredUtf8Bytes: projectionOracle.requiredPartBytes, requiredFragments: projectionOracle.requiredPartCount,
      usedUtf8Bytes: projectionOracle.requiredPartBytes, usedFragments: projectionOracle.requiredPartCount });
    expect(result.parts.map(part => ({ text: part.text, start: part.range.start.offset, end: part.range.end.offset, reasons: part.reasons })))
      .toEqual(projectionOracle.requiredParts.map(part => ({ text: part.text, start: part.start, end: part.end, reasons: part.reasons })));
    expect(result.obligations.filter(item => item.requirement === "required").every(item => item.status === "admitted")).toBe(true);
    expect(result.obligations.find(item => item.ruleId === "background")).toMatchObject({ status: "omitted", reasons: ["byte-budget"] });
  });

  it("admits no source parts for a one-byte or one-fragment required shortfall", () => {
    const base = fixtureInput();
    for (const budget of [{ maxUtf8Bytes: 550, maxFragments: 11 }, { maxUtf8Bytes: 551, maxFragments: 10 }, { maxUtf8Bytes: 0, maxFragments: 0 }]) {
      const result = packet({ ...base, budget });
      expect(result.policyStatus).toBe("unsatisfied");
      expect(result.parts).toEqual([]);
      expect(result.budget.requiredUtf8Bytes).toBe(551);
      expect(result.budget.requiredFragments).toBe(11);
      expect(result.obligations.filter(item => item.requirement === "required").every(item => item.status === "omitted")).toBe(true);
    }
  });

  it("fails a missing required section without emitting partial source", () => {
    const base = fixtureInput();
    const damaged = fixtureSource.replace("## Review Boundary\n\nOnly declared criteria are evaluated.\n\n", "");
    const result = produceProjection({ ...base, sources: [{ ...base.sources[0], text: damaged }] });
    expect(result).toMatchObject({ ok: false, error: { code: "stale-input" } });
    const profile = compileValidationProfile(fixtureProfileJson);
    if (!profile.ok) throw new Error(profile.error.message);
    const captured = analyzeDocument({ documentId: base.sources[0].documentId, text: damaged }, profile.value, base.limits.analysis);
    if (!captured.ok) throw new Error(captured.error.message);
    const repinned: ProjectionInput = { ...base, sources: [{ ...base.sources[0], text: damaged }], expected: {
      ...base.expected, sources: [{ ...base.expected.sources[0], pin: {
        analysisId: captured.value.snapshot.analysisId, source: captured.value.snapshot.source,
      } }],
    } };
    const repairedIdentity = packet(repinned);
    expect(repairedIdentity.policyStatus).toBe("unsatisfied");
    expect(repairedIdentity.parts).toEqual([]);
    expect(repairedIdentity.diagnostics.some(item => item.code === "missing-selector" && item.ruleId === "review")).toBe(true);
  });

  it("uses captured quote/list syntax and heading support for exact Engine block selectors", () => {
    const base = fixtureInput();
    const text = `${fixtureSource}\n> - Deep α text.\n`;
    const profile = compileValidationProfile(fixtureProfileJson);
    if (!profile.ok) throw new Error(profile.error.message);
    const analyzed = analyzeDocument({ documentId: base.sources[0].documentId, text }, profile.value, base.limits.analysis);
    if (!analyzed.ok) throw new Error(analyzed.error.message);
    const capture = capturedSource(analyzed.value)!;
    for (const nodeType of ["paragraph", "listItem"]) {
      const node = documentQueries.nodes(capture.document).find(item =>
        item.type === nodeType && item.source?.text.includes("Deep α text."));
      expect(node?.source?.range).toBeDefined();
      const policyData = JSON.parse(fixturePolicyJson);
      policyData.rules.unshift({ id: "deep", op: "source", requirement: "required", source: "task",
        select: { kind: "block", range: node!.source!.range } });
      const compiled = compileProjectionPolicy(JSON.stringify(policyData));
      if (!compiled.ok) throw new Error(compiled.error.message);
      const input: ProjectionInput = { ...base, policy: compiled.value,
        sources: [{ ...base.sources[0], text }], expected: { ...base.expected, policy: compiled.value.identity,
          sources: [{ ...base.expected.sources[0], pin: { analysisId: analyzed.value.snapshot.analysisId, source: analyzed.value.snapshot.source } }] },
        budget: { maxUtf8Bytes: 10_000, maxFragments: 100 } };
      const result = packet(input);
      expect(result.policyStatus).toBe("satisfied");
      const quoted = result.parts.find(part => part.text.includes("Deep α text."));
      expect(quoted?.text).toBe("> - Deep α text.");
      expect(quoted?.reasons).toContainEqual({ obligationId: '["deep","task","block"]', role: "source-selection" });
      expect(result.parts.some(part => part.text.includes("## [Constraint]") &&
        part.reasons.some(reason => reason.obligationId === '["deep","task","block"]' && reason.role === "heading"))).toBe(true);
    }
  });

  it("retains the complete quoted table block and canonical root-first reasons", () => {
    const base = fixtureInput();
    const table = "> | Name | Note |\n> | --- | --- |\n> | A | Deep α text. |";
    const text = `${fixtureSource}\n${table}\n`;
    const profile = compileValidationProfile(fixtureProfileJson);
    if (!profile.ok) throw new Error(profile.error.message);
    const analyzed = analyzeDocument({ documentId: base.sources[0].documentId, text }, profile.value, base.limits.analysis);
    if (!analyzed.ok) throw new Error(analyzed.error.message);
    const document = capturedSource(analyzed.value)!.document;
    const node = documentQueries.nodes(document).find(item => item.type === "table" && item.source?.text.includes("Deep α text."));
    expect(node?.source?.range).toBeDefined();
    const policyData = JSON.parse(fixturePolicyJson);
    policyData.rules.unshift({ id: "whole", op: "source", requirement: "required", source: "task", select: { kind: "document" } });
    policyData.rules.push({ id: "quoted-table", op: "source", requirement: "required", source: "task",
      select: { kind: "block", range: node!.source!.range } });
    const compiled = compileProjectionPolicy(JSON.stringify(policyData));
    if (!compiled.ok) throw new Error(compiled.error.message);
    const input: ProjectionInput = { ...base, policy: compiled.value,
      sources: [{ ...base.sources[0], text }], expected: { ...base.expected, policy: compiled.value.identity,
        sources: [{ ...base.expected.sources[0], pin: { analysisId: analyzed.value.snapshot.analysisId, source: analyzed.value.snapshot.source } }] },
      budget: { maxUtf8Bytes: 10_000, maxFragments: 100 } };
    const result = packet(input);
    expect(result.policyStatus).toBe("satisfied");
    expect(result.parts.map(part => part.text).join("")).toBe(text);
    expect([...new Set(result.parts[0].reasons.map(reason => reason.obligationId))].slice(0, 2)).toEqual([
      '["roots","task","WP-1"]', '["whole","task","document"]',
    ]);
    expect(result.parts.some(part => part.text.includes(table) &&
      part.reasons.some(reason => reason.obligationId === '["quoted-table","task","block"]'))).toBe(true);
  });

  it("serializes interleaved optional and required rules in declaration order", () => {
    const base = fixtureInput();
    const policyData = JSON.parse(fixturePolicyJson);
    policyData.rules = [
      { id: "optional-first", op: "source", requirement: "optional", source: "task", select: { kind: "document" } },
      { id: "required-later", op: "source", requirement: "required", source: "task", select: { kind: "document" } },
    ];
    const compiled = compileProjectionPolicy(JSON.stringify(policyData));
    if (!compiled.ok) throw new Error(compiled.error.message);
    const input: ProjectionInput = { ...base, policy: compiled.value,
      expected: { ...base.expected, policy: compiled.value.identity },
      budget: { maxUtf8Bytes: 10_000, maxFragments: 100 } };
    const result = packet(input);
    expect(result.rules.map(rule => rule.ruleId)).toEqual(["roots", "optional-first", "required-later"]);
    expect(result.obligations.map(item => item.ruleId)).toEqual(["roots", "optional-first", "required-later"]);
    expect([...new Set(result.parts[0].reasons.map(item => item.obligationId))].slice(0, 3)).toEqual([
      '["roots","task","WP-1"]', '["optional-first","task","document"]', '["required-later","task","document"]',
    ]);
  });
});
