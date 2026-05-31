#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { stringify } from "yaml";

import { deriveGraphFromRegistry } from "./graph/index.js";
import { scanMarkdown } from "./markdown/index.js";
import { runMigrationCheck, type MigrationCheckResult } from "./migration/check.js";
import { formatMigrationComparisonReport, formatValidationReport } from "./reporting/index.js";
import {
  checkGeneratedSidecarArtifact,
  deriveRegistryResultFromMarkdown,
  type GeneratedSidecarDriftDiagnostic,
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
  readonly check: boolean;
}

interface MigrationCheckOptions {
  readonly command: "migration-check";
  readonly documentPath: string;
  readonly manualRegistryPath: string;
  readonly typeProfilePath?: string;
}

type CliOptions =
  | ValidateOptions
  | DeriveOptions
  | DeriveSidecarOptions
  | MigrationCheckOptions;

const USAGE = [
  "Usage: markdown-trace validate --registry <path> --document <path> [--report <path>]",
  "       markdown-trace derive --document <path> [--namespace <namespace>] [--type-profile <path>] [--output <path>]",
  "       markdown-trace derive-sidecar --document <path> [--type-profile <path>] [--check]",
  "       markdown-trace migration-check --document <path> --manual-registry <path> [--type-profile <path>]",
  "",
  "Runs local Markdown Trace validation, derives registry data, writes/checks a generated sidecar artifact, or checks migration parity.",
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

    if (options.command === "migration-check") {
      return await runMigrationCheckCommand(options, environment);
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
  if (options.check) {
    const result = await checkGeneratedSidecarArtifact({
      repoRoot: environment.cwd,
      documentPath: options.documentPath,
      typeProfilePath: options.typeProfilePath,
    });

    if (!result.valid) {
      environment.stderr(formatGeneratedSidecarDriftDiagnostics(result.diagnostics));
      return 1;
    }

    environment.stdout(`${result.artifactRelativePath}\n`);
    return 0;
  }

  const result = await writeGeneratedSidecarArtifact({
    repoRoot: environment.cwd,
    documentPath: options.documentPath,
    typeProfilePath: options.typeProfilePath,
  });

  environment.stdout(`${result.artifactRelativePath}\n`);

  return 0;
}

async function runMigrationCheckCommand(
  options: MigrationCheckOptions,
  environment: CliEnvironment,
): Promise<number> {
  const result = await runMigrationCheck({
    repoRoot: environment.cwd,
    documentPath: options.documentPath,
    manualRegistryPath: options.manualRegistryPath,
    typeProfilePath: options.typeProfilePath,
  });

  environment.stdout(formatMigrationCheckReport(result));

  return result.exitCode;
}

function parseArguments(argv: readonly string[]): CliOptions | "help" {
  if (argv.includes("--help") || argv.includes("-h")) {
    return "help";
  }

  const command =
    argv[0] === "derive" ||
    argv[0] === "validate" ||
    argv[0] === "derive-sidecar" ||
    argv[0] === "migration-check"
      ? argv[0]
      : "validate";
  const args = command === argv[0] ? argv.slice(1) : argv;

  if (command === "derive") {
    return parseDeriveArguments(args);
  }

  return command === "derive-sidecar"
    ? parseDeriveSidecarArguments(args)
    : command === "migration-check"
      ? parseMigrationCheckArguments(args)
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
  const { switches, values } = parseFlagValuesAndSwitches(
    args,
    ["--document", "--type-profile"],
    ["--check"],
  );
  const documentPath = values.get("--document");

  if (documentPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    command: "derive-sidecar",
    documentPath,
    typeProfilePath: values.get("--type-profile"),
    check: switches.has("--check"),
  };
}

function parseMigrationCheckArguments(args: readonly string[]): MigrationCheckOptions {
  const values = parseFlagValues(args, ["--document", "--manual-registry", "--type-profile"]);
  const documentPath = values.get("--document");
  const manualRegistryPath = values.get("--manual-registry");

  if (documentPath === undefined || manualRegistryPath === undefined) {
    throw new Error(USAGE);
  }

  return {
    command: "migration-check",
    documentPath,
    manualRegistryPath,
    typeProfilePath: values.get("--type-profile"),
  };
}

function parseFlagValues(
  args: readonly string[],
  allowedFlags: readonly string[],
): ReadonlyMap<string, string> {
  return parseFlagValuesAndSwitches(args, allowedFlags, []).values;
}

function parseFlagValuesAndSwitches(
  args: readonly string[],
  allowedFlags: readonly string[],
  allowedSwitches: readonly string[],
): {
  readonly values: ReadonlyMap<string, string>;
  readonly switches: ReadonlySet<string>;
} {
  const values = new Map<string, string>();
  const switches = new Set<string>();
  const allowed = new Set(allowedFlags);
  const switchFlags = new Set(allowedSwitches);

  for (let index = 0; index < args.length;) {
    const flag = args[index];

    if (flag === undefined) {
      throw new Error(`unknown argument ${flag ?? "argument"}`);
    }

    if (switchFlags.has(flag)) {
      switches.add(flag);
      index += 1;
      continue;
    }

    const isValueFlag = allowed.has(flag);

    if (!isValueFlag && switchFlags.size > 0) {
      throw new Error(`unknown argument ${flag}`);
    }

    const value = args[index + 1];

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for ${flag}`);
    }

    if (!isValueFlag) {
      throw new Error(`unknown argument ${flag}`);
    }

    values.set(flag, value);
    index += 2;
  }

  return { values, switches };
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

function formatMigrationCheckReport(result: MigrationCheckResult): string {
  const lines = [
    "# Migration Check Report",
    "",
    "Generated by: `markdown-trace migration-check`",
    "",
    "## Inputs",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Document | ${inlineCode(result.inputs.documentPath)} |`,
    `| Manual registry | ${inlineCode(result.inputs.manualRegistryPath)} |`,
    `| Generated sidecar | ${formatOptionalInlineCode(result.inputs.generatedSidecarPath)} |`,
    `| Type profile | ${formatOptionalInlineCode(result.inputs.typeProfilePath)} |`,
    `| Authority state | ${inlineCode(result.inputs.authorityState)} |`,
    "",
    "## Result",
    "",
    "| Field | Value |",
    "| --- | ---: |",
    `| Exit code | ${inlineCode(result.exitCode)} |`,
    `| Valid | ${inlineCode(result.valid)} |`,
    "",
    "## Steps",
    "",
    "| Step | Status | Exit code | Message | Diagnostics |",
    "| --- | --- | ---: | --- | --- |",
    ...result.steps.map(
      (step) =>
        `| ${inlineCode(step.step)} | ${inlineCode(step.status)} | ${inlineCode(
          step.exitCode,
        )} | ${escapeCell(step.message)} | ${formatDiagnostics(step.diagnostics)} |`,
    ),
  ];

  if (result.comparisonReport !== undefined) {
    lines.push("", formatMigrationComparisonReport(result.comparisonReport).trimEnd());
  }

  lines.push("");

  return lines.join("\n");
}

function formatOptionalInlineCode(value: string | undefined): string {
  return value === undefined ? inlineCode("<none>") : inlineCode(value);
}

function formatDiagnostics(diagnostics: readonly string[]): string {
  return diagnostics.length === 0
    ? inlineCode("<none>")
    : escapeCell(diagnostics.join("<br>"));
}

function formatGeneratedSidecarDriftDiagnostics(
  diagnostics: readonly GeneratedSidecarDriftDiagnostic[],
): string {
  return (
    diagnostics
      .map((diagnostic) =>
        [
          "Generated sidecar drift detected.",
          `category: ${diagnostic.category}`,
          `document: ${diagnostic.documentPath}`,
          `artifact: ${diagnostic.artifactRelativePath}`,
          `message: ${diagnostic.message}`,
        ].join("\n"),
      )
      .join("\n\n") + "\n"
  );
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

function inlineCode(value: string | number | boolean): string {
  return `\`${escapeCell(String(value)).replaceAll("`", "&#96;")}\``;
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
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
