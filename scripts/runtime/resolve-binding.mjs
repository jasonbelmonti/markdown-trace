import assert from "node:assert/strict";
import { access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const command = "markdown-trace-document";

async function executable(path) {
  const info = await stat(path);
  if (!info.isFile()) throw Object.assign(new Error(`Binding is not a file: ${path}`), { code: "EISDIR" });
  await access(path, constants.R_OK | constants.X_OK);
  return path;
}

/** Resolve an executable path only. Consumers must invoke it with an argument array. */
export async function resolveBinding(env = process.env, cwd = process.cwd()) {
  const explicit = env.MARKDOWN_TRACE_BIN;
  if (explicit) {
    assert.ok(isAbsolute(explicit), "MARKDOWN_TRACE_BIN must be an absolute executable path");
    return executable(explicit);
  }
  for (const part of (env.PATH ?? "").split(delimiter)) {
    if (!part) continue;
    const candidate = join(resolve(cwd, part), command);
    try {
      return await executable(candidate);
    } catch (error) {
      if (["ENOENT", "EACCES", "ENOTDIR", "EISDIR"].includes(error.code)) continue;
      throw error;
    }
  }
  throw new Error(`${command} was not found as an executable on PATH`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    console.log(await resolveBinding());
  } catch (error) {
    console.error(`Runtime binding failed: ${error.message}`);
    process.exitCode = 1;
  }
}
