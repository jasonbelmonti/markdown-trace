import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  analyzeDocument, compileProfile, exportMermaid,
  type Outcome,
} from "../src/markdowntrace/document-graph/index.js";

function value<T>(result: Outcome<T>): T {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}
const profile = value(compileProfile(JSON.parse(
  readFileSync("fixtures/document-graph/profile.json", "utf8"),
)));
const analyze = (text: string) => value(analyzeDocument(
  { documentId: "spec.md", text }, profile,
  { maxSourceUtf8Bytes: 100_000, maxOccurrences: 10_000 },
)).snapshot;

describe("Mermaid graph export", () => {
  it("exports all identifiers and directed typed edges, including an isolated identifier", () => {
    const snapshot = analyze(readFileSync("fixtures/document-graph/mixed-layout.md", "utf8"));
    const before = JSON.stringify(snapshot);
    const mermaid = exportMermaid(snapshot);
    expect(mermaid.split("\n").filter((line) => /^  n\d+\[/.test(line))).toEqual([
      '  n0["REQ-1"]', '  n1["REQ-2"]', '  n2["REQ-3"]',
      '  n3["VAL-1"]', '  n4["WP-1"]', '  n5["WP-2"]',
    ]);
    expect(mermaid.split("\n").filter((line) => line.includes(" -->"))).toEqual([
      '  n4 -->|"implements"| n0',
      '  n4 -->|"references"| n1',
      '  n3 -->|"verifies"| n4',
      '  n5 -->|"implements"| n1',
    ]);
    expect(mermaid).toContain("Extraction: complete<br/>Diagnostics: 0; exclusions: 1");
    expect(exportMermaid(snapshot)).toBe(mermaid);
    expect(exportMermaid(JSON.parse(before))).toBe(mermaid);
    expect(JSON.stringify(snapshot)).toBe(before);
  });

  it("shows missing and duplicate definitions and uncertain owners without inventing ownership", () => {
    const snapshot = analyze([
      "REQ-9",
      "[WP-1](ctx://trace/entity/WP-1?role=definition) [WP-2](ctx://trace/entity/WP-2?role=definition) [NEW-1](ctx://trace/entity/NEW-1?rel=custom-edge)",
      "[REQ-1](ctx://trace/entity/REQ-1?role=definition)",
      "[REQ-1](ctx://trace/entity/REQ-1?role=definition)",
    ].join("\n\n"));
    const mermaid = exportMermaid(snapshot);
    expect(mermaid).toContain('n0["NEW-1 (unknown kind; missing definition)"]:::unresolved');
    expect(mermaid).toContain('n1["REQ-1 (duplicate definitions: 2)"]:::unresolved');
    expect(mermaid).toContain('n2["REQ-9 (missing definition)"]:::unresolved');
    expect(mermaid).toContain('u0["Unowned reference at 1:1"]:::unresolved');
    expect(mermaid).toContain("Ambiguous owner at 3:");
    expect(mermaid).toContain('candidates: WP-1, WP-2"]:::unresolved');
    expect(mermaid.split("\n").filter((line) => line.includes(" -->"))).toEqual([
      '  u0 -->|"references"| n2',
      '  u1 -->|"custom-edge"| n0',
    ]);
    expect(mermaid).toContain("Extraction: partial<br/>Diagnostics: 2; exclusions: 0");
  });

  it("preserves repeated references and self references with custom relation names", () => {
    const mermaid = exportMermaid(analyze(
      "[WP-1](ctx://trace/entity/WP-1?role=definition) REQ-1 REQ-1 [WP-1](ctx://trace/entity/WP-1?rel=end)",
    ));
    expect(mermaid.split("\n").filter((line) => line.includes(" -->"))).toEqual([
      '  n1 -->|"references"| n0',
      '  n1 -->|"references"| n0',
      '  n1 -->|"end"| n1',
    ]);
  });

  it("keeps empty and partial graphs distinguishable without implying policy validity", () => {
    const empty = exportMermaid(analyze("No identifiers."));
    const malformed = exportMermaid(analyze("[Bad](ctx://trace/entity/REQ-1?rel=bad_slug)"));
    expect(empty).toContain("Extraction: complete<br/>Diagnostics: 0; exclusions: 0");
    expect(malformed).toContain("Extraction: partial<br/>Diagnostics: 1; exclusions: 0");
    for (const output of [empty, malformed]) {
      expect(output).toMatch(/^flowchart LR\n/);
      expect(output).toContain("Policy not evaluated");
      expect(output).not.toContain(" -->");
      expect(output).not.toMatch(/\bn\d+\[/);
    }
  });
});
