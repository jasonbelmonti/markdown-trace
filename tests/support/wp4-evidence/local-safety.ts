import { execFile } from "node:child_process";
import dns from "node:dns";
import type { Dirent } from "node:fs";
import * as fsPromises from "node:fs/promises";
import { readdir } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { tmpdir } from "node:os";
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
  | "unapprovedWrites"
  | "approvedWritesOnly"
  | "repositoryStatusChanged"
>;

type FileSnapshot = readonly [string, string];
type WriteSurfaceSnapshot = ReadonlyMap<string, string>;

export interface LocalSafetyCommandInput {
  readonly pathName: string;
  readonly command: string;
  readonly expectedFilename: string;
  readonly run: (outputPath: string) => Promise<CommandRun>;
}

export async function collectLocalSafetyReportEvidence(): Promise<LocalSafetyEvidence> {
  const metadata = await readValidationMetadata();

  return {
    ...metadata,
    commands: await collectLocalSafetyEvidence(),
  };
}

export async function collectLocalSafetyEvidence(): Promise<readonly LocalSafetyCommandEvidence[]> {
  return await collectLocalSafetyForCommands([
    {
      pathName: "sidecar validation",
      command: `${validateCommand} --report ${temporaryPathLabel("valid-fixture-report.md")}`,
      expectedFilename: "valid-fixture-report.md",
      run: runValidateCommand,
    },
    {
      pathName: "derived registry generation",
      command: `${deriveCommand} --output ${temporaryPathLabel("derived-registry-graph.yaml")}`,
      expectedFilename: "derived-registry-graph.yaml",
      run: runDeriveCommand,
    },
  ]);
}

export async function collectLocalSafetyForCommand(
  input: LocalSafetyCommandInput,
): Promise<LocalSafetyCommandEvidence> {
  const [evidence] = await collectLocalSafetyForCommands([input]);

  if (evidence === undefined) {
    throw new Error("local-safety command collection returned no evidence");
  }

  return evidence;
}

export async function collectLocalSafetyForCommands(
  inputs: readonly LocalSafetyCommandInput[],
): Promise<readonly LocalSafetyCommandEvidence[]> {
  return await withNetworkGuard(
    async (networkAttempts) => {
      const evidence: LocalSafetyCommandEvidence[] = [];

      for (const input of inputs) {
        evidence.push(await collectCommandSafety(networkAttempts, input));
      }

      return evidence;
    },
  );
}

async function collectCommandSafety(
  networkAttempts: { readonly count: number },
  input: LocalSafetyCommandInput,
): Promise<LocalSafetyCommandEvidence> {
  return await withTemporaryDirectory("wp4-local-safety-", async (directory) => {
    const expectedFilename = input.expectedFilename;
    const outputPath = path.join(directory, expectedFilename);
    const approvedWrites = [temporaryPathLabel(expectedFilename)];
    const approvedAbsoluteWrites = [outputPath];
    const beforeStatus = await gitStatus();
    const {
      evidence,
      networkAttempts: commandNetworkAttempts,
      unapprovedWrites,
    } = await withTemporaryDirectory(
      "wp4-local-safety-watch-",
      async (watchDirectory) => {
        const watchRoots = await prepareWatchRoots(watchDirectory);
        const beforeWriteSurface = await snapshotWriteSurface(watchRoots.roots);

        return await withProcessEnvironment(watchRoots.environment, async () => {
          const beforeNetworkAttempts = networkAttempts.count;
          const runEvidence = await input.run(outputPath);
          const commandNetworkAttempts = networkAttempts.count - beforeNetworkAttempts;
          const afterWriteSurface = await snapshotWriteSurface(watchRoots.roots);

          return {
            evidence: commandEvidence(input, runEvidence),
            networkAttempts: commandNetworkAttempts,
            unapprovedWrites: diffWriteSurface(
              beforeWriteSurface,
              afterWriteSurface,
              approvedAbsoluteWrites,
            ),
          };
        });
      },
    );
    const observedWrites = await listTemporaryWrites(directory);
    const afterStatus = await gitStatus();

    await readOutput(outputPath);

    return {
      ...evidence,
      networkAttempts: commandNetworkAttempts,
      approvedWrites,
      observedWrites,
      unapprovedWrites,
      approvedWritesOnly:
        arraysEqual(observedWrites, approvedWrites) && unapprovedWrites.length === 0,
      repositoryStatusChanged: beforeStatus !== afterStatus,
    };
  });
}

