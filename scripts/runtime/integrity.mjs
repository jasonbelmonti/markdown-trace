import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
export const readJson = async path => JSON.parse(await readFile(path, "utf8"));
export const entrypoint = "dist/markdowntrace/document-graph/cli.js";
export const inventoryHash = files => sha256(JSON.stringify(files));

/** All paths and bytes are covered. Links/devices are never executable payload inputs. */
export async function inventory(root) {
  const files = [];
  async function visit(relative) {
    const path = join(root, relative);
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) throw new Error(`Payload link is forbidden: ${relative}`);
    if (stat.isDirectory()) {
      for (const name of (await readdir(path)).sort())
        await visit(relative ? `${relative}/${name}` : name);
    } else if (stat.isFile()) {
      const bytes = await readFile(path);
      files.push({ path: relative, size: bytes.length, sha256: sha256(bytes) });
    } else throw new Error(`Payload must contain only regular files: ${relative}`);
  }
  await visit("");
  return files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

/** Trusted producer descriptor is an input, never imported from or supplied by candidate code. */
export async function verifyPayload(descriptorPath, payload) {
  const descriptor = await readJson(descriptorPath);
  assert.equal(descriptor.schemaVersion, "markdown-trace.runtime-release.v1");
  assert.equal(descriptor.entrypoint, entrypoint);
  assert.equal(descriptor.nodeRange, "^20.19.0 || >=22.12.0");
  const identity = descriptor.identity;
  assert.equal(identity.schemaVersion, "markdown-trace.runtime-info.v1");
  assert.equal(identity.package, "@jasonbelmonti/markdown-trace");
  assert.match(identity.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(identity.packageVersion, "0.1.0");
  assert.equal(identity.markdownEngineVersion, "3.6.0");
  assert.ok(
    ["0.1.0-experimental.2", "0.1.0-experimental.3"].includes(identity.analyzerVersion),
    `Unsupported analyzer version: ${identity.analyzerVersion}`,
  );
  assert.equal(identity.languageVersion, "markdown-trace.identity.draft2");
  assert.equal(identity.validationProfileVersion, "markdown-trace.validation-profile.experimental.v1");
  assert.equal(identity.graphVersion, "markdown-trace.document-graph.v1");
  assert.equal(identity.validationResultVersion, "markdown-trace.validation-result.experimental.v1");
  const observed = await inventory(payload);
  assert.deepEqual(observed, descriptor.files, "Payload inventory differs (changed, missing or extra content)");
  assert.equal(inventoryHash(observed), descriptor.payloadSha256, "Payload digest differs");
  assert.ok(observed.some(file => file.path === entrypoint), "Missing entry point");
  const manifest = await readJson(join(payload, "package.json"));
  const engine = await readJson(join(payload, "node_modules/@jasonbelmonti/markdown-engine/package.json"));
  assert.equal(manifest.name, identity.package);
  assert.equal(manifest.version, identity.packageVersion);
  assert.equal(manifest.dependencies["@jasonbelmonti/markdown-engine"], identity.markdownEngineVersion);
  assert.equal(engine.version, identity.markdownEngineVersion);
  return descriptor;
}
