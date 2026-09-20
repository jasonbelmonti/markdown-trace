import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as engine from "@jasonbelmonti/markdown-engine";
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeDocument, compileValidationProfile, validateGraph, type Outcome } from "../src/markdowntrace/document-graph/index.js";
import { exportHtml } from "../src/markdowntrace/document-graph/export/html.js";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";

vi.mock("@jasonbelmonti/markdown-engine", async importOriginal => {
  const actual = await importOriginal<typeof engine>();
  return { ...actual, parse: vi.fn(actual.parse), normalize: vi.fn(actual.normalize) };
});
afterEach(() => vi.clearAllMocks());
const path = "examples/preview-design/document.md";
const profilePath = "examples/preview-design/profile.json";
const original = readFileSync(path, "utf8");
const value = <T>(outcome: Outcome<T>) => {
  if (!outcome.ok) throw new Error(outcome.error.message);
  return outcome.value;
};
function prepare(text = original, documentId = path) {
  const profile = value(compileValidationProfile(readFileSync(profilePath, "utf8")));
  const analysis = value(analyzeDocument({ text, documentId }, profile, { maxSourceUtf8Bytes: 100_000, maxOccurrences: 1000 }));
  return { analysis, validation: value(validateGraph(analysis, profile)) };
}
function diagram(html: string): string {
  return JSON.parse(html.match(/<script type="application\/json" id="trace-diagram">([^]*?)<\/script>/)![1]);
}

describe("visual HTML report", () => {
  it("uses Engine's captured labels and context without another parse or graph changes", () => {
    const { analysis, validation } = prepare();
    const before = JSON.stringify(analysis.snapshot);
    const html = exportHtml(analysis, validation);
    expect(html).toContain("<h1>Local file preview</h1>");
    expect(html).toContain("Trace checks passed");
    expect(html).not.toContain("Policy not evaluated");
    expect(html).toContain("Definition at line 13");
    expect(html).toContain("This check is proposed and has not run against an implementation.");
    expect(diagram(html)).toContain('n1["DES-1<br/>Selection handler"]');
    expect(diagram(html).split("-->")).toHaveLength(3);
    expect(JSON.stringify(analysis.snapshot)).toBe(before);
    expect(exportHtml(analysis, validation)).toBe(html);
    expect(engine.parse).toHaveBeenCalledTimes(1);
    expect(engine.normalize).toHaveBeenCalledTimes(1);
  });

  it("takes formatted reference-link labels from Engine rather than guessing Markdown text", () => {
    const text = original.replace("[Selection handler](ctx://trace/entity/DES-1?role=definition)",
      "[**Selection handler**][design]") + "\n[design]: ctx://trace/entity/DES-1?role=definition\n";
    const { analysis, validation } = prepare(text);
    expect(validation.valid).toBe(true);
    expect(diagram(exportHtml(analysis, validation))).toContain('n1["DES-1<br/>Selection handler"]');
    expect(engine.parse).toHaveBeenCalledTimes(1);
  });

  it("includes normalized table-row context from the TaskDefinition example", () => {
    const documentId = "experiments/task-definition-trace/task-definition.md";
    const profile = value(compileValidationProfile(readFileSync("experiments/task-definition-trace/profile.json", "utf8")));
    const analysis = value(analyzeDocument({ documentId, text: readFileSync(documentId, "utf8") }, profile,
      { maxSourceUtf8Bytes: 100_000, maxOccurrences: 1000 }));
    const html = exportHtml(analysis, value(validateGraph(analysis, profile)));
    expect(html).toContain("The local checker rejects a validation row whose declaration link is removed");
    expect(html).toContain("Definition at line 57");
    expect(diagram(html).split("-->")).toHaveLength(7);
    expect(engine.parse).toHaveBeenCalledTimes(1);
  });

  it("keeps source-provided HTML and script terminators inert in the page and diagram data", () => {
    const attack = '</script><img src=x onerror="alert(1)">';
    const encoded = "&lt;/script&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;";
    const { analysis, validation } = prepare(original
      .replace("# Local file preview", "# " + encoded)
      .replace("[Selection handler]", "[" + encoded + "]"), attack);
    const html = exportHtml(analysis, validation);
    expect(html).not.toContain(attack);
    expect(html).toContain("&lt;/script&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(diagram(html)).not.toContain("<img");
    expect(diagram(html)).toContain("#60;img");
  });

  it("writes a useful HTML report on validation failure while preserving exit 1", async () => {
    const directory = await mkdtemp(join(tmpdir(), "trace-html-"));
    try {
      const file = join(directory, "missing-link.md");
      await writeFile(file, original.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the requirement"));
      let stdout = "", stderr = "";
      const code = await runDocumentCommand(["--file", file, "--profile", profilePath, "--format", "html"], {
        stdout: text => { stdout += text; }, stderr: text => { stderr += text; },
      });
      expect(code).toBe(1);
      expect(stderr).toBe("");
      expect(stdout).toMatch(/^<!doctype html>/);
      expect(stdout).toContain("Trace checks failed");
      expect(stdout).toContain("check-verifies-requirement");
      expect(stdout).toContain("line 13:");
      expect(diagram(stdout).split("-->")).toHaveLength(2);
      expect(diagram(stdout)).toContain("CHECK-1");
      expect(engine.parse).toHaveBeenCalledTimes(1);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
