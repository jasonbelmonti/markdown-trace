import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkPackedConsumer } from "./package-exports/consumer.mjs";
import { assert, run } from "./package-exports/process.mjs";

const PACKAGE_NAME = "@jasonbelmonti/markdown-trace";
const PACKAGE_VERSION = "0.1.0";
const ENGINE_VERSION = "3.6.0";
const NODE_RANGE = "^20.19.0 || >=22.12.0";
const GRAPH_TYPES = "./dist/markdowntrace/document-graph/index.d.ts";
const GRAPH_IMPORT = "./dist/markdowntrace/document-graph/index.js";
const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), "..");
const consumerFixture = path.join(
  repositoryRoot,
  "tests/fixtures/public-package/consumer.ts.fixture",
);

async function main() {
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "markdown-trace-package-exports-"),
  );

  try {
    const manifest = await readJson(path.join(repositoryRoot, "package.json"));
    const lockfile = await readJson(path.join(repositoryRoot, "package-lock.json"));
    assertManifest(manifest, lockfile);

    const stageDirectory = path.join(temporaryRoot, "package");
    await preparePackageStage(stageDirectory);
    await assertPublicDeclaration(stageDirectory);

    const packDirectory = path.join(temporaryRoot, "pack");
    await mkdir(packDirectory, { recursive: true });
    const packResult = run(
      "npm",
      ["pack", stageDirectory, "--json", "--pack-destination", packDirectory],
      { cwd: repositoryRoot },
    );
    const tarballPath = packageTarballPath(packResult.stdout, packDirectory);
    const members = tarballMembers(tarballPath);
    assertTarballMembers(members);

    const consumerDirectory = path.join(temporaryRoot, "consumer");
    await checkPackedConsumer({
      consumerDirectory,
      consumerFixture,
      packageName: PACKAGE_NAME,
      repositoryRoot,
      tarballPath,
    });

    process.stdout.write(
      [
        `package: ${PACKAGE_NAME}@${PACKAGE_VERSION}`,
        `tarball entries: ${members.length}`,
        "declaration closure: self-contained",
        "root graph API: pass",
        "experimental graph API: pass",
        "deep imports: rejected",
        "package exports contract: PASS",
      ].join("\n") + "\n",
    );
  } finally {
    await rm(temporaryRoot, { recursive: true });
  }
}

async function preparePackageStage(stageDirectory) {
  await mkdir(stageDirectory, { recursive: true });
  await Promise.all([
    copyFile(
      path.join(repositoryRoot, "package.json"),
      path.join(stageDirectory, "package.json"),
    ),
    copyFile(
      path.join(repositoryRoot, "README.md"),
      path.join(stageDirectory, "README.md"),
    ),
  ]);

  run("npm", ["run", "check:release-metadata", "--silent"], {
    cwd: repositoryRoot,
  });
  run(
    process.execPath,
    [
      path.join(repositoryRoot, "node_modules/typescript/bin/tsc"),
      "-p",
      path.join(repositoryRoot, "tsconfig.build.json"),
      "--outDir",
      path.join(stageDirectory, "dist"),
    ],
    { cwd: repositoryRoot },
  );
}

