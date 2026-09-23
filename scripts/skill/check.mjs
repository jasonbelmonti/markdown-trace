import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { inventory, sha256 } from "../runtime/integrity.mjs";
import { stage } from "../runtime/installed-release.mjs";

const sourceSkill = fileURLToPath(new URL("../../skills/markdown-trace", import.meta.url));

function invoke(helper, args, cwd, env, expected = 0) {
  const result = spawnSync(process.execPath, [helper, ...args], {
    cwd, env, encoding: "utf8", timeout: 30_000, maxBuffer: 10_000_000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, expected, result.stderr + result.stdout);
  if (expected !== 2) assert.equal(result.stderr, "");
  return result;
}

async function proveBindings(helper, root, cwd, env, launcher) {
  const bin = join(root, "path bin");
  await mkdir(bin);
  await symlink(process.execPath, join(bin, "node"));
  await symlink(launcher, join(bin, "markdown-trace-document"));
  const fallback = { ...env, PATH: bin };
  delete fallback.MARKDOWN_TRACE_BIN;
  for (const binding of [undefined, ""]) {
    const selected = { ...fallback };
    if (binding !== undefined) selected.MARKDOWN_TRACE_BIN = binding;
    assert.equal(JSON.parse(invoke(helper, ["--runtime-info"], cwd, selected).stdout).markdownEngineVersion, "3.6.0");
  }
  const nonExecutable = join(root, "not executable");
  await writeFile(nonExecutable, "not a command");
  await chmod(nonExecutable, 0o600);
  for (const binding of [join(root, "missing"), "relative-command", nonExecutable, bin]) {
    const result = invoke(helper, ["--runtime-info"], cwd, { ...fallback, MARKDOWN_TRACE_BIN: binding }, 2);
    assert.equal(result.stdout, "", "Invalid explicit binding used the valid PATH fallback");
    assert.match(result.stderr, /Trace runtime unavailable:/);
  }
  // Only a differently named executable exists: discovery must not accept it.
  await rm(join(bin, "markdown-trace-document"));
  await symlink(launcher, join(bin, "trace"));
  invoke(helper, ["--runtime-info"], cwd, fallback, 2);
  return { explicit: true, unsetAndEmptyPathFallback: true, invalidBindingNoFallback: true, exactCommandName: true };
}

async function check(artifact) {
  const before = await inventory(sourceSkill);
  const root = await realpath(await mkdtemp(join(tmpdir(), "trace-skill-")));
  try {
    const skill = join(root, "copied skill"), work = join(root, "caller cwd");
    await cp(sourceSkill, skill, { recursive: true });
    await mkdir(work);
    const installed = await stage(join(root, "installed runtime"), artifact, join(artifact, "release.json"));
    const helper = join(skill, "scripts/run.mjs");
    const bin = join(root, "node bin");
    await mkdir(bin);
    await symlink(process.execPath, join(bin, "node"));
    const env = { HOME: root, PATH: bin, MARKDOWN_TRACE_BIN: installed.launcher };
    const contract = JSON.parse(await readFile(join(skill, "contracts/runtime.json"), "utf8"));
    assert.equal(contract.schemaVersion, "markdown-trace.consumer-contract.v1");
    const document = await readFile(join(skill, contract.document), "utf8");
    const profile = await readFile(join(skill, contract.profile));
    const documentPath = join(work, "document with spaces.md");
    await writeFile(documentPath, document);
    await writeFile(join(work, "profile with spaces.json"), profile);
    const args = ["--file", "document with spaces.md", "--profile", "profile with spaces.json"];
    const run = (extra = [], expected = 0) => JSON.parse(invoke(helper, [...args, ...extra], work, env, expected).stdout);
    const info = JSON.parse(invoke(helper, ["--runtime-info"], work, env).stdout);
    const valid = run();
    assert.equal(valid.status, contract.valid.status);
    assert.equal(valid.identifiers, contract.valid.entityCount);
    assert.equal(valid.relationships, contract.valid.relationshipCount);
    assert.equal(valid.parserVersion, "3.6.0");
    assert.equal(valid.schemaVersion, "markdown-trace.validation-result.experimental.v1");
    const graph = run(["--format", "graph"]).graph;
    assert.deepEqual(graph.identifiers.map(item => item.identifier).sort(), ["CHECK-1", "DES-1", "REQ-1"]);
    const query = run(["--format", "query", "--identifier", "REQ-1"]);
    assert.deepEqual(query.references.items.map(item => [item.relationship.source.identifier, item.relationship.kind]),
      [["DES-1", "implements"], ["CHECK-1", "verifies"]]);
    const { from, to } = contract.defect.replace;
    assert.equal(document.split(from).length, 2, "Defect must replace exactly one literal");
    await writeFile(documentPath, document.replace(from, to));
    const defect = run([], 1), expected = contract.defect.expected;
    assert.equal(defect.status, expected.status);
    const diagnostic = defect.diagnostics.find(item => item.ruleId === expected.ruleId && item.code === expected.code);
    assert.ok(diagnostic, "Expected defect diagnostic missing");
    assert.equal(diagnostic.line, expected.startLine);
    assert.equal(diagnostic.range.start.line, expected.startLine);
    await writeFile(documentPath, document);
    const repaired = run();
    assert.deepEqual(repaired, valid);
    const bindings = await proveBindings(helper, root, work, env, installed.launcher);
    assert.deepEqual(await inventory(skill), before, "Copied package changed");
    assert.deepEqual(await inventory(sourceSkill), before, "Source package changed");
    assert.equal(await readFile(documentPath, "utf8"), document);
    assert.deepEqual(await readFile(join(work, "profile with spaces.json")), profile);
    return { passed: true, runtime: info, skillFiles: before,
      environment: { node: process.version, platform: process.platform, arch: process.arch },
      isolatedCopy: { cwd: work, skill, launcher: installed.launcher, nodeOnlyPath: true, externalDependencies: false },
      bindings, valid: { status: valid.status, identifiers: valid.identifiers, relationships: valid.relationships },
      defect: { status: defect.status, diagnostic }, repaired: { status: repaired.status },
      fixtureSha256: sha256(Buffer.from(document)), profileSha256: sha256(profile), inputsUnchanged: true };
  } finally { await rm(root, { recursive: true, force: true }); }
}

try {
  const { values } = parseArgs({ options: { artifact: { type: "string" } } });
  assert.ok(values.artifact, "Usage: node scripts/skill/check.mjs --artifact CANDIDATE");
  console.log(JSON.stringify(await check(resolve(values.artifact)), null, 2));
} catch (error) {
  console.error(error.stack);
  process.exitCode = 1;
}
