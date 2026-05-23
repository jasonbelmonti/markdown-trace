#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { stringify } from "yaml";

import { deriveGraphFromRegistry } from "./graph/index.js";
import { scanMarkdown } from "./markdown/index.js";
import { formatValidationReport } from "./reporting/index.js";
import {
  deriveRegistryResultFromMarkdown,
  loadRegistry,
  RegistryLoadError,
  serializeRegistry,
  writeGeneratedSidecarArtifact,
} from "./registry/index.js";
import { TypeProfileLoadError } from "./profiles/model.js";
import { validate } from "./validation/index.js";

interface CliEnvironment {
  readonly cwd: string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

interface ValidateOptions {
  readonly command: "validate";
  readonly registryPath: string;
  readonly documentPath: string;
  readonly reportPath?: string;
}

interface DeriveOptions {
  readonly command: "derive";
  readonly documentPath: string;
  readonly namespace?: string;
  readonly typeProfilePath?: string;
  readonly outputPath?: string;
}

interface DeriveSidecarOptions {
  readonly command: "derive-sidecar";
  readonly documentPath: string;
  readonly typeProfilePath?: string;
}

type CliOptions = ValidateOptions | DeriveOptions | DeriveSidecarOptions;

const USAGE = [
  "Usage: markdown-trace validate --registry <path> --document <path> [--report <path>]",
  "       markdown-trace derive --document <path> [--namespace <namespace>] [--type-profile <path>] [--output <path>]",
  "       markdown-trace derive-sidecar --document <path> [--type-profile <path>]",
  "",
  "Runs the local Markdown Trace validation path, derives a registry and graph, or writes a generated sidecar artifact.",
].join("\n");

export async function main(
  argv = process.argv.slice(2),
  environment: CliEnvironment = {
    cwd: process.cwd(),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  },
): Promise<number> {
  let commandForError: CliOptions["command"] | undefined;

  try {
    const options = parseArguments(argv);

    if (options === "help") {
      environment.stdout(`${USAGE}\n`);
      return 0;
    }

    commandForError = options.command;

    if (options.command === "derive") {
      return await runDerive(options, environment);
    }

    return options.command === "derive-sidecar"
      ? await runDeriveSidecar(options, environment)
      : await runValidate(options, environment);
  } catch (error) {
    environment.stderr(formatCliError(error, commandForError));
    return 2;
  }
}

async function runValidate(
  options: ValidateOptions,
  environment: CliEnvironment,
): Promise<number> {
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
    await writeOutput(environment.cwd, options.reportPath, report);
  }

  return exitCode;
}

async function runDerive(
  options: DeriveOptions,
  environment: CliEnvironment,
): Promise<number> {
  const documentPath = path.resolve(environment.cwd, options.documentPath);
  const typeProfilePath =
    options.typeProfilePath === undefined
      ? undefined
      : path.resolve(environment.cwd, options.typeProfilePath);
  const { registry, diagnostics } = await deriveRegistryResultFromMarkdown(documentPath, {
    documentPath: normalizeDisplayPath(environment.cwd, documentPath),
    namespace: options.namespace,
    typeProfilePath,
  });
  const graph = deriveGraphFromRegistry(registry);
  const output = stringify({
    diagnostics,
    registry: serializeRegistry(registry),
    graph,
  });

  environment.stdout(output);

  if (options.outputPath !== undefined) {
    await writeOutput(environment.cwd, options.outputPath, output);
  }

  return 0;
}

async function runDeriveSidecar(
  options: DeriveSidecarOptions,
  environment: CliEnvironment,
): Promise<number> {
  const result = await writeGeneratedSidecarArtifact({
    repoRoot: environment.cwd,
    documentPath: options.documentPath,
    typeProfilePath: options.typeProfilePath,
  });

  environment.stdout(`${result.artifactRelativePath}\n`);

  return 0;
}

function parseArguments(argv: readonly string[]): CliOptions | "help" {
  if (argv.includes("--help") || argv.includes("-h")) {
    return "help";
  }

  const command =
    argv[0] === "derive" || argv[0] === "validate" || argv[0] === "derive-sidecar"
      ? argv[0]
      : "validate";
  const args = command === argv[0] ? argv.slice(1) : argv;

  if (command === "derive") {
    return parseDeriveArguments(args);
  }

  return command === "derive-sidecar"
    ? parseDeriveSidecarArguments(args)
    : parseValidateArguments(args);
}

function parseValidateArguments(args: readonly string[]): ValidateOptions {
  const values = parseFlagValues(args, ["--registry", "--document", "--report"]);
  const registryPath = values.get("--registry");
  const documentPath = values.get("--document");

  if (registryPath === undefined || documentPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    command: "validate",
    registryPath,
    documentPath,
    reportPath: values.get("--report"),
  };
}

function parseDeriveArguments(args: readonly string[]): DeriveOptions {
  const values = parseFlagValues(args, [
    "--document",
    "--namespace",
    "--type-profile",
    "--output",
  ]);
  const documentPath = values.get("--document");

  if (documentPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    command: "derive",
    documentPath,
    namespace: values.get("--namespace"),
    typeProfilePath: values.get("--type-profile"),
    outputPath: values.get("--output"),
  };
}

function parseDeriveSidecarArguments(args: readonly string[]): DeriveSidecarOptions {
  const values = parseFlagValues(args, ["--document", "--type-profile"]);
  const documentPath = values.get("--document");

  if (documentPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    command: "derive-sidecar",
    documentPath,
    typeProfilePath: values.get("--type-profile"),
  };
}

function parseFlagValues(
  args: readonly string[],
  allowedFlags: readonly string[],
): ReadonlyMap<string, string> {
  const values = new Map<string, string>();
  const allowed = new Set(allowedFlags);

  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for ${flag ?? "argument"}`);
    }

    if (!allowed.has(flag)) {
      throw new Error(`unknown argument ${flag}`);
    }

    values.set(flag, value);
  }

  return values;
}

async function writeOutput(cwd: string, outputPath: string, output: string): Promise<void> {
  const resolvedOutputPath = path.resolve(cwd, outputPath);
  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
  await writeFile(resolvedOutputPath, output, "utf8");
}

function normalizeDisplayPath(cwd: string, targetPath: string): string {
  const relativePath = path.relative(cwd, targetPath);
  return relativePath === "" ? "." : relativePath.split(path.sep).join("/");
}

function formatCliError(error: unknown, command: CliOptions["command"] | undefined): string {
  const message = error instanceof Error ? error.message : String(error);
  const failureSurface =
    command === "derive" || command === "derive-sidecar"
      ? failureSurfaceForError(error)
      : undefined;

  return failureSurface === undefined
    ? `${message}\n`
    : `Failure surface: ${failureSurface}\n${message}\n`;
}

function failureSurfaceForError(error: unknown): string | undefined {
  if (error instanceof TypeProfileLoadError) {
    return "profile_validation";
  }

  if (error instanceof RegistryLoadError) {
    return / has (parse|normalize) diagnostic /.test(error.message)
      ? "link_parsing"
      : "registry_derivation";
  }

  return undefined;
}

const invokedPath = process.argv[1];

if (invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href) {
  process.exitCode = await main();
}
