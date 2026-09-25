import { describe, expect, it } from "vitest";
import {
  analyze, declaration, expectedRange, project, select,
} from "./document-graph-context/fixture.js";

describe("context source boundaries", () => {
  it("keeps Unicode, CRLF, literal code and nested list scopes exact", () => {
    const heading = `# ${declaration("WP-1")}`;
    const parent = "Parent 🧪 body.";
    const code = "```txt\r\nWP-99 is literal.\r\n```";
    const item = `- ${declaration("WP-2")}`;
    const itemBody = "  Item α body.";
    const child = `  - ${declaration("WP-3")}`;
    const childBody = "    Child body.";
    const source = [heading, parent, code, item, itemBody, child, childBody].join("\r\n\r\n");
    const analysis = analyze(source);
    expect(analysis.snapshot.occurrences.map((o) => o.identifier)).toEqual([
      "WP-1", "WP-2", "WP-3",
    ]);

    const parentResult = project(analysis, select(analysis, ["WP-1"]));
    expect(parentResult.parts.map((p) => p.text)).toEqual([heading, parent, code]);
    expect(parentResult.parts.map((p) => p.range)).toEqual([
      expectedRange(source, heading), expectedRange(source, parent), expectedRange(source, code),
    ]);
    expect(parentResult.parts.every((p) => p.roles.join() === "owned-content")).toBe(true);
    expect(parentResult.parts.map((p) => p.forIdentifiers)).toEqual([
      ["WP-1"], ["WP-1"], ["WP-1"],
    ]);
    expect(parentResult.parts.flatMap((p) => p.text).join("\n")).not.toContain("Child body");

    const itemResult = project(analysis, select(analysis, ["WP-2"]));
    expect(itemResult.parts.map((p) => p.text)).toEqual([heading, item, itemBody]);
    expect(itemResult.parts.map((p) => p.range)).toEqual([
      expectedRange(source, heading), expectedRange(source, item), expectedRange(source, itemBody),
    ]);
    expect(itemResult.parts.map((p) => p.roles)).toEqual([
      ["heading"], ["owned-content"], ["owned-content"],
    ]);
    expect(itemResult.parts.map((p) => p.forIdentifiers)).toEqual([
      ["WP-2"], ["WP-2"], ["WP-2"],
    ]);
    expect(itemResult.parts.map((p) => p.text).join("\n")).not.toContain("Parent 🧪 body");
    expect(itemResult.parts.map((p) => p.text).join("\n")).not.toContain("Child body");

    const childResult = project(analysis, select(analysis, ["WP-3"]));
    expect(childResult.parts.map((p) => p.text)).toEqual([heading, child, childBody]);
    expect(childResult.parts.map((p) => p.range)).toEqual([
      expectedRange(source, heading), expectedRange(source, child), expectedRange(source, childBody),
    ]);
    expect(childResult.parts[0].roles).toEqual(["heading"]);
    for (const result of [parentResult, itemResult, childResult]) {
      expect(result.usedUtf8Bytes).toBe(result.parts.reduce(
        (sum, part) => sum + Buffer.byteLength(part.text), 0,
      ));
      for (const part of result.parts)
        expect(part.text).toBe(source.slice(part.range.start.offset, part.range.end.offset));
    }
  });

  it("isolates quoted table rows and retains header and delimiter support", () => {
    const heading = `> ## ${declaration("WP-1")}`;
    const unrelated = "> Ancestor body.";
    const header = "> | Work | Note |";
    const delimiter = "> | --- | --- |";
    const first = `> | ${declaration("WP-2")} | café |`;
    const second = `> | ${declaration("WP-3")} | child |`;
    const source = [heading, ">", unrelated, ">", header, delimiter, first, second].join("\r\n");
    const analysis = analyze(source);
    const one = project(analysis, select(analysis, ["WP-2"]));
    expect(one.parts.map((p) => p.text)).toEqual([heading, header, delimiter, first]);
    expect(one.parts.map((p) => p.range)).toEqual([
      expectedRange(source, heading), expectedRange(source, header),
      expectedRange(source, delimiter), expectedRange(source, first),
    ]);
    expect(one.parts.map((p) => p.roles)).toEqual([
      ["heading"], ["table-header"], ["table-header"], ["owned-content"],
    ]);
    expect(one.parts.every((p) => p.forIdentifiers.join() === "WP-2")).toBe(true);
    expect(one.parts.map((p) => p.text).join("\n")).not.toContain("Ancestor body");
    expect(one.parts.map((p) => p.text).join("\n")).not.toContain("child");

    const both = project(analysis, select(analysis, ["WP-2", "WP-3"]));
    expect(both.parts.map((p) => p.text)).toEqual([
      heading, header, delimiter, first, second,
    ]);
    expect(both.parts.map((p) => p.forIdentifiers)).toEqual([
      ["WP-2", "WP-3"], ["WP-2", "WP-3"], ["WP-2", "WP-3"],
      ["WP-2"], ["WP-3"],
    ]);
    expect(both.usedUtf8Bytes).toBe([
      heading, header, delimiter, first, second,
    ].reduce((sum, excerpt) => sum + Buffer.byteLength(excerpt), 0));
  });
});
