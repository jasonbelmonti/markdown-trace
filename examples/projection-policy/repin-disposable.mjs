/** Explicit authoring utility for a copied defect fixture. Never run on reviewed examples. */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const directory = resolve(process.argv[2] ?? '');
if (!process.argv[2] || !directory.includes('projection-defect-'))
  throw new Error('Pass a disposable directory whose name contains projection-defect-.');
const packageName = process.argv[3] ?? '@jasonbelmonti/markdown-trace';
const { analyzeDocument, compileProjectionPolicy, compileValidationProfile } = await import(packageName);
const unwrap = result => { if (!result.ok) throw new Error(result.error.message); return result.value; };
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
const manifestPath = join(directory, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const policy = unwrap(compileProjectionPolicy(await readFile(join(directory, manifest.policyFile), 'utf8')));
const expectedSources = [];
const analyses = new Map();
for (const row of manifest.sources) {
  const text = await readFile(join(directory, row.file), 'utf8');
  const profileJson = await readFile(join(directory, row.profileFile), 'utf8');
  const profile = unwrap(compileValidationProfile(profileJson));
  const analysis = unwrap(analyzeDocument({ documentId: row.documentId, text }, profile, manifest.limits.analysis));
  analyses.set(row.alias, analysis.snapshot.analysisId);
  expectedSources.push({ alias: row.alias, revision: row.revision,
    pin: { analysisId: analysis.snapshot.analysisId, source: analysis.snapshot.source },
    profileFileSha256: sha256(profileJson), interpretationHash: profile.interpretationHash,
    validationHash: profile.validationHash });
}
const prior = new Map(manifest.expected.sources.map(row => [row.pin.analysisId, row.alias]));
manifest.bindings = manifest.bindings.map(binding => ({
  source: { ...binding.source, analysisId: analyses.get(prior.get(binding.source.analysisId)) ?? binding.source.analysisId },
  target: { ...binding.target, analysisId: analyses.get(prior.get(binding.target.analysisId)) ?? binding.target.analysisId },
}));
manifest.expected = { ...manifest.expected, policy: policy.identity, sources: expectedSources };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write('Disposable manifest deliberately repinned; rerun production to evaluate the defect.\n');
