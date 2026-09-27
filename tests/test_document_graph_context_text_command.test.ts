import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";

const document = resolve("examples/preview-design/document.md");
const profile = resolve("examples/preview-design/profile.json");
const limits = ["--max-depth", "1", "--max-nodes", "10", "--max-utf8-bytes", "10000", "--max-fragments", "100"];
let temporary: string;
beforeAll(async () => { temporary = await mkdtemp(join(tmpdir(), "trace-context-text-")); });
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function run(flags: string[], file = document, profilePath = profile) {
  let stdout = "", stderr = "";
  const exitCode = await runDocumentCommand([
    "--file", file, "--profile", profilePath, "--format", "context-text",
    "--root", "REQ-1", ...limits, ...flags,
  ], { stdout: text => { stdout += text; }, stderr: text => { stderr += text; } });
  return { exitCode, stdout, stderr };
}

function excerpts(text: string): string[] {
  return Array.from(text.matchAll(/^(`{3,})text\n([\s\S]*?)\n\1\n/gm), match => match[2]);
}

describe("context-text command", () => {
  it("retains the identical JSON report and renders exact selected text with a smaller response", async () => {
    const report = join(temporary, "full report.json");
    const flags = ["--direction", "incoming", "--relation", "implements"];
    const before = await Promise.all([readFile(document), readFile(profile)]);
    const json = await run([...flags, "--format", "context"]);
    const result = await run([...flags, "--report-file", report]);
    expect(result.exitCode).toBe(json.exitCode);
    expect(result.stderr).toBe("");
    const retained = await readFile(report, "utf8");
    expect(retained).toBe(json.stdout);
    const expected = before[0].toString().split("\n\n").filter(part =>
      part === "# Local file preview" || part === "## Requirements" || part === "## Design" ||
      part.startsWith("[Selection controls") || part.startsWith("- [Selection handler"));
    expect(excerpts(result.stdout).map(text => text.trimEnd())).toEqual(expected);
    expect(result.stdout).toContain(`Source: ${JSON.stringify(document)}; sha256: ${createHash("sha256").update(before[0]).digest("hex")}`);
    expect(result.stdout).toContain(`Report: ${JSON.stringify(report)}; sha256: ${createHash("sha256").update(retained).digest("hex")}`);
    expect(result.stdout).toContain("Validation: pass; analysis coverage: complete");
    expect(result.stdout).toContain("Required-context completeness: not evaluated");
    expect(result.stdout).toContain("unresolvedRelationships=0");
    expect(Buffer.byteLength(result.stdout)).toBeLessThan(Buffer.byteLength(json.stdout) / 2);
    await rm(report);
    expect(await run([...flags, "--report-file", report])).toEqual(result);
    expect(await Promise.all([readFile(document), readFile(profile)])).toEqual(before);
  });

  it("preserves Unicode, CRLF, whitespace, tables and nested fences without rewriting source", async () => {
    const heading = "# [Selected](ctx://trace/entity/REQ-1?role=definition)";
    const paragraph = "Keep café 🧪.  \r\n\tPreserve whitespace.";
    const code = "````txt\r\n```inside\r\n```\r\n````";
    const table = ["| Item | Value |", "| --- | --- |", "| literal | α |"];
    const source = [heading, paragraph, code, table.join("\r\n")].join("\r\n\r\n");
    const file = join(temporary, "exact.md"), config = join(temporary, "simple.json");
    const settings = JSON.parse(await readFile(profile, "utf8"));
    settings.validation = { minEntities: 1, allowedRelations: [], rules: [] };
    await writeFile(file, source);
    await writeFile(config, JSON.stringify(settings));
    const report = join(temporary, "exact.json");
    const result = await run(["--report-file", report], file, config);
    expect(result.exitCode).toBe(0);
    expect(excerpts(result.stdout)).toEqual([heading, paragraph, code, ...table]);
    const context = JSON.parse(await readFile(report, "utf8")).context;
    for (const [index, part] of context.parts.entries()) {
      expect(excerpts(result.stdout)[index]).toBe(source.slice(part.range.start.offset, part.range.end.offset));
      expect(result.stdout).toContain(`UTF-16 [${part.range.start.offset},${part.range.end.offset})`);
    }
    expect(await readFile(file, "utf8")).toBe(source);
  });

  it.each([
    ["--max-depth", "0", "depthLimited=true"],
    ["--max-nodes", "1", "nodeLimited=true"],
    ["--max-utf8-bytes", "0", "REQ-1: byte-budget"],
    ["--max-fragments", "0", "REQ-1: fragment-budget"],
  ])("exposes %s limits even when graph validation passes", async (option, value, expected) => {
    const result = await run(["--direction", "incoming", option, value,
      "--report-file", join(temporary, `${option}.json`)]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(expected);
    if (option === "--max-utf8-bytes" || option === "--max-fragments") {
      expect(result.stdout).toContain("No source excerpts selected.");
      expect(excerpts(result.stdout)).toEqual([]);
    }
  });

  it.each([
    ["failed", "fail"], ["partial", "indeterminate"],
  ])("keeps validation %s visible alongside available excerpts", async (name, status) => {
    const original = await readFile(document, "utf8");
    const source = name === "failed"
      ? original.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the requirement")
      : original + "\nA footnote[^a].\n\n[^a]: A note.\n";
    const file = join(temporary, `${name}.md`), report = join(temporary, `${name}.json`);
    await writeFile(file, source);
    const result = await run(["--report-file", report], file);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain(`Validation: ${status}`);
    expect(excerpts(result.stdout).length).toBeGreaterThan(0);
    const validation = JSON.parse(await readFile(report, "utf8")).validation;
    expect(validation.status).toBe(status);
    for (const diagnostic of validation.diagnostics.slice(0, 10)) {
      expect(result.stdout).toContain(diagnostic.code);
      expect(result.stdout).toContain(diagnostic.ruleId);
    }
  });

  it("shows unresolved edges and ownership omissions instead of implying complete context", async () => {
    const file = join(temporary, "unresolved.md");
    await writeFile(file, "[One](ctx://trace/entity/REQ-1?role=definition) [missing](ctx://trace/entity/REQ-404?rel=references)\n");
    const unresolved = await run(["--report-file", join(temporary, "unresolved.json")], file);
    expect(unresolved.exitCode).toBe(1);
    expect(unresolved.stdout).toContain("unresolvedRelationships=1");
    await writeFile(file, "[One](ctx://trace/entity/REQ-1?role=definition) [Two](ctx://trace/entity/REQ-2?role=definition)\n");
    const ambiguous = await run(["--report-file", join(temporary, "ambiguous.json")], file);
    expect(ambiguous.stdout).toContain("REQ-1: ambiguous-ownership");
    expect(ambiguous.stdout).toContain("No source excerpts selected.");
  });

  it("bounds repetitive status detail with explicit overflow counts and preserves the full report", async () => {
    const file = join(temporary, "many.md"), report = join(temporary, "many.json");
    const ids = Array.from({ length: 15 }, (_, index) => `REQ-${index + 1}`);
    await writeFile(file, ids.map(id => `[${id}](ctx://trace/entity/${id}?role=definition)`).join("\n\n"));
    const result = await run(["--report-file", report, "--max-nodes", "15", "--max-utf8-bytes", "0",
      ...ids.flatMap(id => ["--root", id])], file);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Omitted identifiers: 15");
    expect(result.stdout).toContain("5 more omissions in report");
    const retained = JSON.parse(await readFile(report, "utf8"));
    expect(retained.context.omittedIdentifiers).toHaveLength(15);
    expect(retained.validation.diagnostics.length).toBeGreaterThan(10);
    expect(result.stdout).toContain(`${retained.validation.diagnostics.length - 10} more diagnostics in report`);
  });

  it("does not publish a report or text when the requested root cannot be resolved", async () => {
    const report = join(temporary, "unusable.json");
    const result = await run(["--report-file", report, "--root", "REQ-404"]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr).code).toBe("unresolved-root");
    await expect(readFile(report)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
