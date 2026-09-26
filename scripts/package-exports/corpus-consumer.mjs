import { copyFile, cp, mkdir } from "node:fs/promises";
import path from "node:path";

import { run } from "./process.mjs";
import { verifyCorpusManifestRebinds } from "./corpus-rebind-consumer.mjs";

export async function runCorpusApiSmoke(consumerDirectory, packageName, repositoryRoot) {
  const exampleSource = path.join(repositoryRoot, "examples/cross-document");
  const exampleDestination = path.join(consumerDirectory, "examples/cross-document");
  await cp(exampleSource, exampleDestination, { recursive: true, force: true });
  const scriptSource = path.join(repositoryRoot, "scripts/demo-document-corpus.mjs");
  const scriptDestination = path.join(consumerDirectory, "scripts/demo-document-corpus.mjs");
  await mkdir(path.dirname(scriptDestination), { recursive: true });
  await copyFile(scriptSource, scriptDestination);
  const result = run(process.execPath, [scriptDestination, "examples/cross-document/manifest.json",
    "--package", packageName, "--exercise-edits"], { cwd: consumerDirectory });
  const manifestRebinds = await verifyCorpusManifestRebinds({ consumerDirectory, packageName, scriptDestination,
    exampleDirectory: exampleDestination, editCases: JSON.parse(result.stdout).editCases });
  return `${path.basename(packageName === "@jasonbelmonti/markdown-trace" ? "root" : "experimental")}: ${result.stdout.trim()}\n${JSON.stringify({ manifestRebinds })}`;
}
