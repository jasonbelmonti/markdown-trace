#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { scanMarkdown } from "./markdown/index.js";
import { formatValidationReport } from "./reporting/index.js";
import { loadRegistry } from "./registry/index.js";
import { validate } from "./validation/index.js";

interface CliEnvironment {
  readonly cwd: string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

interface CliOptions {
  readonly registryPath: string;
  readonly documentPath: string;
  readonly reportPath?: string;
}

const USAGE = [
  "Usage: markdown-trace validate --registry <path> --document <path> [--report <path>]",
  "",
  "Runs the local Markdown Trace validation path and emits a deterministic report.",
].join("\n");

export async function main(
  argv = process.argv.slice(2),
  environment: CliEnvironment = {
    cwd: process.cwd(),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  },
): Promise<number> {
  try {
    const options = parseArguments(argv);

    if (options === "help") {
      environment.stdout(`${USAGE}\n`);
      return 0;
    }

    const registryPath = path.resolve(environment.cwd, options.registryPath);
    const documentPath = path.resolve(environment.cwd, options.documentPath);
    const registry = await loadRegistry(registryPath);
    const adapterFacts = await scanMarkdown(documentPath, registry);
    const result = validate(registry, adapterFacts);
    const exitCode = result.valid ? 0 : 1;
    const report = formatValidationReport({
      evidenceId: "EVD-2",
      validationCheckpoint: "VAL-2",
      registryPath: normalizeDisplayPath(environment.cwd, registryPath),
      documentPath: normalizeDisplayPath(environment.cwd, documentPath),
      result,
      registry,
      exitCode,
    });

    environment.stdout(report);

    if (options.reportPath !== undefined) {
      const reportPath = path.resolve(environment.cwd, options.reportPath);
      await mkdir(path.dirname(reportPath), { recursive: true });
      await writeFile(reportPath, report, "utf8");
    }

    return exitCode;
  } catch (error) {
    environment.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

function parseArguments(argv: readonly string[]): CliOptions | "help" {
  if (argv.includes("--help") || argv.includes("-h")) {
    return "help";
  }

  const args = argv[0] === "validate" ? argv.slice(1) : argv;
  let registryPath: string | undefined;
  let documentPath: string | undefined;
  let reportPath: string | undefined;

  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for ${flag ?? "argument"}`);
    }

    switch (flag) {
      case "--registry":
        registryPath = value;
        break;
      case "--document":
        documentPath = value;
        break;
      case "--report":
        reportPath = value;
        break;
      default:
        throw new Error(`unknown argument ${flag}`);
    }
  }

  if (registryPath === undefined || documentPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    registryPath,
    documentPath,
    reportPath,
  };
}

function normalizeDisplayPath(cwd: string, targetPath: string): string {
  const relativePath = path.relative(cwd, targetPath);
  return relativePath === "" ? "." : relativePath.split(path.sep).join("/");
}

const invokedPath = process.argv[1];

if (invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href) {
  process.exitCode = await main();
}
