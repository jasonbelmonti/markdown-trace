import { describe, expect, it } from "vitest";
import { extractContext, type ContextBudget } from "../src/markdowntrace/document-graph/index.js";
import {
  analyze, declaration, expectedRange, generous, project, select,
} from "./document-graph-context/fixture.js";

describe("atomic context budgets and ownership", () => {
  const root = `# ${declaration("WP-1")}`;
  const large = `Large ${"x".repeat(400)}.`;
  const second = `## ${declaration("WP-2")}`;
  const small = "small";
  const third = `## ${declaration("WP-3")}`;
  const tiny = "tiny";
  const source = [root, large, second, small, third, tiny].join("\n\n");
  const expectedSmall = [root, second, small, third, tiny];
  const exactBytes = expectedSmall.reduce((sum, excerpt) => sum + Buffer.byteLength(excerpt), 0);
  const analysis = analyze(source);
  const selection = select(analysis, ["WP-1", "WP-2", "WP-3"]);

  it("admits later fitting entities atomically, counting shared support once", () => {
    const result = project(analysis, selection, { maxUtf8Bytes: exactBytes, maxFragments: 5 });
    expect(result.includedIdentifiers).toEqual(["WP-2", "WP-3"]);
    expect(result.omittedIdentifiers).toEqual([{ identifier: "WP-1", reason: "byte-budget" }]);
    expect(result.parts.map((p) => p.text)).toEqual(expectedSmall);
    expect(result.parts.map((p) => p.range)).toEqual(expectedSmall.map((x) => expectedRange(source, x)));
    expect(result.parts.map((p) => p.forIdentifiers)).toEqual([
      ["WP-2", "WP-3"], ["WP-2"], ["WP-2"], ["WP-3"], ["WP-3"],
    ]);
    expect(result.parts[0].roles).toEqual(["heading"]);
    expect(result.usedUtf8Bytes).toBe(exactBytes);
    expect(new Set([...result.includedIdentifiers, ...result.omittedIdentifiers.map((o) => o.identifier)])).toEqual(
      new Set(selection.nodes.map((n) => n.identifier)),
    );
    expect(result.parts.every((p) => !p.forIdentifiers.includes("WP-1"))).toBe(true);
    expect(result.parts.map((p) => p.text).join("\n")).not.toContain(large);
  });

  it("distinguishes exact fit, byte short, fragment short and zero budgets", () => {
    const onlySmall = select(analysis, ["WP-2", "WP-3"]);
    const exact = project(analysis, onlySmall, { maxUtf8Bytes: exactBytes, maxFragments: 5 });
    expect(exact.includedIdentifiers).toEqual(["WP-2", "WP-3"]);
    expect(exact.usedUtf8Bytes).toBe(exactBytes);
    expect(exact.parts).toHaveLength(5);

    const oneByteShort = project(analysis, onlySmall, { maxUtf8Bytes: exactBytes - 1, maxFragments: 5 });
    expect(oneByteShort.includedIdentifiers).toEqual(["WP-2"]);
    expect(oneByteShort.omittedIdentifiers).toEqual([{ identifier: "WP-3", reason: "byte-budget" }]);
    expect(oneByteShort.parts.map((p) => p.text)).toEqual([root, second, small]);
    expect(oneByteShort.usedUtf8Bytes).toBe([root, second, small].reduce(
      (sum, excerpt) => sum + Buffer.byteLength(excerpt), 0,
    ));

    const oneFragmentShort = project(analysis, onlySmall, { maxUtf8Bytes: exactBytes, maxFragments: 4 });
    expect(oneFragmentShort.includedIdentifiers).toEqual(["WP-2"]);
    expect(oneFragmentShort.omittedIdentifiers).toEqual([{ identifier: "WP-3", reason: "fragment-budget" }]);
    expect(oneFragmentShort.parts.map((p) => p.text)).toEqual([root, second, small]);

    const zero = project(analysis, onlySmall, { maxUtf8Bytes: 0, maxFragments: 0 });
    expect(zero).toMatchObject({ parts: [], includedIdentifiers: [], usedUtf8Bytes: 0 });
    expect(zero.omittedIdentifiers).toEqual([
      { identifier: "WP-2", reason: "byte-budget" },
      { identifier: "WP-3", reason: "byte-budget" },
    ]);
  });

  it("rejects every malformed numeric bound at public ingress", () => {
    for (const bad of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, -Infinity]) {
      for (const key of ["maxUtf8Bytes", "maxFragments"] as const) {
        const budget = { ...generous, [key]: bad } as ContextBudget;
        expect(extractContext(analysis, { selection, budget })).toMatchObject({
          ok: false, error: { code: "invalid-input" },
        });
      }
    }
  });

  it("continues after a fragment-limit omission when a later bundle fits", () => {
    const heading = `# ${declaration("WP-1")}`;
    const child = `## ${declaration("WP-2")}`;
    const text = [heading, "one", "two", "three", "four", child, "tiny"].join("\n\n");
    const a = analyze(text);
    const result = project(a, select(a, ["WP-1", "WP-2"]), {
      maxUtf8Bytes: 100_000, maxFragments: 3,
    });
    expect(result.includedIdentifiers).toEqual(["WP-2"]);
    expect(result.omittedIdentifiers).toEqual([{ identifier: "WP-1", reason: "fragment-budget" }]);
    expect(result.parts.map((p) => p.text)).toEqual([heading, child, "tiny"]);
    expect(result.parts.map((p) => p.range)).toEqual([
      expectedRange(text, heading), expectedRange(text, child), expectedRange(text, "tiny"),
    ]);
  });

  it("records both declarations of one ambiguous paragraph without any admitted part", () => {
    const paragraph = `${declaration("WP-1")} ${declaration("WP-2")}`;
    const a = analyze(`${paragraph}\n\nUnowned tail.`);
    const result = project(a, select(a, ["WP-1", "WP-2"]), {
      maxUtf8Bytes: 0, maxFragments: 0,
    });
    const fragmentId = a.snapshot.occurrences[0].fragmentId;
    expect(a.snapshot.occurrences.slice(0, 2).map((o) => o.fragmentId)).toEqual([
      fragmentId, fragmentId,
    ]);
    expect(result.omittedIdentifiers).toEqual([
      { identifier: "WP-1", reason: "ambiguous-ownership", fragmentId,
        sourceRange: expectedRange(`${paragraph}\n\nUnowned tail.`, paragraph), declarationIds: ["O1", "O2"] },
      { identifier: "WP-2", reason: "ambiguous-ownership", fragmentId,
        sourceRange: expectedRange(`${paragraph}\n\nUnowned tail.`, paragraph), declarationIds: ["O1", "O2"] },
    ]);
    expect(result.parts).toEqual([]);
    expect(result.includedIdentifiers).toEqual([]);
    expect(result.usedUtf8Bytes).toBe(0);
  });

  it("omits all ambiguous owners before budget checks yet permits shared heading support", () => {
    const ambiguous = `# ${declaration("WP-1")} ${declaration("WP-2")}`;
    const child = `## ${declaration("WP-3")}`;
    const body = "Child evidence.";
    const text = [ambiguous, child, body].join("\n\n");
    const a = analyze(text);
    const all = select(a, ["WP-1", "WP-2", "WP-3"]);
    const outcome = project(a, all);
    const fragment = a.snapshot.fragments.find((f) => f.range.start.offset === 0)!;
    const declarationIds = a.snapshot.occurrences.slice(0, 2).map((o) => o.id);
    expect(outcome.includedIdentifiers).toEqual(["WP-3"]);
    expect(outcome.omittedIdentifiers).toEqual([
      { identifier: "WP-1", reason: "ambiguous-ownership", fragmentId: fragment.id,
        sourceRange: expectedRange(text, ambiguous), declarationIds },
      { identifier: "WP-2", reason: "ambiguous-ownership", fragmentId: fragment.id,
        sourceRange: expectedRange(text, ambiguous), declarationIds },
    ]);
    expect(outcome.parts.map((p) => p.text)).toEqual([ambiguous, child, body]);
    expect(outcome.parts.map((p) => p.roles)).toEqual([
      ["heading"], ["owned-content"], ["owned-content"],
    ]);
    expect(outcome.parts.every((p) => p.forIdentifiers.join() === "WP-3")).toBe(true);

    const onlyAmbiguous = project(a, select(a, ["WP-1", "WP-2"]));
    expect(onlyAmbiguous.parts).toEqual([]);
    expect(onlyAmbiguous.includedIdentifiers).toEqual([]);
    expect(onlyAmbiguous.usedUtf8Bytes).toBe(0);
    expect(onlyAmbiguous.omittedIdentifiers.map((o) => o.reason)).toEqual([
      "ambiguous-ownership", "ambiguous-ownership",
    ]);
    const zero = project(a, all, { maxUtf8Bytes: 0, maxFragments: 0 });
    expect(zero.omittedIdentifiers.map((o) => o.reason)).toEqual([
      "ambiguous-ownership", "ambiguous-ownership", "byte-budget",
    ]);
    expect(zero.parts).toEqual([]);
  });
});