function commandEvidence(
  input: LocalSafetyCommandInput,
  run: CommandRun,
): BaseCommandEvidence {
  return {
    pathName: input.pathName,
    command: input.command,
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

async function prepareWatchRoots(watchDirectory: string): Promise<{
  readonly roots: readonly string[];
  readonly environment: Readonly<Record<string, string>>;
}> {
  const home = path.join(watchDirectory, "home");
  const temp = path.join(watchDirectory, "tmp");
  const cache = path.join(watchDirectory, "cache");

  await Promise.all([
    fsPromises.mkdir(home, { recursive: true }),
    fsPromises.mkdir(temp, { recursive: true }),
    fsPromises.mkdir(cache, { recursive: true }),
  ]);

  return {
    roots: [tmpdir(), home, temp, cache],
    environment: {
      HOME: home,
      TMPDIR: temp,
      XDG_CACHE_HOME: cache,
      npm_config_cache: path.join(cache, "npm"),
    },
  };
}

async function snapshotWriteSurface(roots: readonly string[]): Promise<WriteSurfaceSnapshot> {
  const entries = await Promise.all(roots.map(snapshotRoot));

  return new Map(entries.flat());
}

async function snapshotRoot(root: string): Promise<readonly FileSnapshot[]> {
  const snapshots: FileSnapshot[] = [];
  await collectSnapshots(root, snapshots);

  return snapshots;
}

async function collectSnapshots(directory: string, snapshots: FileSnapshot[]): Promise<void> {
  let entries: Dirent[];

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isIgnoredSnapshotError(error)) {
      return;
    }

    throw error;
  }

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await collectSnapshots(absolutePath, snapshots);
      continue;
    }

    if (entry.isFile()) {
      const snapshot = await snapshotFile(absolutePath);

      if (snapshot !== undefined) {
        snapshots.push(snapshot);
      }
    }
  }
}

async function snapshotFile(
  absolutePath: string,
): Promise<FileSnapshot | undefined> {
  try {
    const stats = await fsPromises.stat(absolutePath);

    return [absolutePath, `${stats.size}:${stats.mtimeMs}`] as const;
  } catch (error) {
    if (isIgnoredSnapshotError(error)) {
      return undefined;
    }

    throw error;
  }
}

function isIgnoredSnapshotError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "EPERM" || error.code === "EACCES")
  );
}

function diffWriteSurface(
  before: WriteSurfaceSnapshot,
  after: WriteSurfaceSnapshot,
  approvedAbsoluteWrites: readonly string[],
): readonly string[] {
  return uniqueSorted(
    [...after.entries()].flatMap(([absolutePath, signature]) =>
      before.get(absolutePath) === signature ||
      isApprovedWritePath(absolutePath, approvedAbsoluteWrites)
        ? []
        : [displayLocalPath(absolutePath)],
    ),
  );
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

async function withProcessEnvironment<T>(
  values: Readonly<Record<string, string>>,
  callback: () => Promise<T>,
): Promise<T> {
  const originalValues = new Map(
    Object.keys(values).map((key) => [key, process.env[key]] as const),
  );

  try {
    Object.assign(process.env, values);
    return await callback();
  } finally {
    for (const [key, value] of originalValues) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function isApprovedWritePath(
  absolutePath: string,
  approvedAbsoluteWrites: readonly string[],
): boolean {
  return approvedAbsoluteWrites.some((approvedPath) => {
    const absoluteApprovedPath = path.resolve(approvedPath);

    return (
      absolutePath === absoluteApprovedPath ||
      absolutePath === path.dirname(absoluteApprovedPath)
    );
  });
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
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

function displayLocalPath(absolutePath: string): string {
  const relativeRepoPath = path.relative(repoRoot, absolutePath);

  if (!relativeRepoPath.startsWith("..") && !path.isAbsolute(relativeRepoPath)) {
    return `<repo>/${relativeRepoPath.split(path.sep).join("/")}`;
  }

  const relativeTempPath = path.relative(tmpdir(), absolutePath);

  if (!relativeTempPath.startsWith("..") && !path.isAbsolute(relativeTempPath)) {
    return `<tmp>/${relativeTempPath.split(path.sep).join("/")}`;
  }

  return absolutePath.split(path.sep).join("/");
}
