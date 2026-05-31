import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { main } from "../../../../src/markdowntrace/cli.js";
import type { CommandProbe, MatrixStatus } from "./model.js";
import {
  codefactoryDocumentPath,
  codefactoryGeneratedSidecarPath,
  codefactoryTypeProfilePath,
  malformedProfilePath,
  minimalDocumentPath,
  repoRoot,
} from "./paths.js";

export async function collectCodefactorySidecarCheck(): Promise<CommandProbe> {
  const temporaryRepo = await preparedTemporaryRepo([
    "package.json",
    codefactoryDocumentPath,
    codefactoryTypeProfilePath,
    codefactoryGeneratedSidecarPath,
  ]);
  const command = [
    "markdown-trace derive-sidecar",
    `--document ${codefactoryDocumentPath}`,
    `--type-profile ${codefactoryTypeProfilePath}`,
    "--check",
  ].join(" ");

  try {
    const run = await runCli(temporaryRepo, [
      "derive-sidecar",
      "--document",
      codefactoryDocumentPath,
      "--type-profile",
      codefactoryTypeProfilePath,
      "--check",
    ]);
    const expectedStdout = `${codefactoryGeneratedSidecarPath}\n`;

    return {
      command,
      ...run,
      status: statusFor(
        run.exitCode === 0 &&
          run.stdout === expectedStdout &&
          run.stderr === "",
      ),
    };
  } finally {
    await rm(temporaryRepo, { recursive: true, force: true });
  }
}

export async function collectMalformedProfileCheck(): Promise<CommandProbe> {
  const temporaryRepo = await preparedTemporaryRepo([
    "package.json",
    minimalDocumentPath,
  ]);
  const targetProfilePath = path.join(temporaryRepo, malformedProfilePath);
  const command = [
    "markdown-trace derive-sidecar",
    `--document ${minimalDocumentPath}`,
    `--type-profile ${malformedProfilePath}`,
    "--check",
  ].join(" ");

  try {
    await mkdir(path.dirname(targetProfilePath), { recursive: true });
    await writeFile(
      targetProfilePath,
      [
        "profileVersion: markdown-trace.type-profile.v0",
        "entityTypes:",
        "  work_package: {}",
        "",
      ].join("\n"),
      "utf8",
    );

    const run = await runCli(temporaryRepo, [
      "derive-sidecar",
      "--document",
      minimalDocumentPath,
      "--type-profile",
      malformedProfilePath,
      "--check",
    ]);

    return {
      command,
      ...run,
      status: statusFor(
        run.exitCode === 2 &&
          run.stdout === "" &&
          run.stderr.includes("Failure surface: profile_validation") &&
          run.stderr.includes(
            "profileVersion must be markdown-trace.type-profile.v1",
          ),
      ),
    };
  } finally {
    await rm(temporaryRepo, { recursive: true, force: true });
  }
}

interface CommandRun {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

async function runCli(
  cwd: string,
  args: readonly string[],
): Promise<CommandRun> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await main([...args], {
    cwd,
    stdout: (text) => stdout.push(text),
    stderr: (text) => stderr.push(text),
  });

  return {
    exitCode,
    stdout: stdout.join(""),
    stderr: stderr.join(""),
  };
}

async function preparedTemporaryRepo(
  relativePaths: readonly string[],
): Promise<string> {
  const temporaryRepo = await mkdtemp(
    path.join(os.tmpdir(), "markdown-trace-r3-4a-"),
  );

  for (const relativePath of relativePaths) {
    const targetPath = path.join(temporaryRepo, relativePath);

    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(path.join(repoRoot, relativePath), targetPath);
  }

  return temporaryRepo;
}

function statusFor(passed: boolean): MatrixStatus {
  return passed ? "PASS" : "FAIL";
}
