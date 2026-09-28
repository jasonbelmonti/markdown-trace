import { cp } from 'node:fs/promises';
import path from 'node:path';
import { run } from './process.mjs';

export async function runProjectionSmoke(consumerDirectory, packageName, repositoryRoot) {
  const source = path.join(repositoryRoot, 'examples/projection-policy');
  const destination = path.join(consumerDirectory, 'examples/projection-policy');
  await cp(source, destination, { recursive: true, force: true });
  const result = run(process.execPath, [path.join(destination, 'run.mjs'), packageName], { cwd: consumerDirectory });
  const defects = run(process.execPath, [path.join(destination, 'defect-demo.mjs'), packageName], { cwd: consumerDirectory });
  return `${packageName}: ${result.stdout.trim()}\n${packageName}: ${defects.stdout.trim()}`;
}