function assertManifest(manifest, lockfile) {
  const rootLock = lockfile.packages?.[""];

  assert(manifest.name === PACKAGE_NAME, `package name must be ${PACKAGE_NAME}`);
  assert(manifest.version === PACKAGE_VERSION, `package version must be ${PACKAGE_VERSION}`);
  assert(manifest.private === true, "package manifest must retain private: true");
  assert(manifest.license === "MIT", "package license must be MIT");
  assert(manifest.type === "module", "package type must be module");
  assert(manifest.sideEffects === false, "package sideEffects must be false");
  assert(manifest.types === GRAPH_TYPES, `package types must target ${GRAPH_TYPES}`);
  assert(
    JSON.stringify(manifest.exports) ===
      JSON.stringify({
        ".": { types: GRAPH_TYPES, import: GRAPH_IMPORT },
        "./experimental/graph": {
          types: GRAPH_TYPES,
          import: GRAPH_IMPORT,
        },
      }),
    "package exports must contain the root and experimental graph entries",
  );
  assert(
    JSON.stringify(manifest.files) === JSON.stringify(["dist"]),
    "package files must contain only dist in this slice",
  );
  assert(!Object.hasOwn(manifest, "publishConfig"), "package manifest must omit publishConfig");
  assert(manifest.engines?.node === NODE_RANGE, `Node range must remain ${NODE_RANGE}`);
  assert(
    JSON.stringify(manifest.bin) ===
      JSON.stringify({ "markdown-trace-document": "./dist/markdowntrace/document-graph/cli.js" }),
    "package bin must expose only the document command",
  );
  assert(
    manifest.dependencies?.["@jasonbelmonti/markdown-engine"] === ENGINE_VERSION,
    `Markdown Engine must remain ${ENGINE_VERSION}`,
  );
  assert(rootLock?.name === PACKAGE_NAME, "lockfile root package name must match");
  assert(rootLock?.version === PACKAGE_VERSION, "lockfile root version must match");
  assert(rootLock?.license === "MIT", "lockfile root license must be MIT");
  assert(
    JSON.stringify(rootLock?.bin) ===
      JSON.stringify({ "markdown-trace-document": "dist/markdowntrace/document-graph/cli.js" }),
    "lockfile root bin metadata must match",
  );
  assert(
    rootLock?.dependencies?.["@jasonbelmonti/markdown-engine"] === ENGINE_VERSION,
    "lockfile Markdown Engine dependency must match",
  );
  assert(
    lockfile.packages?.["node_modules/@jasonbelmonti/markdown-engine"]?.version === ENGINE_VERSION,
    "lockfile resolved Markdown Engine version must match",
  );
  assert(rootLock?.engines?.node === NODE_RANGE, "lockfile Node range must match");
  assert(!Object.hasOwn(manifest.dependencies, "yaml"), "retired YAML dependency must be absent");
}

async function assertPublicDeclaration(stageDirectory) {
  const declarationPath = path.join(
    stageDirectory,
    "dist/markdowntrace/document-graph/index.d.ts",
  );
  const declaration = await readFile(declarationPath, "utf8");

  assert(declaration.length > 0, "public declaration must not be empty");
  for (const prohibited of [
    "@jasonbelmonti/markdown-engine",
    "../src/",
    "./graph-validation/",
    "./trace-evidence/",
    "./graph-profile/",
  ]) {
    assert(
      !declaration.includes(prohibited),
      `public declaration must not contain ${prohibited}`,
    );
  }
}

function packageTarballPath(stdout, packDirectory) {
  let packEntries;
  try {
    packEntries = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`npm pack did not return valid JSON: ${error.message}`);
  }

  assert(Array.isArray(packEntries) && packEntries.length === 1, "npm pack must return one artifact");
  assert(
    packEntries[0]?.name === PACKAGE_NAME &&
      packEntries[0]?.version === PACKAGE_VERSION,
    "npm pack identity must match the manifest",
  );

  return path.join(packDirectory, packEntries[0].filename);
}

function tarballMembers(tarballPath) {
  const result = run("tar", ["-tf", tarballPath], { cwd: repositoryRoot });
  return result.stdout.split("\n").filter(Boolean).sort();
}

function assertTarballMembers(members) {
  const allowedExact = new Set(["package/README.md", "package/package.json"]);
  const unexpected = members.filter(
    (member) => !allowedExact.has(member) && !member.startsWith("package/dist/"),
  );

  assert(unexpected.length === 0, `unexpected tarball members: ${unexpected.join(", ")}`);
  for (const required of [
    "package/dist/markdowntrace/document-graph/index.js",
    "package/dist/markdowntrace/document-graph/index.d.ts",
    "package/dist/markdowntrace/document-graph/cli.js",
  ]) {
    assert(members.includes(required), `tarball must contain ${required}`);
  }
  for (const retired of ["public.js", "cli.js", "graph-validation/", "registry/", "migration/"]) {
    assert(
      !members.some((member) => member.startsWith(`package/dist/markdowntrace/${retired}`)),
      `tarball must omit retired path ${retired}`,
    );
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

main().catch((error) => {
  process.stderr.write(`package exports check failed: ${error.message}\n`);
  process.exitCode = 1;
});
