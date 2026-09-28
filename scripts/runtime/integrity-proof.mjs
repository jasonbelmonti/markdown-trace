import assert from "node:assert/strict";
import { readFile, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { verifyPayload } from "./integrity.mjs";

export async function proveIntegrity(descriptorPath, payload, execute) {
  const descriptor = JSON.parse(await readFile(descriptorPath, "utf8"));
  const mismatchedDescriptor = join(payload, "..", "mismatched-engine.json");
  try {
    for (const version of [descriptor.identity.markdownEngineVersion === "5.0.0" ? "4.0.0" : "5.0.0", "99.0.0"]) {
      await writeFile(mismatchedDescriptor, JSON.stringify({ ...descriptor,
        identity: { ...descriptor.identity, markdownEngineVersion: version } }));
      await assert.rejects(verifyPayload(mismatchedDescriptor, payload),
        version === "99.0.0" ? /Unsupported Markdown Engine version/ : { code: "ERR_ASSERTION" });
    }
  } finally { await rm(mismatchedDescriptor, { force: true }); }
  const file = join(payload, "node_modules/@jasonbelmonti/markdown-engine/dist/index.js");
  const original = await readFile(file);
  await writeFile(file, Buffer.concat([original, Buffer.from("\nthrow new Error('altered payload executed');\n")]));
  await assert.rejects(verifyPayload(descriptorPath, payload), /inventory differs/);
  await rm(file);
  await assert.rejects(verifyPayload(descriptorPath, payload), /inventory differs/);
  const missing = execute(["--runtime-info"], true);
  assert.notEqual(missing.status, 0, "Missing Engine must not resolve from checkout or global modules");
  assert.equal(missing.stdout, "");
  await writeFile(file, original);
  const extra = join(payload, "unexpected.js");
  await writeFile(extra, "throw new Error('unexpected');\n");
  await assert.rejects(verifyPayload(descriptorPath, payload), /inventory differs/);
  await rm(extra);
  await symlink(file, extra);
  await assert.rejects(verifyPayload(descriptorPath, payload), /link is forbidden/);
  await rm(extra);
  await verifyPayload(descriptorPath, payload);
  return { mismatchedEngineRejected: true, unsupportedEngineRejected: true, alteredRejected: true, missingRejected: true, extraRejected: true, symlinkRejected: true,
    missingDependencyExecutionExit: missing.status, restoredVerified: true };
}
