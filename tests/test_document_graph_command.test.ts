import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runDocumentCommand } from "../src/markdowntrace/document-graph/command.js";

const design = resolve("examples/preview-design/document.md");
const designProfile = resolve("examples/preview-design/profile.json");
const task = resolve("experiments/task-definition-trace/task-definition.md");
const taskProfile = resolve("experiments/task-definition-trace/profile.json");
let temporary: string;
beforeAll(async () => { temporary = await mkdtemp(join(tmpdir(), "trace-command-")); });
afterAll(async () => { await rm(temporary, { recursive: true, force: true }); });

async function run(args: string[]) {
  let stdout = "", stderr = "";
  const exitCode = await runDocumentCommand(args, {
    stdout: text => { stdout += text; }, stderr: text => { stderr += text; },
  });
  return { exitCode, stdout, stderr };
}
const inputs = (file = design, profile = designProfile) => ["--file", file, "--profile", profile];
const query = (identifier: string, ...flags: string[]) => run([
  ...inputs(), "--format", "query", "--identifier", identifier, ...flags,
]);

describe("shared document command", () => {
  it.each([
    [design, designProfile, ["CHECK-1", "DES-1", "REQ-1"], 2],
    [task, taskProfile, ["SLICE-1", "TD-SC-1", "TD-SC-2", "TD-SC-3", "VAL-1", "VAL-2", "VAL-3"], 6],
  ] as const)("validates and exports %s through its supplied profile", async (file, profile, ids, edgeCount) => {
    const before = await Promise.all([readFile(file), readFile(profile)]);
    const args = [...inputs(file, profile), "--format", "graph"];
    const result = await run(args);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const { validation, graph } = JSON.parse(result.stdout);
    expect(validation).toMatchObject({ status: "pass", identifiers: ids.length, relationships: edgeCount });
    expect(graph.identifiers.map((record: { identifier: string }) => record.identifier).sort()).toEqual(ids);
    expect(validation.sourceSha256).toBe(graph.source.sha256);
    expect(await run(args)).toEqual(result);
    expect(await Promise.all([readFile(file), readFile(profile)])).toEqual(before);
  });

  it("detects a wholly unannotated list item and passes after its annotations are restored", async () => {
    const original = await readFile(design, "utf8");
    const path = join(temporary, "missing-check.md");
    const line = original.split("\n").findIndex(text => text.startsWith("- [Selection behavior")) + 1;
    const missing = original.split("\n").map((text, index) => index + 1 === line
      ? "- Opening the picker without selecting a file leaves the preview unchanged; selecting a file updates it."
      : text).join("\n");
    await writeFile(path, missing);
    const failed = await run([...inputs(path), "--format", "graph"]);
    expect(failed.exitCode).toBe(1);
    const { validation, graph } = JSON.parse(failed.stdout);
    expect(validation.diagnostics).toContainEqual(expect.objectContaining({
      ruleId: "check-definitions", code: "trace-validation.annotation-count", line,
    }));
    expect(validation.rules).toContainEqual(expect.objectContaining({ id: "check-definitions", selected: 1 }));
    expect(graph.identifiers.map((record: { identifier: string }) => record.identifier)).not.toContain("CHECK-1");
    expect(await readFile(path, "utf8")).toBe(missing);
    await writeFile(path, original);
    expect((await run(inputs(path))).exitCode).toBe(0);
  });

  it("keeps a failed graph visible in Mermaid with its separate validation verdict", async () => {
    const path = join(temporary, "missing-reference.md");
    const original = await readFile(design, "utf8");
    const missing = original.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the preview requirement");
    expect(missing).not.toBe(original);
    await writeFile(path, missing);
    const result = await run([...inputs(path), "--format", "mermaid"]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toMatch(/^flowchart LR\n/);
    expect(result.stdout).toContain("CHECK-1");
    expect(result.stdout.split("-->")).toHaveLength(2); // The remaining design edge.
    expect(JSON.parse(result.stderr)).toMatchObject({ status: "fail", relationships: 1 });
    expect(JSON.parse(result.stderr).diagnostics).toContainEqual(expect.objectContaining({
      ruleId: "check-verifies-requirement", code: "trace-validation.relation-count",
    }));
    const valid = await run([...inputs(), "--format", "mermaid"]);
    expect(valid.exitCode).toBe(0);
    expect(JSON.parse(valid.stderr).status).toBe("pass");
  });

  it("queries incoming/outgoing occurrences with usable pagination and source ranges", async () => {
    const first = JSON.parse((await query("REQ-1", "--limit", "1")).stdout);
    expect(first.lookup.record.identifier).toBe("REQ-1");
    expect(first.references).toMatchObject({ totalMatches: 2, nextOffset: 1 });
    expect(first.references.items[0].relationship).toMatchObject({ source: { identifier: "DES-1" }, kind: "implements" });
    const source = await readFile(design, "utf8");
    const range = first.references.items[0].occurrence.range;
    expect(source.slice(range.start.offset, range.end.offset)).toBe("[the preview requirement](ctx://trace/entity/REQ-1?rel=implements)");
    const second = JSON.parse((await query("REQ-1", "--limit", "1", "--offset", "1")).stdout);
    expect(second.references.nextOffset).toBeNull();
    expect(second.references.items[0].relationship.source.identifier).toBe("CHECK-1");
    const outgoing = JSON.parse((await query("DES-1", "--direction", "outgoing")).stdout);
    expect(outgoing.references.items[0].relationship.target).toBe("REQ-1");
    expect(JSON.parse((await query("REQ-404")).stdout).lookup.record).toBeNull();
  });

  it("distinguishes invocation/configuration errors from indeterminate validation", async () => {
    const brokenProfile = join(temporary, "broken.json");
    await writeFile(brokenProfile, "{");
    for (const args of [
      ["--file", design], inputs(design, brokenProfile), [...inputs(), "--unknown"],
      [...inputs(), "--format", "query", "--identifier", "REQ-1", "--limit", "1001"],
    ]) {
      const result = await run(args);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe("");
      expect(JSON.parse(result.stderr).valid).toBe(false);
    }
    const profile = JSON.parse(await readFile(designProfile, "utf8"));
    profile.validation = { minEntities: 0, allowedRelations: [], rules: [] };
    const profilePath = join(temporary, "unrestricted.json");
    const path = join(temporary, "unsupported.md");
    await writeFile(profilePath, JSON.stringify(profile));
    await writeFile(path, "A footnote[^a].\n\n[^a]: A note.\n");
    const result = await run(inputs(path, profilePath));
    expect(result.exitCode).toBe(1);
    expect(JSON.parse(result.stdout).status).toBe("indeterminate");
  });
});
