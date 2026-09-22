import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Oracles retained from test_document_graph_command.test.ts and packed graph-demo.mjs.
export async function provePreview(run, work) {
  const document = "input with spaces/preview.md", profile = "input with spaces/preview.json";
  const args = ["--file", document, "--profile", profile];
  const source = await readFile(join(work, document), "utf8");
  const report = JSON.parse(run(args).stdout);
  assert.equal(report.status, "pass");
  assert.equal(report.parserVersion, "3.6.0");
  assert.equal(report.identifiers, 3);
  assert.equal(report.relationships, 2);
  const graphRun = run([...args, "--format", "graph"]);
  assert.equal(run([...args, "--format", "graph"]).stdout, graphRun.stdout);
  const { graph } = JSON.parse(graphRun.stdout);
  assert.equal(graph.parserVersion, "3.6.0");
  assert.equal(graph.source.sha256, report.sourceSha256);
  assert.deepEqual(graph.identifiers.map(item => item.identifier).sort(), ["CHECK-1", "DES-1", "REQ-1"]);
  assert.deepEqual(graph.relationships.map(edge => `${edge.source.identifier} ${edge.kind} ${edge.target}`).sort(),
    ["CHECK-1 verifies REQ-1", "DES-1 implements REQ-1"]);
  const query = (id, ...extra) => JSON.parse(run([...args, "--format", "query", "--identifier", id, ...extra]).stdout);
  const first = query("REQ-1", "--limit", "1");
  assert.equal(first.lookup.record.identifier, "REQ-1");
  assert.equal(first.references.totalMatches, 2);
  assert.equal(first.references.nextOffset, 1);
  assert.equal(first.references.items[0].relationship.source.identifier, "DES-1");
  const range = first.references.items[0].occurrence.range;
  assert.equal(source.slice(range.start.offset, range.end.offset), "[the preview requirement](ctx://trace/entity/REQ-1?rel=implements)");
  const second = query("REQ-1", "--limit", "1", "--offset", "1");
  assert.equal(second.references.nextOffset, null);
  assert.equal(second.references.items[0].relationship.source.identifier, "CHECK-1");
  assert.equal(query("DES-1", "--direction", "outgoing").references.items[0].relationship.target, "REQ-1");
  assert.equal(query("REQ-404").lookup.record, null);
  const mermaid = run([...args, "--format", "mermaid"], 0, { stderr: true });
  assert.match(mermaid.stdout, /^flowchart LR\n/);
  assert.equal(mermaid.stdout.split("-->").length - 1, 2);
  assert.equal(JSON.parse(mermaid.stderr).status, "pass");
  const html = run([...args, "--format", "html"]).stdout;
  for (const text of ["<!doctype html>", "Trace checks passed", "Selection handler",
    "This check is proposed and has not run against an implementation."])
    assert.ok(html.includes(text));
  const broken = "missing-reference.md";
  await writeFile(join(work, broken), source.replace("[the preview requirement](ctx://trace/entity/REQ-1?rel=verifies)", "the preview requirement"));
  const failed = run(["--file", broken, "--profile", profile, "--format", "mermaid"], 1, { stderr: true });
  assert.match(failed.stdout, /^flowchart LR\n/);
  assert.ok(failed.stdout.includes("CHECK-1"));
  assert.equal(failed.stdout.split("-->").length - 1, 1);
  assert.equal(JSON.parse(failed.stderr).status, "fail");
  assert.ok(JSON.parse(failed.stderr).diagnostics.some(d => d.ruleId === "check-verifies-requirement" && d.code === "trace-validation.relation-count"));
  const raw = JSON.parse(await readFile(join(work, profile), "utf8"));
  raw.validation = { minEntities: 0, allowedRelations: [], rules: [] };
  await writeFile(join(work, "unrestricted.json"), JSON.stringify(raw));
  await writeFile(join(work, "unsupported.md"), "A footnote[^a].\n\n[^a]: A note.\n");
  const partial = JSON.parse(run(["--file", "unsupported.md", "--profile", "unrestricted.json", "--format", "graph"], 1).stdout);
  assert.equal(partial.validation.status, "indeterminate");
  assert.equal(partial.graph.coverage, "partial");
  await writeFile(join(work, "broken.json"), "{");
  for (const invalid of [["--file", document], [...args, "--unknown"],
    [...args, "--format", "query", "--identifier", "REQ-1", "--limit", "1001"],
    ["--file", document, "--profile", "broken.json"]]) {
    const rejected = run(invalid, 2, { stderr: true });
    assert.equal(rejected.stdout, "");
    assert.equal(JSON.parse(rejected.stderr).valid, false);
  }
  return { identifiers: ["CHECK-1", "DES-1", "REQ-1"], relationships: 2,
    sourceRange: range, modes: ["report", "graph", "query", "mermaid", "html"],
    failedGraphVisible: true, indeterminateGraphVisible: true, operationalErrors: 4 };
}
