import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const packageName = process.argv[2] ?? '@jasonbelmonti/markdown-trace';
const { compileProjectionPolicy, produceProjection, verifyProjection } = await import(packageName);
const binary = process.env.PROJECTION_EXAMPLE_BIN ?? join(here, '../../node_modules/.bin/markdown-trace-document');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const unwrap = result => { assert.equal(result.ok, true, result.error?.message); return result.value; };

const oracle = {
  single: {
    sourceBytes: 697, projectedBytes: 551,
    parts: [
      '# Task', '## Scope\n\nThe selected task has a narrow objective.\n\n',
      '## Authority\n\nThe owner controls this contract.\n\n',
      '## Constraints\n\nInputs are explicit and bounded.\n\n',
      '## Review Boundary\n\nOnly declared criteria are evaluated.\n\n',
      '## [Work](ctx://trace/entity/WP-1?role=definition)',
      'Implements [criterion](ctx://trace/entity/REQ-1?rel=implements).',
      '## [Criterion](ctx://trace/entity/REQ-1?role=definition)',
      'Requires [constraint](ctx://trace/entity/CON-1?rel=requires).',
      '## [Constraint](ctx://trace/entity/CON-1?role=definition)',
      'The bounded execution environment is required.',
    ],
    offsets: [[0, 6], [70, 123], [123, 172], [172, 222], [222, 281], [352, 402], [404, 468], [470, 526], [528, 589], [591, 648], [650, 696]],
  },
  corpus: {
    parts: [
      '# [Plan action](ctx://trace/entity/WP-1?role=definition)',
      'Implements [Task A criterion](ctx://trace/entity/REQ-1?rel=implements).',
      '# Task A', '## Scope\n\nOnly Task A is assigned.\n\n',
      "## Authority\n\nTask A's owner approves this work.\n\n",
      '## Constraints\n\nTask A inputs stay bounded.\n\n',
      "## Review Boundary\n\nReview Task A's declared obligations.\n\n",
      '## [Criterion A](ctx://trace/entity/REQ-1?role=definition)',
      'Requires [Task A constraint](ctx://trace/entity/CON-1?rel=requires).',
      '## [Constraint A](ctx://trace/entity/CON-1?role=definition)',
      'Task A constraint is mandatory.',
    ],
    sources: ['plan', 'plan', 'task-a', 'task-a', 'task-a', 'task-a', 'task-a', 'task-a', 'task-a', 'task-a', 'task-a'],
    excluded: 'Task B has a colliding criterion that is unrelated to the assignment.',
  },
};

async function runCase(name) {
  const directory = join(here, name);
  const manifestBytes = await readFile(join(directory, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  const files = [
    ...manifest.sources.flatMap(row => [row.file, row.profileFile]),
    manifest.policyFile, 'manifest.json',
  ];
  const before = Object.fromEntries(await Promise.all(files.map(async file => [file, sha256(await readFile(join(directory, file)))])));
  const policy = unwrap(compileProjectionPolicy(await readFile(join(directory, manifest.policyFile), 'utf8')));
  const sources = await Promise.all(manifest.sources.map(async row => ({
    alias: row.alias, revision: row.revision, documentId: row.documentId,
    text: await readFile(join(directory, row.file), 'utf8'),
    validationProfileJson: await readFile(join(directory, row.profileFile), 'utf8'),
  })));
  const { schemaVersion: _schemaVersion, policyFile: _policyFile, ...request } = manifest;
  const input = { ...request, sources, policy };
  const packet = unwrap(produceProjection(input));
  assert.equal(packet.policyStatus, 'satisfied');
  assert.equal(packet.requiredSetComplete, true);
  assert.equal(unwrap(verifyProjection(input, JSON.parse(JSON.stringify(packet)))).status, 'pass');
  assert.deepEqual(packet.parts.map(part => part.text), oracle[name].parts);
  for (const part of packet.parts) {
    const original = sources.find(row => row.alias === part.source).text;
    assert.equal(part.text, original.slice(part.range.start.offset, part.range.end.offset));
  }
  if (name === 'single') {
    assert.deepEqual(packet.parts.map(part => [part.range.start.offset, part.range.end.offset]), oracle.single.offsets);
    assert.equal(packet.measurements.originalSourceUtf8Bytes, oracle.single.sourceBytes);
    assert.equal(packet.measurements.projectedSourceUtf8Bytes, oracle.single.projectedBytes);
    assert.equal(packet.parts.length, 11);
    assert.equal(JSON.stringify(packet).includes('This source section is deliberately optional.'), false);
  } else {
    assert.deepEqual(packet.parts.map(part => part.source), oracle.corpus.sources);
    assert.equal(JSON.stringify(packet).includes(oracle.corpus.excluded), false);
    assert.deepEqual(packet.obligations.filter(row => row.requirement === 'required').map(row => row.id), [
      '["roots","plan","WP-1"]', '["scope","task-a","section"]',
      '["authority","task-a","section"]', '["constraints","task-a","section"]',
      '["review","task-a","section"]', '["acceptance","task-a","REQ-1"]',
      '["dependencies","task-a","CON-1"]',
    ]);
  }

  const command = spawnSync(process.execPath, [binary, '--projection-manifest', join(directory, 'manifest.json')], { encoding: 'utf8' });
  assert.equal(command.status, 0, command.stderr);
  assert.equal(command.stderr, '');
  assert.equal(command.stdout.endsWith('\n'), false);
  assert.equal(command.stdout.startsWith('\uFEFF'), false);
  assert.deepEqual(JSON.parse(command.stdout), packet);
  const wireBytes = Buffer.byteLength(command.stdout, 'utf8');
  const temporary = await mkdtemp(join(tmpdir(), 'trace-projection-packet-'));
  try {
    const packetFile = join(temporary, 'packet.json');
    await writeFile(packetFile, command.stdout);
    const verification = spawnSync(process.execPath, [binary, '--verify-projection', packetFile, '--projection-manifest', join(directory, 'manifest.json')], { encoding: 'utf8' });
    assert.equal(verification.status, 0, verification.stderr);
    assert.equal(verification.stderr, '');
    assert.equal(verification.stdout.endsWith('\n'), false);
    assert.equal(JSON.parse(verification.stdout).status, 'pass');
    const tampered = JSON.parse(command.stdout);
    tampered.parts[0].text += ' changed';
    await writeFile(packetFile, JSON.stringify(tampered));
    const rejected = spawnSync(process.execPath, [binary, '--verify-projection', packetFile, '--projection-manifest', join(directory, 'manifest.json')], { encoding: 'utf8' });
    assert.equal(rejected.status, 1);
    assert.equal(rejected.stderr, '');
    assert.equal(JSON.parse(rejected.stdout).status, 'fail');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  const after = Object.fromEntries(await Promise.all(files.map(async file => [file, sha256(await readFile(join(directory, file)))])));
  assert.deepEqual(after, before);
  return { case: name, originalSourceUtf8Bytes: packet.measurements.originalSourceUtf8Bytes,
    projectedSourceUtf8Bytes: packet.measurements.projectedSourceUtf8Bytes,
    packetUtf8Bytes: wireBytes, partCount: packet.parts.length, inputHashes: before };
}

for (const name of ['single', 'corpus']) process.stdout.write(`${JSON.stringify(await runCase(name))}\n`);
