import { execFile } from "node:child_process";
import dns from "node:dns";
import { readdir } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import path from "node:path";
import tls from "node:tls";
import { promisify } from "node:util";

import {
  deriveCommand,
  readOutput,
  runDeriveCommand,
  runValidateCommand,
  validateCommand,
  withTemporaryDirectory,
} from "./command-runner.js";
import type {
  CommandRun,
  LocalSafetyCommandEvidence,
  LocalSafetyEvidence,
} from "./model.js";
import { repoRoot } from "./paths.js";
import { readValidationMetadata } from "./validation-metadata.js";

const execFileAsync = promisify(execFile);

type BaseCommandEvidence = Omit<
  LocalSafetyCommandEvidence,
  | "networkAttempts"
  | "approvedWrites"
  | "observedWrites"
  | "approvedWritesOnly"
  | "repositoryStatusChanged"
>;

export async function collectLocalSafetyReportEvidence(): Promise<LocalSafetyEvidence> {
  const metadata = await readValidationMetadata();

  return {
    ...metadata,
    commands: await collectLocalSafetyEvidence(),
  };
}

export async function collectLocalSafetyEvidence(): Promise<readonly LocalSafetyCommandEvidence[]> {
  return await withNetworkGuard(async (networkAttempts) => [
    await collectCommandSafety(
      networkAttempts,
      "valid-fixture-report.md",
      async (outputPath) =>
        commandEvidence(
          "sidecar validation",
          `${validateCommand} --report ${temporaryPathLabel("valid-fixture-report.md")}`,
          await runValidateCommand(outputPath),
        ),
    ),
    await collectCommandSafety(
      networkAttempts,
      "derived-registry-graph.yaml",
      async (outputPath) =>
        commandEvidence(
          "derived registry generation",
          `${deriveCommand} --output ${temporaryPathLabel("derived-registry-graph.yaml")}`,
          await runDeriveCommand(outputPath),
        ),
    ),
  ]);
}

async function collectCommandSafety(
  networkAttempts: { readonly count: number },
  expectedFilename: string,
  run: (outputPath: string) => Promise<BaseCommandEvidence>,
): Promise<LocalSafetyCommandEvidence> {
  return await withTemporaryDirectory("wp4-local-safety-", async (directory) => {
    const outputPath = path.join(directory, expectedFilename);
    const approvedWrites = [temporaryPathLabel(expectedFilename)];
    const beforeStatus = await gitStatus();
    const runEvidence = await run(outputPath);
    const observedWrites = await listTemporaryWrites(directory);
    const afterStatus = await gitStatus();

    await readOutput(outputPath);

    return {
      ...runEvidence,
      networkAttempts: networkAttempts.count,
      approvedWrites,
      observedWrites,
      approvedWritesOnly: arraysEqual(observedWrites, approvedWrites),
      repositoryStatusChanged: beforeStatus !== afterStatus,
    };
  });
}

function commandEvidence(
  pathName: string,
  command: string,
  run: CommandRun,
): BaseCommandEvidence {
  return {
    pathName,
    command,
    exitCode: run.exitCode,
    stderr: run.stderr,
  };
}

async function listTemporaryWrites(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const absolutePath = path.join(entry.parentPath, entry.name);
      const relativePath = path.relative(directory, absolutePath).split(path.sep).join("/");

      return temporaryPathLabel(relativePath);
    })
    .sort();
}

async function gitStatus(): Promise<string> {
  const { stdout } = await execFileAsync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: repoRoot,
  });

  return stdout;
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function withNetworkGuard<T>(
  callback: (networkAttempts: { count: number }) => Promise<T>,
): Promise<T> {
  const networkAttempts = { count: 0 };
  const originalFetch = globalThis.fetch;
  const originalNetConnect = net.connect;
  const originalNetCreateConnection = net.createConnection;
  const originalTlsConnect = tls.connect;
  const originalHttpRequest = http.request;
  const originalHttpGet = http.get;
  const originalHttpsRequest = https.request;
  const originalHttpsGet = https.get;
  const originalDnsLookup = dns.lookup;
  const originalDnsPromisesLookup = dns.promises.lookup;

  function blockedNetworkCall(): never {
    networkAttempts.count += 1;
    throw new Error("WP-4 local-safety guard blocked a network attempt");
  }

  try {
    globalThis.fetch = blockedNetworkCall as typeof fetch;
    net.connect = blockedNetworkCall as typeof net.connect;
    net.createConnection = blockedNetworkCall as typeof net.createConnection;
    tls.connect = blockedNetworkCall as typeof tls.connect;
    http.request = blockedNetworkCall as typeof http.request;
    http.get = blockedNetworkCall as typeof http.get;
    https.request = blockedNetworkCall as typeof https.request;
    https.get = blockedNetworkCall as typeof https.get;
    dns.lookup = blockedNetworkCall as unknown as typeof dns.lookup;
    dns.promises.lookup = blockedNetworkCall as unknown as typeof dns.promises.lookup;

    return await callback(networkAttempts);
  } finally {
    globalThis.fetch = originalFetch;
    net.connect = originalNetConnect;
    net.createConnection = originalNetCreateConnection;
    tls.connect = originalTlsConnect;
    http.request = originalHttpRequest;
    http.get = originalHttpGet;
    https.request = originalHttpsRequest;
    https.get = originalHttpsGet;
    dns.lookup = originalDnsLookup;
    dns.promises.lookup = originalDnsPromisesLookup;
  }
}

function temporaryPathLabel(filename: string): string {
  return `<tempdir>/${filename}`;
}
