import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sha256, inventory } from "./integrity.mjs";

export const runtimePaths = ["src", "scripts", "package.json", "package-lock.json", "tsconfig.json", "tsconfig.build.json", ".npmrc"];
export function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}
export function assertCleanInputs(root, commit) {
  assert.equal(git(root, ["rev-parse", "HEAD"]), commit, "Source commit changed during production");
  const status = git(root, ["status", "--porcelain", "--untracked-files=all", "--", ...runtimePaths]);
  assert.equal(status, "", "Commit runtime-affecting inputs before release production:\n" + status);
}
export async function sourceInputs(root) {
  const files = [];
  for (const directory of ["src", "scripts"])
    files.push(...(await inventory(join(root, directory))).map(file => ({ ...file, path: `${directory}/${file.path}` })));
  for (const file of ["package.json", "package-lock.json", "tsconfig.json", "tsconfig.build.json"])
    files.push({ path: file, sha256: sha256(await readFile(join(root, file))) });
  return files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function command(executable, args, cwd, extra = {}) {
  return execFileSync(executable, args, { cwd, encoding: "utf8", maxBuffer: 20_000_000,
    env: { ...process.env, NODE_OPTIONS: "", NODE_PATH: "" }, ...extra });
}
