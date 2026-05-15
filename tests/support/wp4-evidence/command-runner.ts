import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { main } from "../../../src/markdowntrace/cli.js";
import type { CommandRun } from "./model.js";
import { displayDocumentPath, displayRegistryPath, repoRoot } from "./paths.js";

export const validateCommand =
  "markdown-trace validate --registry fixtures/r0-document-local-registry/entity-registry.yaml --document fixtures/r0-document-local-registry/execution-spec.md";
export const deriveCommand =
  "markdown-trace derive --document fixtures/r0-document-local-registry/execution-spec.md --namespace exec";

export async function runValidateCommand(reportPath?: string): Promise<CommandRun> {
  return await runCli([
    "validate",
    "--registry",
    displayRegistryPath,
    "--document",
    displayDocumentPath,
    ...(reportPath === undefined ? [] : ["--report", reportPath]),
  ]);
}

export async function runDeriveCommand(outputPath?: string): Promise<CommandRun> {
  return await runCli([
    "derive",
    "--document",
    displayDocumentPath,
    "--namespace",
    "exec",
    ...(outputPath === undefined ? [] : ["--output", outputPath]),
  ]);
}

export async function withTemporaryDirectory<T>(
  prefix: string,
  callback: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(path.join(tmpdir(), prefix));

  try {
    return await callback(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export async function readOutput(pathname: string): Promise<string> {
  return await readFile(pathname, "utf8");
}

async function runCli(argv: string[]): Promise<CommandRun> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await main(argv, {
    cwd: repoRoot,
    stdout: (text) => stdout.push(text),
    stderr: (text) => stderr.push(text),
  });

  return {
    exitCode,
    stdout: stdout.join(""),
    stderr: stderr.join(""),
  };
}
