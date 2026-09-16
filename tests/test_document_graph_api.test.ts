import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  findIncoming,
  findOutgoing,
  lookupIdentifier,
  type DocumentAnalysis,
  type Outcome,
  type TraceProfile,
} from "../src/markdowntrace/document-graph/index.js";
const profileInput = JSON.parse(
  readFileSync("fixtures/document-graph/profile.json", "utf8"),
);

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 10_000 };
const source = {
  documentId: "spec.md",
  text: readFileSync("fixtures/document-graph/mixed-layout.md", "utf8"),
};
const profile = value(compileProfile(profileInput));
const analyze = (text = source.text) =>
  value(analyzeDocument({ ...source, text }, profile, limits));

describe("experimental graph consumer contracts", () => {
  it("returns located backlinks across a nested list and table", () => {
    const analysis = analyze(),
      result = value(findIncoming(analysis, "REQ-2"));
    expect(
      result.items.map((m) => [
        m.relationship.source,
        m.relationship.kind,
        m.occurrence.range.start.line,
      ]),
    ).toEqual([
      [
        expect.objectContaining({ status: "owned", identifier: "WP-1" }),
        "references",
        8,
      ],
      [
        expect.objectContaining({ status: "owned", identifier: "WP-2" }),
        "implements",
        14,
      ],
    ]);
    for (const match of result.items)
      expect(
        source.text.slice(
          match.occurrence.range.start.offset,
          match.occurrence.range.end.offset,
        ),
      ).toMatch(/REQ-2/);
    expect(value(lookupIdentifier(analysis, "REQ-999")).record).toBeNull(); // fenced example
  });
  it("reports malformed Trace destinations without salvaging their labels", () => {
    const text =
      "# [Work](ctx://trace/entity/WP-1?role=definition)\n\n[REQ-9](ctx://trace/entity/REQ-2?rel=bad_slug) REQ-3";
    const graph = analyze(text).snapshot;
    expect(graph.relationships.map((r) => r.target)).toEqual(["REQ-3"]);
    const diagnostic = graph.diagnostics.find(
      (d) => d.code === "markdown-trace.language.malformed-link",
    )!;
    const range = diagnostic.sourceRanges[0];
    expect(text.slice(range.start.offset, range.end.offset)).toBe(
      "[REQ-9](ctx://trace/entity/REQ-2?rel=bad_slug)",
    );
    expect(diagnostic.identifiers).toEqual(["WP-1"]);
    expect(graph.coverage).toBe("partial");
  });
  it("retains dangling, duplicate, unknown-kind and ambiguous-source evidence", () => {
    const analysis = analyze(
      "[WP-1](ctx://trace/entity/WP-1?role=definition) [WP-2](ctx://trace/entity/WP-2?role=definition) [NEW-1](ctx://trace/entity/NEW-1?rel=custom-edge).\n\n[REQ-1](ctx://trace/entity/REQ-1?role=definition)\n\n[REQ-1](ctx://trace/entity/REQ-1?role=definition)",
    );
    const page = value(findIncoming(analysis, "NEW-1"));
    expect(page.record).toMatchObject({
      entityKind: null,
      definition: { status: "missing" },
    });
    expect(page.items[0].relationship.source).toMatchObject({
      status: "ambiguous",
    });
    expect(page.coverage).toBe("partial");
    expect(value(findOutgoing(analysis, "WP-1")).totalMatches).toBe(0);
    expect(value(lookupIdentifier(analysis, "REQ-1")).definitions).toHaveLength(
      2,
    );
  });
  it("paginates repeated evidence and treats empty/unknown filters as no matches", () => {
    const analysis = analyze(
      "[WP-1](ctx://trace/entity/WP-1?role=definition) REQ-1 REQ-1 [REQ-1](ctx://trace/entity/REQ-1?rel=implements).\n\n[REQ-1](ctx://trace/entity/REQ-1?role=definition)",
    );
    const pages = [0, 1, 2, 3].map((offset) =>
      value(findIncoming(analysis, "REQ-1", { offset, limit: 1 })),
    );
    expect(pages.map((p) => p.nextOffset)).toEqual([1, 2, null, null]);
    expect(pages.map((p) => p.totalMatches)).toEqual([3, 3, 3, 3]);
    expect(
      new Set(pages.flatMap((p) => p.items.map((m) => m.relationship.id))).size,
    ).toBe(3);
    for (const relations of [[], ["unknown-edge"]])
      expect(
        value(findIncoming(analysis, "REQ-1", { relations })).items,
      ).toEqual([]);
    expect(
      value(findIncoming(analysis, "REQ-1", { relations: ["implements"] }))
        .totalMatches,
    ).toBe(1);
  });
  it("separates validity policy from immutable analysis identity", () => {
    const input = structuredClone(profileInput) as any;
    input.validation.allowedRelations = [];
    const forbidden = value(compileProfile(input));
    expect(forbidden.interpretationHash).toBe(profile.interpretationHash);
    expect(forbidden.validationHash).not.toBe(profile.validationHash);
    const a = analyze(),
      b = value(analyzeDocument(source, forbidden, limits));
    expect(b.snapshot).toEqual(a.snapshot);
    input.interpretation.entityKinds[0].prefixes = ["OTHER"];
    expect(value(analyzeDocument(source, forbidden, limits)).snapshot).toEqual(
      a.snapshot,
    );
    expect(() => (a.snapshot.relationships as any[]).pop()).toThrow();
    expect(
      () =>
        ((
          value(findIncoming(a, "REQ-2")).items[0].occurrence.range.start as any
        ).offset = 0),
    ).toThrow();
  });
  it("rejects fabricated handles and malformed query bounds", () => {
    const a = analyze();
    expect(
      lookupIdentifier(
        JSON.parse(JSON.stringify(a)) as DocumentAnalysis,
        "REQ-1",
      ),
    ).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(
      analyzeDocument(source, { ...profile } as TraceProfile, limits),
    ).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    for (const query of [
      { offset: -1 },
      { limit: 0 },
      { limit: 1001 },
      { relations: ["bad slug"] },
      { unexpected: true },
    ]) {
      expect(findIncoming(a, "REQ-1", query)).toMatchObject({
        ok: false,
        error: { code: "invalid-input" },
      });
    }
    expect(lookupIdentifier(a, "req-1")).toMatchObject({ ok: false });
  });
  it("enforces source and occurrence admission limits without returning a snapshot", () => {
    for (const bounds of [
      { ...limits, maxSourceUtf8Bytes: Buffer.byteLength(source.text) - 1 },
      { ...limits, maxOccurrences: 9 },
    ]) {
      expect(analyzeDocument(source, profile, bounds)).toMatchObject({
        ok: false,
        error: { code: "analysis-limit" },
      });
    }
    expect(
      analyzeDocument(source, profile, { ...limits, maxOccurrences: 10 }).ok,
    ).toBe(true);
    expect(
      analyzeDocument({ ...source, text: "\ud800" }, profile, limits),
    ).toMatchObject({ ok: false, error: { code: "invalid-input" } });
  });
  it("rejects unsupported, cyclic, accessor and ambiguous-vocabulary profiles", () => {
    const invalid = structuredClone(profileInput) as any;
    invalid.validation.rules[0].op = "arbitrary-query";
    expect(compileProfile(invalid)).toMatchObject({
      ok: false,
      error: {
        code: "invalid-profile",
        diagnostics: [
          expect.objectContaining({
            message: expect.stringContaining("validation.rules[0].op"),
          }),
        ],
      },
    });
    expect(
      compileProfile({ schemaVersion: "markdown-trace.graph-profile.v1" }),
    ).toMatchObject({ ok: false, error: { code: "unsupported-version" } });
    const cyclic: any = {};
    cyclic.self = cyclic;
    expect(compileProfile(cyclic)).toMatchObject({ ok: false });
    expect(
      compileProfile({
        get schemaVersion() {
          throw new Error("must not execute");
        },
      }),
    ).toMatchObject({ ok: false });
    const duplicate = structuredClone(profileInput) as any;
    duplicate.interpretation.entityKinds[1].prefixes.push("REQ");
    expect(compileProfile(duplicate)).toMatchObject({ ok: false });
  });
  it("supports profile-defined prefixes and relation names", () => {
    const input = structuredClone(profileInput) as any;
    input.interpretation.entityKinds.push({
      name: "decision",
      prefixes: ["ADR"],
    });
    const custom = value(compileProfile(input));
    const a = value(
      analyzeDocument(
        {
          ...source,
          text: "[ADR-1](ctx://trace/entity/ADR-1?role=definition) [REQ-1](ctx://trace/entity/REQ-1?rel=motivates).\n\n[REQ-1](ctx://trace/entity/REQ-1?role=definition)",
        },
        custom,
        limits,
      ),
    );
    expect(value(lookupIdentifier(a, "ADR-1")).record?.entityKind).toBe(
      "decision",
    );
    expect(value(findIncoming(a, "REQ-1")).items[0].relationship.kind).toBe(
      "motivates",
    );
  });
  it("captures source and yields repeatable identities without policy/limit dependence", () => {
    const input = { ...source },
      a = value(analyzeDocument(input, profile, limits));
    input.text = "[REQ-99](ctx://trace/entity/REQ-99?role=definition)";
    expect(value(lookupIdentifier(a, "REQ-1")).record?.definition.status).toBe(
      "resolved",
    );
    expect(
      value(analyzeDocument(source, profile, { ...limits, maxOccurrences: 20 }))
        .snapshot,
    ).toEqual(a.snapshot);
    expect(
      value(analyzeDocument(input, profile, limits)).snapshot.analysisId,
    ).not.toBe(a.snapshot.analysisId);
  });
});
