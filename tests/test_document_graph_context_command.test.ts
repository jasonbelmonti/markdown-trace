import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";
import type { ContextBundle } from "../src/markdowntrace/document-graph/index.js";

const document = resolve("examples/preview-design/document.md");
const profile = resolve("examples/preview-design/profile.json");
const limits = ["--max-depth", "1", "--max-nodes", "10", "--max-utf8-bytes", "10000", "--max-fragments", "100"];
let temporary: string;
beforeAll(async () => { temporary = await mkdtemp(join(tmpdir(), "trace-context-command-")); });
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function run(flags: string[], file = document, profilePath = profile) {
  let stdout = "", stderr = "";
  const exitCode = await runDocumentCommand([
    "--file", file, "--profile", profilePath, "--format", "context", ...flags,
  ], { stdout: text => { stdout += text; }, stderr: text => { stderr += text; } });
  return { exitCode, stdout, stderr };
}

const context = (result: { stdout: string }): ContextBundle => JSON.parse(result.stdout).context;
const flags = (...extra: string[]) => [...limits, "--root", "REQ-1", ...extra];

describe("context command", () => {
  it("projects exact source and provenance through filtered traversal without modifying inputs", async () => {
    const before = await Promise.all([readFile(document, "utf8"), readFile(profile, "utf8")]);
    const args = flags("--direction", "incoming", "--relation", "implements");
    const result = await run(args);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const bundle = context(result);
    expect(bundle.includedIdentifiers).toEqual(["REQ-1", "DES-1"]);
    expect(bundle.omittedIdentifiers).toEqual([]);
    expect(bundle.source).toMatchObject({ documentId: document, sha256: createHash("sha256").update(before[0]).digest("hex") });
    expect(bundle.selection.query).toMatchObject({ roots: ["REQ-1"], direction: "incoming", relations: ["implements"], maxDepth: 1, maxNodes: 10 });
    expect(bundle.selection.nodes[1]).toMatchObject({ identifier: "DES-1", depth: 1, via: { from: "REQ-1", kind: "implements" } });
    const expected = before[0].split("\n\n").filter(part =>
      part === "# Local file preview" || part === "## Requirements" || part === "## Design" ||
      part.startsWith("[Selection controls") || part.startsWith("- [Selection handler"));
    expect(bundle.parts.map(part => part.text.trimEnd())).toEqual(expected);
    for (const part of bundle.parts)
      expect(part.text).toBe(before[0].slice(part.range.start.offset, part.range.end.offset));
    expect(bundle.parts.some(part => part.roles.includes("heading"))).toBe(true);
    expect(bundle.usedUtf8Bytes).toBe(bundle.parts.reduce((sum, part) => sum + Buffer.byteLength(part.text), 0));
    expect(JSON.parse(result.stdout).validation).toMatchObject({ status: "pass", sourceSha256: bundle.source.sha256 });
    expect(await run(args)).toEqual(result);
    expect(await Promise.all([readFile(document, "utf8"), readFile(profile, "utf8")])).toEqual(before);
  });

  it("accepts repeated roots and relations, both directions, and defaults to outgoing", async () => {
    const both = context(await run(flags("--root", "CHECK-1", "--root", "REQ-1", "--direction", "both",
      "--relation", "implements", "--relation", "verifies")));
    expect(both.selection.query.roots).toEqual(["CHECK-1", "REQ-1"]);
    expect(both.includedIdentifiers).toEqual(["CHECK-1", "REQ-1", "DES-1"]);
    expect(context(await run([...limits, "--root", "DES-1"])).includedIdentifiers).toEqual(["DES-1", "REQ-1"]);
  });

  it("exposes traversal cuts and atomic byte/fragment omissions without changing the validation verdict", async () => {
    const depth = context(await run(flags("--direction", "incoming", "--max-depth", "0")));
    expect(depth.includedIdentifiers).toEqual(["REQ-1"]);
    expect(depth.selection.boundary.depthLimited).toBe(true);
    const nodes = context(await run(flags("--direction", "incoming", "--max-nodes", "1")));
    expect(nodes.includedIdentifiers).toEqual(["REQ-1"]);
    expect(nodes.selection.boundary.nodeLimited).toBe(true);
    for (const [option, reason] of [["--max-utf8-bytes", "byte-budget"], ["--max-fragments", "fragment-budget"]]) {
      const result = await run(flags(option, "0"));
      expect(result.exitCode).toBe(0);
      expect(context(result)).toMatchObject({ parts: [], includedIdentifiers: [], usedUtf8Bytes: 0,
        omittedIdentifiers: [{ identifier: "REQ-1", reason }] });
    }
    const complete = context(await run(flags()));
    const exact = await run(flags("--max-utf8-bytes", String(complete.usedUtf8Bytes), "--max-fragments", String(complete.parts.length)));
    expect(context(exact).parts).toEqual(complete.parts);
    const short = context(await run(flags("--max-utf8-bytes", String(complete.usedUtf8Bytes - 1))));
    expect(short.omittedIdentifiers).toEqual([{ identifier: "REQ-1", reason: "byte-budget" }]);
  });

  it("retains available context on failed and indeterminate validation", async () => {
    const original = await readFile(document, "utf8");
    for (const [name, source, status] of [
      ["failed", original.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the requirement"), "fail"],
      ["partial", original + "\nA footnote[^a].\n\n[^a]: A note.\n", "indeterminate"],
    ]) {
      const file = join(temporary, `${name}.md`);
      await writeFile(file, source);
      const result = await run(flags(), file);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe("");
      expect(JSON.parse(result.stdout).validation.status).toBe(status);
      expect(context(result).includedIdentifiers).toEqual(["REQ-1"]);
    }
  });

  it("rejects missing, unannotated and duplicate root definitions instead of returning empty success", async () => {
    for (const [name, source] of [
      ["missing", "# Other document\n"],
      ["bare", "# REQ-1\nBare mentions do not define entities.\n"],
      ["duplicate", "[One](ctx://trace/entity/REQ-1?role=definition)\n\n[Two](ctx://trace/entity/REQ-1?role=definition)\n"],
    ]) {
      const file = join(temporary, `${name}.md`);
      await writeFile(file, source);
      const result = await run(flags(), file);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr).code).toBe("unresolved-root");
    }
  });

  it("rejects incomplete, malformed and misplaced context options", async () => {
    const malformed = ["", " ", "-1", "1.5", "NaN", "Infinity", "1e3", "0x10", "9007199254740992"];
    const cases = [
      limits, // no root
      flags("--root", ""), flags("--direction", "sideways"), flags("--relation", ""),
      flags("--max-nodes", "0"), flags("--root", "DES-1", "--max-nodes", "1"),
      flags("--identifier", "REQ-1"), flags("--offset", "0"), flags("--limit", "1"),
      ...["--max-depth", "--max-nodes", "--max-utf8-bytes", "--max-fragments"].flatMap(option => [
        flags().filter((_, index, all) => all[index] !== option && all[index - 1] !== option),
        ...malformed.map(raw => flags(`${option}=${raw}`)),
      ]),
      flags("--format", "query", "--identifier", "REQ-1"),
      ...["report", "graph", "mermaid", "html"].map(format => flags("--format", format)),
    ];
    for (const args of cases) {
      const result = await run(args);
      expect(result.exitCode, args.join(" ")).toBe(2);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr)).toMatchObject({ valid: false, message: expect.any(String) });
    }
  });
});
