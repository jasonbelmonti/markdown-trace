import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Exact expected graph and mutation oracles retained from the separate owner trial.
export async function proveTask(run, work) {
  const source = await readFile(join(work, "input with spaces/task.md"), "utf8");
  const profile = "input with spaces/task.json";
  const args = file => ["--file", file, "--profile", profile, "--format", "graph"];
  const good = JSON.parse(run(args("input with spaces/task.md")).stdout);
  assert.equal(good.validation.status, "pass");
  assert.equal(good.graph.parserVersion, "3.6.0");
  assert.deepEqual(good.graph.identifiers.map(record => record.identifier).sort(), ["SLICE-1", "TD-SC-1", "TD-SC-2", "TD-SC-3", "VAL-1", "VAL-2", "VAL-3"]);
  assert.deepEqual(good.graph.relationships.map(edge => `${edge.source.identifier} ${edge.kind} ${edge.target}`).sort(), [
    "SLICE-1 verified-by VAL-1", "SLICE-1 verified-by VAL-2", "SLICE-1 verified-by VAL-3",
    "VAL-1 verifies TD-SC-1", "VAL-2 verifies TD-SC-2", "VAL-3 verifies TD-SC-3",
  ]);
  const query = JSON.parse(run(["--file", "input with spaces/task.md", "--profile", profile,
    "--format", "query", "--identifier", "VAL-2"]).stdout);
  assert.equal(query.references.totalMatches, 1);
  assert.equal(query.references.items[0].relationship.source.identifier, "SLICE-1");
  const definition = "[Remove a slice link and misdirect a criterion link](ctx://trace/entity/VAL-2?role=definition)";
  const visible = "Remove a slice link and misdirect a criterion link";
  const slice = "[relationship probes](ctx://trace/entity/VAL-2?rel=verified-by)";
  const verifies = "[TD-SC-2](ctx://trace/entity/TD-SC-2?rel=verifies)";
  const line = source.split("\n").findIndex(row => row.includes(definition)) + 1;
  const mutations = [
    ["missing-definition", source.replace(definition, visible), "annotation-count", "validation-definitions"],
    ["missing-slice-link", source.replace(slice, "relationship probes"), "relation-count", "validation-has-slice"],
    ["wrong-existing-criterion", source.replace(verifies, "[TD-SC-2](ctx://trace/entity/TD-SC-1?rel=verifies)"), "text-mismatch", "validation-criterion-reference"],
    ["wholly-unannotated-check", source.replace(definition, visible).replace(slice, "relationship probes").replace(verifies, "TD-SC-2"), "annotation-count", "validation-definitions"],
  ];
  const results = [];
  for (const [name, text, code, ruleId] of mutations) {
    assert.notEqual(text, source);
    const file = `${name}.md`;
    await writeFile(join(work, file), text);
    const failed = JSON.parse(run(args(file), 1).stdout);
    assert.equal(failed.validation.valid, false);
    assert.equal(failed.validation.rules.find(rule => rule.id === "validation-definitions").selected, 3);
    const diagnostic = failed.validation.diagnostics.find(item => item.ruleId === ruleId && item.code === `trace-validation.${code}`);
    assert.ok(diagnostic);
    assert.equal(diagnostic.line, line);
    assert.ok(diagnostic.column > 0);
    if (name === "wholly-unannotated-check") assert.ok(!failed.graph.identifiers.some(record => record.identifier === "VAL-2"));
    assert.equal(await readFile(join(work, file), "utf8"), text);
    await writeFile(join(work, file), source);
    assert.equal(JSON.parse(run(args(file)).stdout).validation.valid, true);
    results.push({ name, diagnostic, repaired: true });
  }
  return { identifiers: 7, relationships: 6, backlink: "SLICE-1 verified-by VAL-2", mutations: results };
}
