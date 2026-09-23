import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

export function isolatedProcess({ root, payload, work, guard, entrypoint }) {
  const env = { PATH: "", HOME: root, TMPDIR: root, LANG: "C" };
  const permissionFlags = ["--experimental-permission", "--no-warnings", "--no-global-search-paths",
    `--allow-fs-read=${payload}`, `--allow-fs-read=${guard}`, "--import", guard];
  function execute(args, identityOnly = false, selectedPayload = payload) {
    const flags = [...permissionFlags];
    if (!identityOnly) flags.push(`--allow-fs-read=${work}`);
    const result = spawnSync(process.execPath, [...flags, join(selectedPayload, entrypoint), ...args], {
      cwd: work, env, encoding: "utf8", maxBuffer: 20_000_000, timeout: 30_000,
    });
    if (result.error) throw result.error;
    return result;
  }
  function run(args, expected = 0, { stderr = false, identityOnly = false } = {}) {
    const result = execute(args, identityOnly);
    assert.equal(result.status, expected, result.stderr + result.stdout);
    if (!stderr) assert.equal(result.stderr, "");
    return result;
  }
  function proveIsolation(forbiddenFile) {
    for (const expression of [
      `require('node:fs').readFileSync(${JSON.stringify(forbiddenFile)})`,
      "require('node:child_process').spawnSync('npm',['--version'])",
      "require('node:net').connect(443,'example.com')",
    ]) {
      const denied = spawnSync(process.execPath, [...permissionFlags, "--eval", expression], {
        cwd: work, env, encoding: "utf8", timeout: 5000,
      });
      assert.notEqual(denied.status, 0, "Isolation control did not reject forbidden operation");
      assert.match(denied.stderr, /ERR_ACCESS_DENIED|forbids network/);
    }
  }
  return { execute, run, proveIsolation, permissionFlags };
}
