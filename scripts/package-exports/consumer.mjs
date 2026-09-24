import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { run } from "./process.mjs";
import { runGraphApiSmoke } from "./graph-consumer.mjs";
import { runGraphDemoSmoke } from "./graph-demo.mjs";

export async function checkPackedConsumer({
  consumerDirectory,
  consumerFixture,
  packageName,
  repositoryRoot,
  tarballPath,
}) {
  await prepareConsumer(consumerDirectory, consumerFixture);
  installTarball(consumerDirectory, tarballPath);
  compileConsumer(consumerDirectory, repositoryRoot);
  runGraphApiSmoke(consumerDirectory, packageName);
  runGraphApiSmoke(consumerDirectory, `${packageName}/experimental/graph`);
  await runGraphDemoSmoke(consumerDirectory, repositoryRoot);
  runDeepImportNegatives(consumerDirectory, packageName);
}

async function prepareConsumer(consumerDirectory, consumerFixture) {
  await mkdir(consumerDirectory, { recursive: true });
  await writeFile(
    path.join(consumerDirectory, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
    "utf8",
  );
  await copyFile(consumerFixture, path.join(consumerDirectory, "consumer.ts"));
}

function installTarball(consumerDirectory, tarballPath) {
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      tarballPath,
    ],
    { cwd: consumerDirectory },
  );
}

function compileConsumer(consumerDirectory, repositoryRoot) {
  const typescriptCli = path.join(
    repositoryRoot,
    "node_modules/typescript/bin/tsc",
  );
  run(
    process.execPath,
    [
      typescriptCli,
      "--noEmit",
      "--strict",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "consumer.ts",
    ],
    { cwd: consumerDirectory },
  );
}

function runDeepImportNegatives(consumerDirectory, packageName) {
  for (const specifier of [
    `${packageName}/public`,
    `${packageName}/graph-validation`,
    `${packageName}/graph`,
    `${packageName}/experimental/graph/analyze`,
    `${packageName}/dist/markdowntrace/cli.js`,
  ]) {
    const program = [
      `const specifier = ${JSON.stringify(specifier)};`,
      "try {",
      "  await import(specifier);",
      "  throw new Error(`unexpectedly imported ${specifier}`);",
      "} catch (error) {",
      "  if (error?.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') {",
      "    throw error;",
      "  }",
      "}",
    ].join("\n");

    run(process.execPath, ["--input-type=module", "--eval", program], {
      cwd: consumerDirectory,
    });
  }
}
