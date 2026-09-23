import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { entrypoint, inventory, inventoryHash, readJson, sha256, verifyPayload } from "./integrity.mjs";
import { assertCleanInputs, command, git, sourceInputs } from "./provenance.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

async function compile(snapshot, commit) {
  command("npm", ["ci", "--ignore-scripts", "--bin-links=false", "--no-audit", "--no-fund"], snapshot);
  const toolchain = { node: process.version, npm: command("npm", ["--version"], snapshot).trim(),
    typescript: (await readJson(join(snapshot, "node_modules/typescript/package.json"))).version };
  command(process.execPath, ["scripts/generate-release-metadata.mjs"], snapshot);
  await writeFile(join(snapshot, "src/markdowntrace/generated/build-source.ts"),
    `// Injected into this disposable snapshot by the portable producer.\nexport const SOURCE_COMMIT: string | null = ${JSON.stringify(commit)};\n`);
  command(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.build.json"], snapshot);
  command("npm", ["prune", "--omit=dev", "--ignore-scripts", "--bin-links=false", "--no-audit", "--no-fund"], snapshot);
  return toolchain;
}

async function produce(destination) {
  const commit = git(root, ["rev-parse", "HEAD"]);
  assertCleanInputs(root, commit);
  assert.match(commit, /^[a-f0-9]{40}$/);
  assert.equal(await lstat(destination).catch(error => {
    if (error.code === "ENOENT") return null;
    throw error;
  }), null, "Output destination must not exist");
  const inputsBefore = await sourceInputs(root);
  const scratch = await mkdtemp(join(tmpdir(), "trace-producer-"));
  await mkdir(dirname(destination), { recursive: true });
  const pending = await mkdtemp(join(dirname(destination), ".trace-pending-"));
  try {
    const snapshot = join(scratch, "source");
    await mkdir(snapshot);
    command("git", ["archive", "--format=tar", "--output", join(scratch, "source.tar"), commit], root);
    command("tar", ["-xf", join(scratch, "source.tar"), "-C", snapshot], scratch);
    const inputs = await sourceInputs(snapshot);
    assert.deepEqual(inputsBefore, inputs, "Working runtime inputs differ from committed snapshot (including ignored files)");
    const lockBytes = await readFile(join(snapshot, "package-lock.json"));
    const lock = JSON.parse(lockBytes);
    const manifest = await readJson(join(snapshot, "package.json"));
    assert.equal(manifest.dependencies["@jasonbelmonti/markdown-engine"], "3.6.0");
    const toolchain = await compile(snapshot, commit);
    const versionedName = `markdown-trace-${manifest.version}-${commit}`;
    const payload = join(pending, versionedName);
    await mkdir(payload);
    for (const name of ["dist", "node_modules", "package.json", "package-lock.json"])
      await cp(join(snapshot, name), join(payload, name), { recursive: true });
    // npm's hidden installation lock is build metadata with platform-specific dev remnants.
    await rm(join(payload, "node_modules/.package-lock.json"), { force: true });
    const identityRun = JSON.parse(command(process.execPath, [join(payload, entrypoint), "--runtime-info"], scratch));
    assert.equal(identityRun.sourceCommit, commit);
    const { nodeVersion, ...identity } = identityRun;
    assert.equal(nodeVersion, process.version);
    const files = await inventory(payload);
    const descriptor = {
      schemaVersion: "markdown-trace.runtime-release.v1", payloadDirectory: versionedName,
      entrypoint, nodeRange: manifest.engines.node, identity,
      build: { sourceTree: git(root, ["rev-parse", `${commit}^{tree}`]),
        lockfileSha256: sha256(lockBytes), inputs, toolchain,
        dependencies: Object.entries(lock.packages).filter(([name, item]) => name && !item.dev)
          .map(([path, item]) => ({ path, version: item.version, integrity: item.integrity })) },
      payloadSha256: inventoryHash(files), files,
    };
    const descriptorPath = join(pending, "release.json");
    await writeFile(descriptorPath, JSON.stringify(descriptor, null, 2) + "\n");
    await verifyPayload(descriptorPath, payload);
    assertCleanInputs(root, commit);
    assert.deepEqual(await sourceInputs(root), inputsBefore, "Source inputs changed during production");
    await rename(pending, destination);
    console.log(JSON.stringify({ artifact: destination, payload: join(destination, versionedName),
      descriptor: join(destination, "release.json"), payloadSha256: descriptor.payloadSha256, sourceCommit: commit }));
  } finally {
    await rm(scratch, { recursive: true, force: true });
    await rm(pending, { recursive: true, force: true });
  }
}

try {
  const { values } = parseArgs({ options: { out: { type: "string" } } });
  if (!values.out) throw new Error("Usage: node scripts/runtime/build.mjs --out NEW_DIRECTORY");
  await produce(resolve(values.out));
} catch (error) {
  console.error(`Runtime production failed: ${error.message}`);
  process.exitCode = 1;
}
