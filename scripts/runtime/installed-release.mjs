import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { entrypoint, sha256, verifyPayload } from "./integrity.mjs";
import { verifyLauncher, writeLauncher } from "./launcher.mjs";

const commandName = "markdown-trace-document";
const idPattern = /^[a-f0-9]{40}-[a-f0-9]{64}$/;

async function directory(path, create = false) {
  if (create) await mkdir(path, { recursive: true });
  const stat = await lstat(path);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `Expected real directory: ${path}`);
}

export async function installRoot(root, create = false) {
  assert.ok(isAbsolute(root), "Install root must be absolute");
  await directory(root, create);
  const canonical = await realpath(root);
  await directory(join(canonical, "releases"), create);
  await directory(join(canonical, "bin"), create);
  return canonical;
}

function releasePath(root, id) {
  assert.match(id, idPattern, "Invalid release ID");
  return join(root, "releases", id);
}

function descriptorIdentity(descriptor) {
  const id = `${descriptor.identity.sourceCommit}-${descriptor.payloadSha256}`;
  assert.match(id, idPattern);
  assert.equal(descriptor.payloadDirectory, `markdown-trace-${descriptor.identity.packageVersion}-${descriptor.identity.sourceCommit}`);
  assert.equal(basename(descriptor.payloadDirectory), descriptor.payloadDirectory);
  return id;
}

async function verifySlot(root, id) {
  const slot = releasePath(root, id);
  await directory(slot);
  const descriptorPath = join(slot, "release.json");
  const descriptorStat = await lstat(descriptorPath);
  assert.ok(descriptorStat.isFile() && !descriptorStat.isSymbolicLink(), "Descriptor must be a regular file");
  const descriptor = JSON.parse(await readFile(descriptorPath, "utf8"));
  assert.equal(descriptorIdentity(descriptor), id, "Release ID differs from descriptor");
  const payload = join(slot, descriptor.payloadDirectory);
  const verified = await verifyPayload(descriptorPath, payload);
  const launcher = join(slot, commandName);
  await verifyLauncher(launcher, join(payload, entrypoint));
  return { id, slot, launcher, descriptor: verified };
}

export async function stage(rootInput, candidateInput, descriptorInput) {
  const root = await installRoot(rootInput, true);
  const candidate = resolve(candidateInput);
  await directory(candidate);
  assert.ok(descriptorInput, "A separately selected trusted descriptor is required");
  const sourceDescriptor = resolve(descriptorInput);
  const sourceStat = await lstat(sourceDescriptor);
  assert.ok(sourceStat.isFile() && !sourceStat.isSymbolicLink(), "Source descriptor must be a regular file");
  const sourceBytes = await readFile(sourceDescriptor);
  const descriptor = JSON.parse(sourceBytes);
  const id = descriptorIdentity(descriptor);
  await verifyPayload(sourceDescriptor, join(candidate, descriptor.payloadDirectory));
  const final = releasePath(root, id);
  assert.equal(await lstat(final).catch(error => error.code === "ENOENT" ? null : Promise.reject(error)), null,
    "Release already exists");
  const pending = await mkdtemp(join(root, "releases", ".pending-"));
  try {
    await cp(join(candidate, descriptor.payloadDirectory), join(pending, descriptor.payloadDirectory), { recursive: true });
    await writeFile(join(pending, "release.json"), sourceBytes, { flag: "wx" });
    assert.equal(sha256(await readFile(sourceDescriptor)), sha256(sourceBytes), "Source descriptor changed during staging");
    await verifyPayload(join(pending, "release.json"), join(pending, descriptor.payloadDirectory));
    // The final slot path is known before rename, so the launcher never follows a moving alias.
    await writeLauncher(join(pending, commandName), join(final, descriptor.payloadDirectory, entrypoint));
    await verifyLauncher(join(pending, commandName), join(final, descriptor.payloadDirectory, entrypoint));
    await rename(pending, final);
    await verifySlot(root, id);
    return { id, root, launcher: join(final, commandName) };
  } finally {
    await rm(pending, { recursive: true, force: true });
  }
}

export async function verify(rootInput, id) {
  const root = await installRoot(rootInput);
  return verifySlot(root, id);
}

function checkedProcess(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", timeout: 30_000 });
  assert.equal(result.status, 0, `${command} failed: ${result.error?.message ?? result.stderr ?? result.signal}`);
  assert.equal(result.stderr, "", `${command} emitted unexpected stderr`);
  return result.stdout.trim();
}

export async function activate(rootInput, id) {
  const root = await installRoot(rootInput);
  const selected = await verifySlot(root, id);
  const nodeVersion = checkedProcess("node", ["--version"], root);
  const observed = JSON.parse(checkedProcess(selected.launcher, ["--runtime-info"], root));
  assert.deepEqual(observed, { ...selected.descriptor.identity, nodeVersion }, "Runtime identity differs");
  const active = join(root, "bin", commandName);
  const prior = await lstat(active).catch(error => error.code === "ENOENT" ? null : Promise.reject(error));
  assert.ok(!prior || prior.isSymbolicLink(), "Active command is not an installer symlink");
  const previous = prior ? await readlink(active) : null;
  if (previous) assert.match(previous, /^\.\.\/releases\/[a-f0-9]{40}-[a-f0-9]{64}\/markdown-trace-document$/,
    "Active command is not an installer release link");
  const pending = join(root, "bin", `.pending-${process.pid}-${Date.now()}`);
  await symlink(relative(join(root, "bin"), selected.launcher), pending);
  try {
    await rename(pending, active);
  } finally {
    await rm(pending, { force: true });
  }
  return { id, active, previous };
}

export const rollback = activate;

export async function status(rootInput) {
  const root = await installRoot(rootInput);
  const active = join(root, "bin", commandName);
  const link = await readlink(active).catch(error => error.code === "ENOENT" ? null : Promise.reject(error));
  return { root, active: link, releases: (await readdir(join(root, "releases"))).filter(name => idPattern.test(name)).sort() };
}
