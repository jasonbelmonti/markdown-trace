import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { readJson, sha256, verifyPayload } from "./integrity.mjs";

try {
  const { values } = parseArgs({ options: { first: { type: "string" }, second: { type: "string" } } });
  if (!values.first || !values.second) throw new Error("Supply --first STAGE --second STAGE");
  const stages = [resolve(values.first), resolve(values.second)];
  const descriptors = [];
  for (const stage of stages) {
    const path = join(stage, "release.json");
    const descriptor = await readJson(path);
    assert.match(descriptor.payloadDirectory, /^markdown-trace-0\.1\.0-[a-f0-9]{40}$/);
    await verifyPayload(path, join(stage, descriptor.payloadDirectory));
    descriptors.push(descriptor);
  }
  assert.deepEqual(descriptors[0], descriptors[1], "Clean builds differ in covered bytes or stable descriptor fields");
  const descriptorHashes = await Promise.all(stages.map(async stage => sha256(await readFile(join(stage, "release.json")))));
  assert.equal(descriptorHashes[0], descriptorHashes[1]);
  console.log(JSON.stringify({ passed: true, stages, descriptorHashes, payloadSha256: descriptors[0].payloadSha256,
    sourceCommit: descriptors[0].identity.sourceCommit, build: descriptors[0].build,
    files: descriptors[0].files.length, exclusions: "Directory timestamps, modes and ownership; no archive is produced." }, null, 2));
} catch (error) {
  console.error(error.stack);
  process.exitCode = 1;
}
