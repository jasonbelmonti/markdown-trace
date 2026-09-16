import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  findIncoming,
  findOutgoing,
  lookupIdentifier,
  type Outcome,
  type SourceRange,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const profileInput = JSON.parse(
  readFileSync("fixtures/document-graph/profile.json", "utf8"),
);
const profile = value(compileProfile(profileInput));
const limits = { maxSourceUtf8Bytes: 100_000, maxOccurrences: 10_000 };
const declaration = (id: string) =>
  `[${id}](ctx://trace/entity/${id}?role=definition)`;
const reference = (id: string, relation?: string) =>
  `[${id}](ctx://trace/entity/${id}${relation ? `?rel=${relation}` : ""})`;
const analyze = (text: string) =>
  value(analyzeDocument({ documentId: "links.md", text }, profile, limits));
const slice = (text: string, range: SourceRange) =>
  text.slice(range.start.offset, range.end.offset);

// These expected owners and relationships are chosen directly from each document.
describe("standard Markdown links as graph annotations", () => {
  it.each([
    [
      "heading",
      `## ${declaration("WP-1")}\n\n${reference("REQ-1", "implements")}`,
    ],
    ["paragraph", `${declaration("WP-1")} ${reference("REQ-1", "implements")}`],
    [
      "list",
      `- ${declaration("WP-1")}\n  - ${reference("REQ-1", "implements")}`,
    ],
    ["quote", `> ${declaration("WP-1")} ${reference("REQ-1", "implements")}`],
    [
      "table",
      `| Work | Relation |\n| --- | --- |\n| ${declaration("WP-1")} | ${reference("REQ-1", "implements")} |`,
    ],
  ])("keeps the same graph facts in a %s", (_layout, body) => {
    const text = `${body}\n\n${declaration("REQ-1")}`;
    const analysis = analyze(text),
      page = value(findIncoming(analysis, "REQ-1"));
    expect(page.coverage).toBe("complete");
    expect(page.totalMatches).toBe(1);
    expect(page.items[0].relationship).toMatchObject({
      kind: "implements",
      target: "REQ-1",
      source: { status: "owned", identifier: "WP-1" },
    });
    expect(slice(text, page.items[0].occurrence.range)).toBe(
      reference("REQ-1", "implements"),
    );
    expect(
      value(lookupIdentifier(analysis, "REQ-1")).record?.definition.status,
    ).toBe("resolved");
    expect(value(findOutgoing(analysis, "WP-1")).items).toEqual(page.items);
  });
  it("assigns the local owner even when its declaration follows the reference", () => {
    const analysis = analyze(
      `${reference("REQ-1", "implements")} ${declaration("WP-1")}\n\n${declaration("REQ-1")}`,
    );
    expect(
      value(findIncoming(analysis, "REQ-1")).items[0].relationship.source,
    ).toMatchObject({ status: "owned", identifier: "WP-1" });
  });
  it("preserves generic-ID boundaries and escaping without a brace parser", () => {
    const text = `# ${declaration("WP-1")}\n\n**REQ-1** REQ-**2** αREQ-3 REQ-4_A REQ&#45;5 \\REQ-6 REQ-7`;
    expect(analyze(text).snapshot.relationships.map((r) => r.target)).toEqual([
      "REQ-1",
      "REQ-7",
    ]);
  });
  it("uses URI identity once, independent of display labels and formatting", () => {
    const text =
      "# [Build **sign-in**](ctx://trace/entity/WP-1?role=definition)\n\n[REQ-99 and `REQ-88`](ctx://trace/entity/REQ-1?rel=implements)";
    const graph = analyze(text).snapshot;
    expect(graph.occurrences.map((o) => [o.identifier, o.role])).toEqual([
      ["WP-1", "definition"],
      ["REQ-1", "reference"],
    ]);
    expect(slice(text, graph.occurrences[1].range)).toBe(
      "[REQ-99 and `REQ-88`](ctx://trace/entity/REQ-1?rel=implements)",
    );
  });
  it("resolves full, collapsed and shortcut reference-style links at each use", () => {
    const text =
      "# [Work][work]\n\n[one][req] [req][] [req]\n\n[work]: ctx://trace/entity/WP-1?role=definition\n[req]: ctx://trace/entity/REQ-1?rel=implements\n[unused]: ctx://trace/entity/REQ-99?role=definition";
    const graph = analyze(text).snapshot;
    expect(
      graph.occurrences.map((o) => [o.identifier, slice(text, o.range)]),
    ).toEqual([
      ["WP-1", "[Work][work]"],
      ["REQ-1", "[one][req]"],
      ["REQ-1", "[req][]"],
      ["REQ-1", "[req]"],
    ]);
    expect(graph.relationships.map((r) => r.kind)).toEqual([
      "implements",
      "implements",
      "implements",
    ]);
  });
  it("recognizes a Trace autolink and default generic relation", () => {
    const text = `# ${declaration("WP-1")}\n\n<ctx://trace/entity/REQ-1?rel=depends-on> ${reference("REQ-2")}`;
    const graph = analyze(text).snapshot;
    expect(graph.relationships.map((r) => [r.target, r.kind])).toEqual([
      ["REQ-1", "depends-on"],
      ["REQ-2", "references"],
    ]);
    expect(slice(text, graph.occurrences[1].range)).toBe(
      "<ctx://trace/entity/REQ-1?rel=depends-on>",
    );
  });
  it("preserves nested ownership and restores the enclosing owner afterward", () => {
    const text = `# ${declaration("WP-1")}\n\n- ${declaration("WP-2")}\n  - ${reference("REQ-1")}\n\n> ## ${declaration("WP-3")}\n>\n> ${reference("REQ-2")}\n\n${reference("REQ-3")}\n\n# Plain heading\n\n${reference("REQ-4")}`;
    const graph = analyze(text).snapshot;
    expect(
      graph.relationships.map((r) => [
        r.target,
        r.source.status === "owned" ? r.source.identifier : r.source.status,
      ]),
    ).toEqual([
      ["REQ-1", "WP-2"],
      ["REQ-2", "WP-3"],
      ["REQ-3", "WP-1"],
      ["REQ-4", "unowned"],
    ]);
  });
  it("keeps literal code, images, frontmatter and ordinary destinations out of the graph", () => {
    const text = `---\nexample: '${reference("REQ-90")}'\n---\n# ${declaration("WP-1")}\n\n![REQ-91](ctx://trace/entity/REQ-91)\n\n\`${reference("REQ-92")}\`\n\n\`\`\`md\n${declaration("REQ-93")}\n\`\`\`\n\n[REQ-1](https://example.com/REQ-94) REQ-2 \`REQ-3\``;
    const graph = analyze(text).snapshot;
    expect(graph.occurrences.map((o) => o.identifier)).toEqual([
      "WP-1",
      "REQ-1",
      "REQ-2",
      "REQ-3",
    ]);
    expect(graph.relationships.every((r) => r.kind === "references")).toBe(
      true,
    );
  });
  it("keeps raw Unicode/CRLF coordinates for complete links", () => {
    const text = `# ${declaration("WP-1")}\r\n\r\n😀 ${reference("REQ-1", "implements")}\r\n`;
    const match = value(findIncoming(analyze(text), "REQ-1")).items[0];
    expect(match.occurrence.range.start).toEqual({
      offset: text.indexOf("[REQ-1]"),
      line: 3,
      column: 4,
    });
    expect(slice(text, match.occurrence.range)).toBe(
      reference("REQ-1", "implements"),
    );
    expect(analyze(text).snapshot.source.utf8Bytes).toBe(
      Buffer.byteLength(text),
    );
  });
  it("rejects the former language version and removes brace marker semantics", () => {
    expect(
      compileProfile({
        ...profileInput,
        interpretation: {
          ...profileInput.interpretation,
          language: "markdown-trace.identity.draft1",
        },
      }),
    ).toMatchObject({ ok: false, error: { code: "unsupported-version" } });
    const graph = analyze("{#WP-1} {implements:REQ-1}").snapshot;
    expect(graph.occurrences.every((o) => o.role === "reference")).toBe(true);
    expect(graph.relationships.every((r) => r.kind === "references")).toBe(
      true,
    );
  });
  it.each([
    "ctx://trace/entity/req-1",
    "ctx://trace/entity/REQ-1?rel=bad_slug",
    "ctx://trace/entity/REQ-1?rel=implements&rel=verifies",
    "ctx://trace/entity/REQ-1?role=definition&rel=implements",
    "ctx://trace/entity/REQ-1?role=reference",
    "ctx://trace/entity/REQ-1?unknown=x",
    "ctx://trace/entity/REQ%2D1",
    "ctx://trace/entity/REQ-1?rel=%69mplements",
    "ctx://user@trace/entity/REQ-1",
    "ctx://trace:80/entity/REQ-1",
    "ctx://trace/entity/REQ-1#fragment",
    "ctx://trace/entity/REQ-1/extra",
    "ctx://trace/other/REQ-1",
    "ctx:broken",
  ])(
    "diagnoses malformed reserved destination %s without label fallback",
    (destination) => {
      const link = `[REQ-9](${destination})`,
        text = `# ${declaration("WP-1")}\n\n${link}`;
      const graph = analyze(text).snapshot;
      expect(graph.relationships).toEqual([]);
      expect(graph.coverage).toBe("partial");
      expect(graph.diagnostics).toMatchObject([
        {
          code: "markdown-trace.language.malformed-link",
          identifiers: ["WP-1"],
        },
      ]);
      expect(slice(text, graph.diagnostics[0].sourceRanges[0])).toBe(link);
    },
  );
  it("keeps mixed-layout fragments and support references usable", () => {
    const graph = analyze(
      readFileSync("fixtures/document-graph/mixed-layout.md", "utf8"),
    ).snapshot;
    const fragments = new Map(graph.fragments.map((f) => [f.id, f]));
    function checkSupport(id: string, ancestors = new Set<string>()) {
      expect(ancestors.has(id)).toBe(false);
      const fragment = fragments.get(id)!;
      expect(fragment).toBeDefined();
      for (const dependency of fragment.requiredContext)
        checkSupport(dependency, new Set(ancestors).add(id));
    }
    for (const fragment of graph.fragments) checkSupport(fragment.id);
    for (const occurrence of graph.occurrences) {
      const fragment = fragments.get(occurrence.fragmentId)!;
      expect(fragment.range.start.offset).toBeLessThanOrEqual(
        occurrence.range.start.offset,
      );
      expect(fragment.range.end.offset).toBeGreaterThanOrEqual(
        occurrence.range.end.offset,
      );
      expect(
        graph.exclusions.some(
          (e) =>
            e.range.start.offset < occurrence.range.end.offset &&
            e.range.end.offset > occurrence.range.start.offset,
        ),
      ).toBe(false);
    }
  });
});
