import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument,
  compileProfile,
  type DocumentAnalysis,
  type Outcome,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

const profile = value(
  compileProfile(
    JSON.parse(readFileSync("fixtures/document-graph/profile.json", "utf8")),
  ),
);
const declaration = (id: string) =>
  `[${id}](ctx://trace/entity/${id}?role=definition)`;
const reference = (id: string) => `[${id}](ctx://trace/entity/${id})`;
function analyze(text: string): DocumentAnalysis {
  return value(
    analyzeDocument(
      { documentId: "fragment-support.md", text },
      profile,
      { maxSourceUtf8Bytes: 100_000, maxOccurrences: 100 },
    ),
  );
}
function fragmentText(analysis: DocumentAnalysis, text: string, identifier: string) {
  const occurrence = analysis.snapshot.occurrences.find(
    (item) => item.identifier === identifier,
  )!;
  const fragment = analysis.snapshot.fragments.find(
    (item) => item.id === occurrence.fragmentId,
  )!;
  return {
    fragment,
    text: text.slice(fragment.range.start.offset, fragment.range.end.offset),
  };
}

describe("source fragment support boundaries", () => {
  it.each(["\n", "\r\n", "\r"])(
    "expands nested quote/list fragments to the source line start with %j",
    (newline) => {
      const text = [
        `> - ${declaration("WP-1")}`,
        ">",
        `>   ${reference("REQ-1")}`,
        `> - ${declaration("WP-2")}`,
      ].join(newline);
      const analysis = analyze(text);
      const selected = fragmentText(analysis, text, "REQ-1");
      expect(selected.text).toBe(`>   ${reference("REQ-1")}`);
      expect(selected.fragment.range.start).toMatchObject({
        offset: text.indexOf(`>   ${reference("REQ-1")}`),
        column: 1,
      });
      expect(analysis.snapshot.relationships).toHaveLength(1);
      expect(analysis.snapshot.relationships[0].source).toMatchObject({
        status: "owned",
        identifier: "WP-1",
      });
    },
  );

  it.each(["\n", "\r\n", "\r"])(
    "bounds table delimiter support before the next quoted row line with %j",
    (newline) => {
      const text = [
        `> - ${declaration("WP-1")}`,
        ">   | Work | Requirement |",
        ">   | --- | --- |",
        `>   | ${declaration("WP-2")} | ${reference("REQ-1")} |`,
      ].join(newline);
      const analysis = analyze(text);
      const occurrence = analysis.snapshot.occurrences.find(
        (item) => item.identifier === "REQ-1",
      )!;
      const row = analysis.snapshot.fragments.find(
        (item) => item.id === occurrence.fragmentId,
      )!;
      const header = analysis.snapshot.fragments.find(
        (item) => item.structure === "table-row" && item.id !== row.id,
      )!;
      const delimiter = analysis.snapshot.fragments.find(
        (item) =>
          header.requiredContext.includes(item.id) && item.id !== header.id,
      )!;

      expect(text.slice(row.range.start.offset, row.range.end.offset)).toBe(
        `>   | ${declaration("WP-2")} | ${reference("REQ-1")} |`,
      );
      expect(
        text.slice(delimiter.range.start.offset, delimiter.range.end.offset),
      ).toBe(">   | --- | --- |");
      expect(delimiter.range.end.offset).toBe(
        text.indexOf(`>   | ${declaration("WP-2")}`) - newline.length,
      );
      expect(analysis.snapshot.relationships[0].source).toMatchObject({
        status: "owned",
        identifier: "WP-2",
      });
    },
  );
});
