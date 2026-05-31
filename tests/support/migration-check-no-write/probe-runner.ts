import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { main } from "../../../src/markdowntrace/cli.js";
import type { ArtifactSnapshot } from "./model.js";
import {
  documentPath,
  generatedSidecarPath,
  manualRegistryPath,
  repoRoot,
  typeProfilePath,
} from "./paths.js";

export interface TemporaryRepo {
  readonly path: string;
  readonly artifactPath: string;
  readonly registryPath: string;
  readonly remove: () => Promise<void>;
}

export interface CommandRun {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export async function preparedTemporaryRepo(
  extraFiles: readonly string[],
): Promise<TemporaryRepo> {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-migration-"));
  const files = ["package.json", documentPath, typeProfilePath, ...extraFiles];

  for (const file of files) {
    await copyRepoFile(temporaryRoot, file);
  }

  return {
    path: temporaryRoot,
    artifactPath: path.join(temporaryRoot, generatedSidecarPath),
    registryPath: path.join(temporaryRoot, manualRegistryPath),
    remove: async () => {
      await rm(temporaryRoot, { force: true, recursive: true });
    },
  };
}

export async function runMigrationCheckCommand(cwd: string): Promise<CommandRun> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = await main(
    [
      "migration-check",
      "--document",
      documentPath,
      "--manual-registry",
      manualRegistryPath,
      "--type-profile",
      typeProfilePath,
    ],
    {
      cwd,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
    },
  );

  return {
    exitCode,
    stdout: stdout.join(""),
    stderr: stderr.join(""),
  };
}

export async function snapshotArtifact(artifactPath: string): Promise<ArtifactSnapshot> {
  try {
    await access(artifactPath);
  } catch (error) {
    if (isMissingFileError(error)) {
      return { state: "missing" };
    }

    throw error;
  }

  const content = await readFile(artifactPath);

  return {
    state: "present",
    sha256: createHash("sha256").update(content).digest("hex"),
    sizeBytes: content.byteLength,
  };
}

export function snapshotsMatch(left: ArtifactSnapshot, right: ArtifactSnapshot): boolean {
  return (
    left.state === right.state &&
    left.sha256 === right.sha256 &&
    left.sizeBytes === right.sizeBytes
  );
}

async function copyRepoFile(temporaryRoot: string, relativePath: string): Promise<void> {
  const targetPath = path.join(temporaryRoot, relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(path.join(repoRoot, relativePath), targetPath);
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
