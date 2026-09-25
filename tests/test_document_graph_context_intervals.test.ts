import { describe, expect, it } from "vitest";
import { projectIntervals, type ContextClaim } from "../src/markdowntrace/document-graph/context/intervals.js";
import type { SourceRange } from "../src/markdowntrace/document-graph/contracts/source.js";

const range = (start: number, end: number): SourceRange => ({
  start: { offset: start, line: 1, column: start + 1 },
  end: { offset: end, line: 1, column: end + 1 },
});
const claim = (start: number, end: number, identifier: string, role: ContextClaim["role"]): ContextClaim => ({
  range: range(start, end), identifier, role,
});

describe("strict source interval accounting", () => {
  it("unions true overlap once while keeping touching parts and separated gaps", () => {
    const result = projectIntervals("abcdefghij", [
      claim(6, 8, "C", "table-header"),
      claim(2, 6, "B", "heading"),
      claim(9, 10, "D", "owned-content"),
      claim(0, 4, "A", "owned-content"),
    ], ["D", "B", "A", "C"]);
    expect(result).toEqual({
      parts: [
        { range: range(0, 6), text: "abcdef", forIdentifiers: ["B", "A"], roles: ["owned-content", "heading"] },
        { range: range(6, 8), text: "gh", forIdentifiers: ["C"], roles: ["table-header"] },
        { range: range(9, 10), text: "j", forIdentifiers: ["D"], roles: ["owned-content"] },
      ],
      usedUtf8Bytes: 9,
    });
  });

  it("counts overlapping multibyte text once and does not collapse a one-character gap", () => {
    const text = "😀é·Z"; // UTF-16 offsets 0..2, 2..3, 3..4, 4..5.
    const result = projectIntervals(text, [
      claim(0, 3, "A", "owned-content"),
      claim(2, 3, "B", "heading"),
      claim(4, 5, "C", "owned-content"),
    ], ["A", "B", "C"]);
    expect(result.parts.map((p) => [p.range, p.text, p.forIdentifiers])).toEqual([
      [range(0, 3), "😀é", ["A", "B"]],
      [range(4, 5), "Z", ["C"]],
    ]);
    expect(result.usedUtf8Bytes).toBe(7); // 4 + 2 + 1; gap '·' is excluded.
  });
});
