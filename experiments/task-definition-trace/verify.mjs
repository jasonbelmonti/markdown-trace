import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { linkSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { findIncoming, analyzeDocument, compileValidationProfile } from "@jasonbelmonti/markdown-trace/experimental/graph";
import { proveProfiles } from "./profile-proof.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const output = join(here, "output");
const sourcePath = join(here, "task-definition.md");
const source = readFileSync(sourcePath, "utf8");
const hash = text => createHash("sha256").update(text).digest("hex");
const fileHash = path => hash(readFileSync(path));
const inputPaths = ["authoring.md", "task-definition.md", "profile.json", "check.mjs", "run.mjs", "verify.mjs", "profile-proof.mjs",
  ...builtFiles(join(here, "../../src/markdowntrace/document-graph"), ".ts").map(path => relative(here, path))];
const inputs = Object.fromEntries(inputPaths.map(path => [path, fileHash(join(here, path))]));
mkdirSync(output, { recursive: true });
const results = [];
function run(path, out, expectedExit, profile = join(here, "profile.json")) {
  const before = fileHash(path);
  const execution = spawnSync(process.execPath, [join(here, "run.mjs"), path, "--profile", profile, "--out", out], { encoding: "utf8", timeout: 30_000 });
  assert.equal(execution.status, expectedExit, execution.stderr + execution.stdout);
  assert.equal(fileHash(path), before, "CLI must preserve the input");
  return JSON.parse(execution.stdout);
}
const good = run(sourcePath, join(output, "valid"), 0);
assert.equal(good.valid, true);
assert.equal(good.structural.engineVersion, "3.6.0");
assert.deepEqual(good.trace.rules.filter(rule => rule.id.endsWith("-definitions")).map(rule => rule.selected), [3, 3, 1]);
const graph = JSON.parse(readFileSync(join(output, "valid/graph.json"), "utf8"));
assert.deepEqual(graph.identifiers.map(record => record.identifier).sort(), ["SLICE-1", "TD-SC-1", "TD-SC-2", "TD-SC-3", "VAL-1", "VAL-2", "VAL-3"]);
assert.deepEqual(graph.relationships.map(edge => edge.source.identifier + " " + edge.kind + " " + edge.target).sort(), [
  "SLICE-1 verified-by VAL-1", "SLICE-1 verified-by VAL-2", "SLICE-1 verified-by VAL-3",
  "VAL-1 verifies TD-SC-1", "VAL-2 verifies TD-SC-2", "VAL-3 verifies TD-SC-3",
]);
const mermaid = readFileSync(join(output, "valid/graph.mmd"), "utf8");
assert.ok(mermaid.startsWith("flowchart LR\n"));
assert.equal(mermaid.split("-->").length - 1, 6);
results.push({ case: "valid authored task", structuralValid: true, traceValid: true });

const aliasedOutput = mkdtempSync(join(output, "aliased-outputs-"));
writeFileSync(join(aliasedOutput, "report.json"), "{\"preserved\":\"report\"}\n");
writeFileSync(join(aliasedOutput, "graph.json"), "{\"preserved\":\"graph\"}\n");
linkSync(join(aliasedOutput, "report.json"), join(aliasedOutput, "graph.mmd"));
const outputNames = ["report.json", "graph.json", "graph.mmd"];
const outputBefore = outputNames.map(name => fileHash(join(aliasedOutput, name)));
const rejected = spawnSync(process.execPath, [join(here, "run.mjs"), sourcePath, "--out", aliasedOutput], {
  encoding: "utf8", timeout: 30_000,
});
assert.equal(rejected.status, 2, "Aliased outputs must fail before writing");
assert.equal(rejected.stdout, "", "An output conflict must not emit a success report");
assert.equal(JSON.parse(rejected.stderr).code, "runtime-error");
assert.deepEqual(outputNames.map(name => fileHash(join(aliasedOutput, name))), outputBefore,
  "Rejecting aliased outputs must preserve every existing output");
results.push({ case: "aliased outputs", runtimeExit: 2, outputsPreserved: true });

const definition = "[Remove a slice link and misdirect a criterion link](ctx://trace/entity/VAL-2?role=definition)";
const visibleCheck = "Remove a slice link and misdirect a criterion link";
const sliceLink = "[relationship probes](ctx://trace/entity/VAL-2?rel=verified-by)";
const verifiesLink = "[TD-SC-2](ctx://trace/entity/TD-SC-2?rel=verifies)";
const mutations = [
  { name: "missing-definition", text: source.replace(definition, visibleCheck), code: "annotation-count", ruleId: "validation-definitions" },
  { name: "missing-slice-link", text: source.replace(sliceLink, "relationship probes"), code: "relation-count", ruleId: "validation-has-slice" },
  { name: "wrong-existing-criterion", text: source.replace(verifiesLink, "[TD-SC-2](ctx://trace/entity/TD-SC-1?rel=verifies)"), code: "text-mismatch", ruleId: "validation-criterion-reference" },
  // This row disappears entirely from the graph, but remains in Engine's inventory.
  { name: "wholly-unannotated-check", text: source.replace(definition, visibleCheck).replace(sliceLink, "relationship probes").replace(verifiesLink, "TD-SC-2"), code: "annotation-count", ruleId: "validation-definitions" },
];
const expectedLine = source.split("\n").findIndex(line => line.includes(definition)) + 1;
for (const mutation of mutations) {
  assert.notEqual(mutation.text, source, "Mutation must change the source");
  const directory = join(output, mutation.name);
  mkdirSync(directory, { recursive: true });
  const path = join(directory, "task.md");
  writeFileSync(path, mutation.text);
  const failed = run(path, directory, 1);
  assert.equal(failed.structural.valid, true, "Existing structural gate must pass this mutation");
  assert.equal(failed.trace.valid, false);
  assert.equal(failed.trace.rules.find(rule => rule.id === "validation-definitions").selected, 3, "Source inventory must retain all check rows");
  const diagnostic = failed.trace.diagnostics.find(item => item.code === "trace-validation." + mutation.code && item.ruleId === mutation.ruleId);
  assert.ok(diagnostic, JSON.stringify(failed.trace.diagnostics));
  assert.equal(diagnostic.line, expectedLine, "Failure must locate the affected row");
  assert.ok(diagnostic.column > 0);
  if (mutation.name === "wholly-unannotated-check") {
    const failedGraph = JSON.parse(readFileSync(join(directory, "graph.json"), "utf8"));
    assert.ok(!failedGraph.identifiers.some(record => record.identifier === "VAL-2"));
  }
  const repairedPath = join(directory, "repaired.md");
  writeFileSync(repairedPath, source);
  const repaired = run(repairedPath, join(directory, "repaired"), 0);
  assert.equal(repaired.valid, true);
  results.push({ case: mutation.name, structuralValid: true, traceValid: false,
    diagnostic: { ruleId: diagnostic.ruleId, code: diagnostic.code, line: diagnostic.line, column: diagnostic.column, message: diagnostic.message },
    repairedValid: true });
}
const unwrap = result => { assert.ok(result.ok); return result.value; };
const rawProfile = JSON.parse(readFileSync(join(here, "profile.json"), "utf8"));
const profileProof = proveProfiles({ source, sourcePath, rawProfile, output, run });
const profile = unwrap(compileValidationProfile(JSON.stringify(rawProfile)));
const analysis = unwrap(analyzeDocument({ documentId: sourcePath, text: source }, profile, { maxSourceUtf8Bytes: 2_000_000, maxOccurrences: 50_000 }));
const backlink = unwrap(findIncoming(analysis, "VAL-2", { relations: ["verified-by"] }));
assert.equal(backlink.totalMatches, 1);
assert.equal(backlink.items[0].relationship.source.identifier, "SLICE-1");
for (const path of inputPaths) assert.equal(fileHash(join(here, path)), inputs[path], "Proof input changed: " + path);
const dist = fileURLToPath(new URL("../../dist/markdowntrace/document-graph/", import.meta.url));
function builtFiles(directory, extension = ".js") {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? builtFiles(join(directory, entry.name), extension) : entry.name.endsWith(extension) ? [join(directory, entry.name)] : []);
}
const summary = {
  passed: true, node: process.version,
  baseCommit: spawnSync("git", ["rev-parse", "HEAD"], { cwd: here, encoding: "utf8" }).stdout.trim(),
  inputs, structuralProfileSha256: good.structural.profileSha256,
  lockfileSha256: fileHash(fileURLToPath(new URL("../../package-lock.json", import.meta.url))),
  graphRuntimeSha256: hash(builtFiles(dist).sort().map(path => path.slice(dist.length) + ":" + fileHash(path)).join("\n")),
  structuralEngine: good.structural.engineVersion, graphEngine: good.trace.parserVersion,
  results, profileProof, backlink: { identifier: "VAL-2", source: "SLICE-1", relation: "verified-by", line: backlink.items[0].occurrence.range.start.line },
};
writeFileSync(join(output, "verification.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
