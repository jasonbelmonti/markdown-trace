import { readFileSync } from "node:fs";
import * as engine from "@jasonbelmonti/markdown-engine";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  compileValidationProfile,
  findIncoming,
  validateGraph,
  type DocumentAnalysis,
  type Outcome,
  type TraceValidationProfile,
  type ValidationProfileInput,
} from "../src/markdowntrace/document-graph/index.js";

vi.mock("@jasonbelmonti/markdown-engine", async (importOriginal) => {
  const actual = await importOriginal<typeof engine>();
  return {
    ...actual,
    parse: vi.fn(actual.parse),
    normalize: vi.fn(actual.normalize),
  };
});

const raw = JSON.parse(
  readFileSync("experiments/task-definition-trace/profile.json", "utf8"),
);
const text = readFileSync(
  "experiments/task-definition-trace/task-definition.md",
  "utf8",
);
const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 10_000 };
function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const compile = (data: unknown = raw) =>
  value(compileValidationProfile(JSON.stringify(data)));
const analyze = (source = text, profile = compile()) =>
  value(
    analyzeDocument({ documentId: "task.md", text: source }, profile, limits),
  );
afterEach(() => vi.restoreAllMocks());

describe("packaged graph validation", () => {
  it("shares one real Engine capture across analysis, queries and repeated policies", () => {
    const parse = vi.mocked(engine.parse),
      normalize = vi.mocked(engine.normalize);
    const missing = text.replace(
      "[relationship probes](ctx://trace/entity/VAL-2?rel=verified-by)",
      "relationship probes",
    );
    const strict = compile();
    const source = { documentId: "task.md", text: missing };
    const analysis = value(analyzeDocument(source, strict, limits));
    source.text = "changed after capture";
    const before = JSON.stringify(analysis.snapshot);
    const failed = value(validateGraph(analysis, strict));
    expect(failed.status).toBe("fail");
    expect(failed.diagnostics.map((item) => item.ruleId)).toEqual([
      "validation-has-slice",
    ]);
    const relaxedData = structuredClone(raw);
    relaxedData.validation.rules.find(
      (rule: { id: string }) => rule.id === "validation-has-slice",
    ).min = 0;
    const relaxed = compile(relaxedData);
    expect(value(validateGraph(analysis, relaxed)).status).toBe("pass");
    expect(value(validateGraph(analysis, strict))).toEqual(failed);
    expect(
      value(findIncoming(analysis, "TD-SC-2")).items[0].relationship.source,
    ).toMatchObject({ identifier: "VAL-2" });
    expect(JSON.stringify(analysis.snapshot)).toBe(before);
    expect(parse).toHaveBeenCalledTimes(1);
    expect(normalize).toHaveBeenCalledTimes(1);
    expect(relaxed.interpretationHash).toBe(strict.interpretationHash);
    expect(relaxed.validationHash).not.toBe(strict.validationHash);
    expect(() => (failed.diagnostics as unknown[]).pop()).toThrow();
  });

  it("validates an analysis issued using the existing interpretation profile", () => {
    const base = value(
      compileProfile({
        ...raw,
        schemaVersion: "markdown-trace.document-profile.v1",
        validation: { ...raw.validation, rules: [] },
      }),
    );
    const analysis = value(
      analyzeDocument({ documentId: "task.md", text }, base, limits),
    );
    expect(value(validateGraph(analysis, compile())).status).toBe("pass");
    expect(analysis.snapshot).toEqual(analyze().snapshot);
  });

  it("rejects unissued handles, unsupported fields and non-string selectors", () => {
    const profile = compile(),
      analysis = analyze();
    expect(
      validateGraph({ ...analysis } as DocumentAnalysis, profile),
    ).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    expect(
      validateGraph(analysis, { ...profile } as TraceValidationProfile),
    ).toMatchObject({ ok: false, error: { code: "invalid-input" } });
    const changed = structuredClone(raw);
    changed.interpretation.entityKinds[0].prefixes = ["OTHER"];
    expect(validateGraph(analysis, compile(changed))).toMatchObject({
      ok: false,
      error: { code: "profile-mismatch" },
    });
    for (const rules of [
      [{ ...raw.validation.rules[0], extra: true }],
      [{ ...raw.validation.rules[5], direction: ["incoming"] }],
      [{ ...raw.validation.rules[3], relation: ["verifies"] }],
      [
        {
          ...raw.validation.rules[0],
          select: { target: "node", nodeType: ["heading"] },
        },
      ],
    ])
      expect(
        compileValidationProfile(
          JSON.stringify({ ...raw, validation: { ...raw.validation, rules } }),
        ),
      ).toMatchObject({ ok: false, error: { code: "invalid-profile" } });
    expect(compileValidationProfile("{")).toMatchObject({
      ok: false,
      error: { code: "invalid-profile" },
    });
  });

  it("reports missing source targets instead of treating zero checks as success", () => {
    const data = structuredClone(raw);
    data.validation.rules[1].select.column = "Absent column";
    const result = value(validateGraph(analyze(), compile(data)));
    expect(
      result.rules.find((rule) => rule.id === "validation-definitions"),
    ).toMatchObject({ status: "fail", selected: 0 });
    expect(
      result.diagnostics.some(
        (item) => item.code === "trace-validation.selection-count",
      ),
    ).toBe(true);
  });

  it("counts distinct resolved neighbors while retaining repeated references", () => {
    const data: ValidationProfileInput = {
      schemaVersion: raw.schemaVersion,
      profileId: "neighbors",
      interpretation: {
        language: "markdown-trace.identity.draft2",
        entityKinds: [{ name: "item", prefixes: ["ITEM"] }],
      },
      validation: {
        minEntities: 2,
        allowedRelations: [{ kind: "checks", from: ["item"], to: ["item"] }],
        rules: [
          {
            id: "incoming",
            op: "require-relation",
            kinds: ["item"],
            direction: "incoming",
            relation: "checks",
            relatedKinds: ["item"],
            min: 0,
            max: 1,
          },
        ],
      },
    };
    const profile = compile(data);
    const source =
      "# [Target](ctx://trace/entity/ITEM-1?role=definition)\n\n# [Source](ctx://trace/entity/ITEM-2?role=definition)\n\n[One](ctx://trace/entity/ITEM-1?rel=checks) [Two](ctx://trace/entity/ITEM-1?rel=checks)\n";
    const analysis = analyze(source, profile);
    expect(value(validateGraph(analysis, profile)).status).toBe("pass");
    expect(value(findIncoming(analysis, "ITEM-1")).totalMatches).toBe(2);
    expect(
      value(
        validateGraph(
          analyze(
            source.replace("ITEM-1?rel=checks", "ITEM-3?rel=checks"),
            profile,
          ),
          profile,
        ),
      ).status,
    ).toBe("fail");
  });

  it("keeps incomplete extraction distinct from a malformed-link failure", () => {
    const profile = compile({
      ...raw,
      validation: { minEntities: 0, allowedRelations: [], rules: [] },
    });
    expect(
      value(
        validateGraph(
          analyze("A footnote[^a].\n\n[^a]: A note.\n", profile),
          profile,
        ),
      ).status,
    ).toBe("indeterminate");
    expect(
      value(
        validateGraph(
          analyze("[Bad](ctx://trace/entity/VAL-1?rel=bad_slug)", profile),
          profile,
        ),
      ).status,
    ).toBe("fail");
  });
});
