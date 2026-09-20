import assert from "node:assert/strict";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { run } from "./process.mjs";

export async function runGraphDemoSmoke(consumerDirectory, repositoryRoot) {
  const demo = path.join(consumerDirectory, "demo-document-graph.mjs");
  await copyFile(path.join(repositoryRoot, "scripts/demo-document-graph.mjs"), demo);
  const args = [
    demo, path.join(repositoryRoot, "fixtures/document-graph/mixed-layout.md"),
    "--profile", path.join(repositoryRoot, "fixtures/document-graph/profile.json"),
  ];
  const options = { cwd: consumerDirectory, encoding: "utf8" };
  const mermaid = run(process.execPath, [...args, "--mermaid"], options);
  assert.match(mermaid.stdout, /^flowchart LR\n/);
  assert.ok(mermaid.stdout.includes('n2["REQ-3"]'));
  assert.ok(mermaid.stdout.includes('n4 -->|"implements"| n0'));
  assert.equal(mermaid.stderr, "");
  const json = JSON.parse(run(process.execPath, [...args, "--graph"], options).stdout);
  assert.equal(json.schemaVersion, "markdown-trace.document-graph.v1");
  assert.equal(json.identifiers.length, 6);
  const summary = JSON.parse(run(process.execPath, args, options).stdout);
  assert.equal(summary.totalBacklinks, 2);
  const conflict = spawnSync(process.execPath, [...args, "--graph", "--mermaid"], options);
  assert.equal(conflict.status, 1);
  assert.equal(conflict.stdout, "");
  assert.match(conflict.stderr, /Choose either --graph or --mermaid/);

  // Exercise the installed binary from outside the checkout, with an external profile.
  const command = path.join(consumerDirectory, "node_modules/.bin/markdown-trace-document");
  const documentArgs = [
    "--file", path.join(repositoryRoot, "examples/preview-design/document.md"),
    "--profile", path.join(repositoryRoot, "examples/preview-design/profile.json"),
  ];
  const validated = JSON.parse(run(command, documentArgs, options).stdout);
  assert.equal(validated.status, "pass");
  assert.equal(validated.identifiers, 3);
  assert.equal(validated.relationships, 2);
  const queried = JSON.parse(run(command, [...documentArgs, "--format", "query", "--identifier", "REQ-1"], options).stdout);
  assert.deepEqual(queried.references.items.map(item => item.relationship.source.identifier), ["DES-1", "CHECK-1"]);
  const html = run(command, [...documentArgs, "--format", "html"], options);
  assert.match(html.stdout, /^<!doctype html>/);
  assert.ok(html.stdout.includes("Trace checks passed"));
  assert.ok(html.stdout.includes("Selection handler"));
  assert.ok(html.stdout.includes("This check is proposed and has not run against an implementation."));
  assert.equal(html.stderr, "");
}
