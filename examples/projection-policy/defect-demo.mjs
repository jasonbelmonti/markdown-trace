import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const binary = process.env.PROJECTION_EXAMPLE_BIN ?? join(here, '../../node_modules/.bin/markdown-trace-document');
const packageName = process.argv[2] ?? '@jasonbelmonti/markdown-trace';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const run = (program, args) => {
  const result = spawnSync(process.execPath, [program, ...args], { encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
};
const inputNames = manifest => [...new Set([...manifest.sources.flatMap(source => [source.file, source.profileFile]), manifest.policyFile, 'manifest.json'])];
async function hashes(directory) {
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  return Object.fromEntries(await Promise.all(inputNames(manifest).map(async name => [name, sha256(await readFile(join(directory, name)))])));
}
async function observed(label, directory, command, exit, check) {
  const before = await hashes(directory);
  const result = run(binary, command);
  assert.equal(result.status, exit, `${label}: ${result.stderr}`);
  check?.(result);
  const after = await hashes(directory);
  assert.deepEqual(after, before, `${label}: command changed trusted inputs`);
  records.push({ label, exit, before, after, stdoutBytes: Buffer.byteLength(result.stdout), stderrBytes: Buffer.byteLength(result.stderr) });
  return result;
}
const produce = directory => ['--projection-manifest', join(directory, 'manifest.json')];
const records = [];
const scratch = await mkdtemp(join(tmpdir(), 'projection-defect-'));

async function copied(name, source) {
  const directory = join(scratch, name);
  await cp(join(here, source), directory, { recursive: true });
  return directory;
}
async function repin(directory) {
  const before = await hashes(directory);
  const result = run(join(here, 'repin-disposable.mjs'), [directory, packageName]);
  assert.equal(result.status, 0, result.stderr);
  const after = await hashes(directory);
  assert.notEqual(after['manifest.json'], before['manifest.json']);
  records.push({ label: `${directory}: explicit repin`, exit: 0, before, after });
}
async function defect(name, source, file, from, to) {
  const directory = await copied(name, source);
  const target = join(directory, file);
  const original = await readFile(target, 'utf8');
  assert.equal(original.includes(from), true);
  await writeFile(target, original.replace(from, to));
  await observed(`${name}: stale before repin`, directory, produce(directory), 2,
    result => assert.equal(JSON.parse(result.stderr).code, 'stale-input'));
  await repin(directory);
  await observed(`${name}: missing obligation after repin`, directory, produce(directory), 1,
    result => assert.equal(JSON.parse(result.stdout).policyStatus, 'unsatisfied'));
  await writeFile(target, original);
  await repin(directory);
  await observed(`${name}: restored`, directory, produce(directory), 0,
    result => assert.equal(JSON.parse(result.stdout).policyStatus, 'satisfied'));
}

try {
  const originalSingle = await hashes(join(here, 'single'));
  const originalCorpus = await hashes(join(here, 'corpus'));
  await defect('single-global', 'single', 'task.md', '## Scope\n\nThe selected task has a narrow objective.\n\n', '');
  await defect('single-edge', 'single', 'task.md',
    'Implements [criterion](ctx://trace/entity/REQ-1?rel=implements).', 'Implements the criterion.');
  await defect('corpus-global', 'corpus', 'task-a.md', '## Scope\n\nOnly Task A is assigned.\n\n', '');

  const budget = await copied('short-budget', 'single');
  const budgetPath = join(budget, 'manifest.json');
  const originalBudget = await readFile(budgetPath, 'utf8');
  const short = JSON.parse(originalBudget);
  short.budget.maxUtf8Bytes = 550;
  await writeFile(budgetPath, JSON.stringify(short));
  await observed('short budget', budget, produce(budget), 1, result => {
    const packet = JSON.parse(result.stdout);
    assert.equal(packet.policyStatus, 'unsatisfied');
    assert.deepEqual(packet.parts, []);
  });
  await writeFile(budgetPath, originalBudget);
  await observed('budget restored', budget, produce(budget), 0);

  const tamper = await copied('tampered-packet', 'single');
  const normal = await observed('tamper baseline', tamper, produce(tamper), 0);
  const packetPath = join(tamper, 'packet.json');
  const packet = JSON.parse(normal.stdout);
  packet.parts[0].text += ' changed';
  await writeFile(packetPath, JSON.stringify(packet));
  await observed('tampered packet', tamper,
    ['--verify-projection', packetPath, '--projection-manifest', join(tamper, 'manifest.json')], 1,
    result => assert.equal(JSON.parse(result.stdout).status, 'fail'));
  await writeFile(packetPath, normal.stdout);
  await observed('packet restored', tamper,
    ['--verify-projection', packetPath, '--projection-manifest', join(tamper, 'manifest.json')], 0,
    result => assert.equal(JSON.parse(result.stdout).status, 'pass'));
  assert.deepEqual(await hashes(join(here, 'single')), originalSingle);
  assert.deepEqual(await hashes(join(here, 'corpus')), originalCorpus);
  process.stdout.write(`${JSON.stringify({ status: 'pass', records, originalSingle, originalCorpus })}\n`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
