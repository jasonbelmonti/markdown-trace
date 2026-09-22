import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { verifyPayload } from "./integrity.mjs";

try {
  const { values } = parseArgs({ options: {
    descriptor: { type: "string" }, payload: { type: "string" },
  } });
  if (!values.descriptor || !values.payload)
    throw new Error("Usage: node scripts/runtime/verify.mjs --descriptor TRUSTED_JSON --payload DIRECTORY");
  const descriptor = await verifyPayload(resolve(values.descriptor), resolve(values.payload));
  console.log(JSON.stringify({ valid: true, payloadSha256: descriptor.payloadSha256,
    sourceCommit: descriptor.identity.sourceCommit }));
} catch (error) {
  console.error(JSON.stringify({ valid: false, message: error.message }));
  process.exitCode = 1;
}
