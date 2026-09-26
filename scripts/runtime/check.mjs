import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir, release } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { inventory, readJson, sha256, verifyPayload } from "./integrity.mjs";
import { isolatedProcess } from "./isolated-process.mjs";
import { proveIdentity } from "./identity-proof.mjs";
import { provePreview } from "./preview-proof.mjs";
import { proveTask } from "./task-proof.mjs";
import { proveIntegrity } from "./integrity-proof.mjs";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const fixtures = [
  ["examples/preview-design/document.md", "preview.md"],
  ["examples/preview-design/profile.json", "preview.json"],
  ["experiments/task-definition-trace/task-definition.md", "task.md"],
  ["experiments/task-definition-trace/profile.json", "task.json"],
];
async function fixtureHashes() {
  return Object.fromEntries(await Promise.all(fixtures.map(async ([path]) => [path, sha256(await readFile(join(repo, path)))])));
}
async function check(artifact) {
  const descriptorPath = join(artifact, "release.json");
  const descriptorBytes = await readFile(descriptorPath);
  const descriptor = await readJson(descriptorPath);
  assert.match(descriptor.payloadDirectory, /^markdown-trace-0\.1\.[01]-[a-f0-9]{40}$/);
  const inputPayload = join(artifact, descriptor.payloadDirectory);
  await verifyPayload(descriptorPath, inputPayload);
  const before = await fixtureHashes();
  const proofInputs = await inventory(join(repo, "scripts/runtime"));
  const root = await realpath(await mkdtemp(join(tmpdir(), "trace-isolated-")));
  const payload = join(root, "runtime with spaces"), work = join(root, "caller cwd");
  const guard = join(root, "network-guard.mjs");
  try {
    await cp(inputPayload, payload, { recursive: true });
    await cp(join(repo, "scripts/runtime/network-guard.mjs"), guard);
    await mkdir(join(work, "input with spaces"), { recursive: true });
    for (const [source, name] of fixtures)
      await cp(join(repo, source), join(work, "input with spaces", name));
    const copiedBefore = await inventory(join(work, "input with spaces"));
    const runner = isolatedProcess({ root, payload, work, guard, entrypoint: descriptor.entrypoint });
    runner.proveIsolation(join(repo, "package.json"));
    const identity = proveIdentity(runner.run, descriptor.identity);
    const preview = await provePreview(runner.run, work);
    const task = await proveTask(runner.run, work);
    const integrity = await proveIntegrity(descriptorPath, payload, runner.execute);
    assert.deepEqual(await inventory(join(work, "input with spaces")), copiedBefore, "Copied inputs changed");
    assert.deepEqual(await fixtureHashes(), before, "Source fixtures changed");
    assert.deepEqual(await inventory(join(repo, "scripts/runtime")), proofInputs, "Proof implementation changed");
    assert.deepEqual(await readFile(descriptorPath), descriptorBytes, "Trusted descriptor changed");
    await verifyPayload(descriptorPath, inputPayload);
    return { passed: true, artifact, descriptorSha256: sha256(descriptorBytes),
      payloadSha256: descriptor.payloadSha256, sourceCommit: descriptor.identity.sourceCommit,
      build: descriptor.build, environment: { node: process.version, platform: process.platform, arch: process.arch, osRelease: release() },
      isolation: { root, cwd: work, relocatedPayload: payload, permissionFlags: runner.permissionFlags,
        environment: { PATH: "", HOME: root }, forbiddenCheckoutRead: true, forbiddenSubprocess: true,
        forbiddenNetwork: true, dependencyInstallation: false, globalModuleSearch: false },
      fixtureHashes: before, proofInputs, copiedInputs: copiedBefore, inputsUnchanged: true,
      identity, integrity, preview, task };
  } finally { await rm(root, { recursive: true, force: true }); }
}
try {
  const { values } = parseArgs({ options: { artifact: { type: "string" }, report: { type: "string" } } });
  if (!values.artifact) throw new Error("Usage: node scripts/runtime/check.mjs --artifact STAGE [--report OUTPUT_JSON]");
  const result = await check(resolve(values.artifact));
  const text = JSON.stringify(result, null, 2) + "\n";
  if (values.report) await writeFile(resolve(values.report), text, { flag: "wx" });
  console.log(text);
} catch (error) {
  console.error(error.stack);
  process.exitCode = 1;
}
