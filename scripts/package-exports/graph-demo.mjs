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
}
