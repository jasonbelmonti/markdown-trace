import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { access, chmod, cp, lstat, mkdir, mkdtemp, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { entrypoint, inventory, readJson } from "./integrity.mjs";
import { activate, rollback, stage, status, verify } from "./installed-release.mjs";
import { resolveBinding } from "./resolve-binding.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const candidateA = process.env.TRACE_CANDIDATE_A;
const candidateB = process.env.TRACE_CANDIDATE_B;

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: "utf8", ...options });
}

test("versioned installation verifies before switching and restores a prior release", async () => {
  assert.ok(candidateA && candidateB, "Set TRACE_CANDIDATE_A and TRACE_CANDIDATE_B to two real produced candidates");
  const base = await mkdtemp(join(tmpdir(), "trace-install-proof-"));
  const root = join(base, "install with spaces");
  try {
    const firstDescriptor = await readJson(join(candidateA, "release.json"));
    const secondDescriptor = await readJson(join(candidateB, "release.json"));
    assert.notEqual(firstDescriptor.identity.sourceCommit, secondDescriptor.identity.sourceCommit,
      "Rollback proof needs independently identified candidates");
    const first = await stage(root, candidateA);
    assert.equal((await status(root)).active, null, "Staging must not activate");
    assert.deepEqual((await verify(root, first.id)).descriptor.identity, firstDescriptor.identity);
    assert.deepEqual(JSON.parse(run(first.launcher, ["--runtime-info"], { cwd: base }).stdout),
      { ...firstDescriptor.identity, nodeVersion: process.version });

    const brokenCandidate = join(base, "broken candidate");
    await cp(candidateB, brokenCandidate, { recursive: true });
    const brokenDescriptor = await readJson(join(brokenCandidate, "release.json"));
    await writeFile(join(brokenCandidate, brokenDescriptor.payloadDirectory, entrypoint), "broken\n");
    await assert.rejects(stage(root, brokenCandidate), /inventory differs/i);
    assert.equal((await status(root)).active, null);
    const malformed = join(base, "malformed descriptor");
    await mkdir(malformed);
    await writeFile(join(malformed, "release.json"), '{"payloadDirectory":"../escape"}');
    await assert.rejects(stage(root, malformed));
    assert.equal((await status(root)).active, null);

    const firstActivation = await activate(root, first.id);
    assert.equal(firstActivation.previous, null);
    const active = join(root, "bin", "markdown-trace-document");
    const firstLink = await readlink(active);
    const work = join(base, "caller cwd");
    await mkdir(join(work, "input with spaces"), { recursive: true });
    for (const [source, name] of [
      ["examples/preview-design/document.md", "document.md"],
      ["examples/preview-design/profile.json", "profile.json"],
    ]) await cp(join(repository, source), join(work, "input with spaces", name));
    const before = await inventory(join(work, "input with spaces"));
    const args = ["--file", "input with spaces/document.md", "--profile", "input with spaces/profile.json", "--format", "graph"];
    const installedRun = run(active, args, { cwd: work, env: { ...process.env, MARKDOWN_TRACE_PAYLOAD: "/not/the/payload", NODE_OPTIONS: "--no-warnings" } });
    const directRun = run(process.execPath, [join(candidateA, firstDescriptor.payloadDirectory, entrypoint), ...args], { cwd: work });
    assert.equal(installedRun.status, directRun.status);
    assert.equal(installedRun.stdout, directRun.stdout);
    assert.equal(installedRun.stderr, directRun.stderr);
    assert.equal(installedRun.status, 0);
    assert.deepEqual(await inventory(join(work, "input with spaces")), before);

    const second = await stage(root, candidateB);
    assert.equal(await readlink(active), firstLink, "Staging a second release must not switch active");
    const secondActivation = await activate(root, second.id);
    assert.equal(secondActivation.previous, firstLink);
    assert.deepEqual(JSON.parse(run(active, ["--runtime-info"]).stdout),
      { ...secondDescriptor.identity, nodeVersion: process.version });
    const secondLink = await readlink(active);

    const firstLauncher = await readFile(first.launcher);
    await writeFile(first.launcher, "#!/bin/sh\nexit 0\n");
    await assert.rejects(activate(root, first.id), /Launcher differs/);
    assert.equal(await readlink(active), secondLink);
    await assert.rejects(activate(root, "not-an-id"), /Invalid release ID/);
    assert.equal(await readlink(active), secondLink);
    assert.equal(run(active, ["--runtime-info"]).status, 0);
    await writeFile(first.launcher, firstLauncher);
    await chmod(first.launcher, 0o755);

    const restored = await rollback(root, first.id);
    assert.equal(restored.previous, secondLink);
    assert.equal(await readlink(active), firstLink);
    assert.deepEqual(JSON.parse(run(active, ["--runtime-info"]).stdout),
      { ...firstDescriptor.identity, nodeVersion: process.version });

    const fakeBin = join(base, "unsupported node");
    await mkdir(fakeBin);
    await writeFile(join(fakeBin, "node"), "#!/bin/sh\nif [ \"$1\" = \"--version\" ]; then echo v18.0.0; else exit 1; fi\n", { mode: 0o755 });
    await chmod(join(fakeBin, "node"), 0o755);
    const unsupported = run(active, ["--runtime-info"], { env: { ...process.env, PATH: fakeBin } });
    assert.notEqual(unsupported.status, 0);
    assert.match(unsupported.stderr, /Unsupported or missing Node/);
    const originalPath = process.env.PATH;
    process.env.PATH = fakeBin;
    try {
      await assert.rejects(activate(root, second.id), /failed/);
    } finally {
      process.env.PATH = originalPath;
    }
    assert.equal(await readlink(active), firstLink);

    const engineFile = join(root, "releases", second.id, secondDescriptor.payloadDirectory,
      "node_modules/@jasonbelmonti/markdown-engine/package.json");
    await rm(engineFile);
    await assert.rejects(activate(root, second.id));
    assert.equal(await readlink(active), firstLink);
    await access(active, constants.X_OK);
    assert.equal(run(active, ["--runtime-info"]).status, 0);
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});

test("binding resolves exact executable and never falls back from an explicit value", async () => {
  const root = await mkdtemp(join(tmpdir(), "trace-binding-proof-"));
  try {
    const first = join(root, "first with spaces"), second = join(root, "second");
    await mkdir(first);
    await mkdir(second);
    const selected = join(first, "markdown-trace-document");
    const fallback = join(second, "markdown-trace-document");
    await writeFile(selected, "#!/bin/sh\nprintf '%s\\n' \"$@\"\n", { mode: 0o755 });
    await writeFile(fallback, "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    await chmod(selected, 0o755);
    await chmod(fallback, 0o755);
    assert.equal(run(selected, ["a b", "$(touch nope)"], { cwd: root }).stdout, "a b\n$(touch nope)\n");
    assert.equal(await lstat(join(root, "nope")).catch(error => error.code === "ENOENT" ? null : Promise.reject(error)), null);
    const path = [first, second].join(delimiter);
    assert.equal(await resolveBinding({ PATH: path }), selected);
    assert.equal(await resolveBinding({ PATH: path, MARKDOWN_TRACE_BIN: fallback }), fallback);
    assert.equal(await resolveBinding({ PATH: path, MARKDOWN_TRACE_BIN: "" }), selected);
    for (const bad of ["relative/command", join(root, "missing"), first])
      await assert.rejects(resolveBinding({ PATH: path, MARKDOWN_TRACE_BIN: bad }));
    await chmod(fallback, 0o644);
    await assert.rejects(resolveBinding({ PATH: path, MARKDOWN_TRACE_BIN: fallback }));
    await chmod(fallback, 0o755);
    await rm(selected);
    await writeFile(join(first, "markdown-trace"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
    assert.equal(await resolveBinding({ PATH: path }), fallback, "Only the exact command name is discovered");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
