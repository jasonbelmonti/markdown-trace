import assert from "node:assert/strict";

export function proveIdentity(run, identity) {
  const result = run(["--runtime-info"], 0, { identityOnly: true });
  assert.deepEqual(JSON.parse(result.stdout), { ...identity, nodeVersion: process.version });
  const rejected = [];
  for (const extra of [
    ["--file", "missing document.md"], ["--profile", "missing profile.json"],
    ["--format", "report"], ["--format", "query"], ["--identifier", "REQ-1"],
    ["--direction", "incoming"], ["--offset", "0"], ["--limit", "1"],
    ["--help"], ["--runtime-info"],
  ]) {
    for (const args of [["--runtime-info", ...extra], [...extra, "--runtime-info"]]) {
      const failed = run(args, 2, { stderr: true, identityOnly: true });
      assert.equal(failed.stdout, "");
      assert.equal(JSON.parse(failed.stderr).message, "--runtime-info must be used alone.");
    }
    rejected.push(extra);
  }
  return { observed: JSON.parse(result.stdout), rejected };
}
