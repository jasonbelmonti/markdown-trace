import assert from "node:assert/strict";
import { chmod, lstat, readFile, writeFile } from "node:fs/promises";
import { isAbsolute } from "node:path";

const quote = value => `'${value.replaceAll("'", `'"'"'`)}'`;

export function launcherText(target) {
  assert.ok(isAbsolute(target), "Launcher target must be absolute");
  return `#!/bin/sh
unset NODE_OPTIONS NODE_PATH
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if (!((major===20&&minor>=19)||(major>=22&&(major!==22||minor>=12)))) process.exit(1)' || { echo 'Unsupported or missing Node.js (requires ^20.19.0 || >=22.12.0)' >&2; exit 1; }
exec node ${quote(target)} "$@"
`;
}

export async function writeLauncher(path, target) {
  await writeFile(path, launcherText(target), { mode: 0o755, flag: "wx" });
  await chmod(path, 0o755);
}

export async function verifyLauncher(path, target) {
  const stat = await lstat(path);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), "Launcher must be a regular file");
  assert.ok((stat.mode & 0o111) !== 0, "Launcher is not executable");
  assert.equal(await readFile(path, "utf8"), launcherText(target), "Launcher differs from approved template");
}
