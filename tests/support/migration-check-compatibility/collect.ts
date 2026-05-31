import { createHash } from "node:crypto";
import { access, copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { main } from "../../../src/markdowntrace/cli.js";
import type {
  ArtifactSnapshot,
  ByteStabilityProbeEvidence,
  CommandProbeEvidence,
  CompatibilityProbeStatus,
  MigrationCheckCompatibilityEvidence,
} from "./model.js";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

export const evidencePath = path.join(
  repoRoot,
  "docs/evidence/r3-yaml-compatibility-and-sidecar-byte-stability.md",
);

const r0DocumentPath = "fixtures/r0-document-local-registry/execution-spec.md";
const r0RegistryPath = "fixtures/r0-document-local-registry/entity-registry.yaml";
const fixtureDirectory = "fixtures/r1-link-backed-entity-syntax";
const r1DocumentPath = `${fixtureDirectory}/minimal-link-backed-execution-spec.md`;
const manualRegistryPath = `${fixtureDirectory}/minimal-link-backed-manual-registry.yaml`;
const typeProfilePath = `${fixtureDirectory}/minimal-type-profile.yaml`;
const generatedSidecarPath =
  `${fixtureDirectory}/.markdown-trace/generated/minimal-link-backed-execution-spec--profile-minimal-type-profile-378211c9.entity-registry.yaml`;

export async function collectMigrationCheckCompatibilityEvidence(): Promise<MigrationCheckCompatibilityEvidence> {
  return {
    evidenceIds: ["R3-EVD-4", "R3-EVD-5"],
    validationCheckpoints: ["VAL-4", "VAL-5"],
    workPackage: "R3-3C",
    issue: "BEL-1238",
    yamlCompatibility: await collectYamlCompatibility(),
    migrationCheckCompatibility: await collectMigrationCheckCompatibility(),
    sidecarByteStability: await collectSidecarByteStability(),
  };
}

async function collectYamlCompatibility(): Promise<CommandProbeEvidence> {
  const command = [
    "markdown-trace validate",
    `--registry ${r0RegistryPath}`,
    `--document ${r0DocumentPath}`,
  ].join(" ");
  const run = await runCli(repoRoot, [
    "validate",
    "--registry",
    r0RegistryPath,
    "--document",
    r0DocumentPath,
  ]);
  const expectedSignals = [
    "| Exit code | `0` |",
    "| Status | `PASS` |",
    "| Findings | `0` |",
  ];
  const signalPassed = expectedSignals.every((signal) => run.stdout.includes(signal));

  return {
    name: "r0-yaml-validate-registry",
    evidenceId: "R3-EVD-4",
    validationCheckpoint: "VAL-4",
    claim: "Existing R0 YAML validate --registry path remains accepted with zero findings.",
    command,
    exitCode: run.exitCode,
    stdoutSignal: excerptSignalLines(run.stdout, expectedSignals),
    stderr: run.stderr,
    status: statusFor(run.exitCode === 0 && run.stderr === "" && signalPassed),
  };
}

async function collectMigrationCheckCompatibility(): Promise<CommandProbeEvidence> {
  const command = migrationCheckCommand();
  const run = await runCli(repoRoot, [
    "migration-check",
    "--document",
    r1DocumentPath,
    "--manual-registry",
    manualRegistryPath,
    "--type-profile",
    typeProfilePath,
  ]);
  const expectedSignals = [
    "| Valid | `true` |",
    "| `yaml-compatibility` | `passed` | `0` |",
    "| `generated-sidecar` | `passed` | `0` |",
    "| `comparison` | `passed` | `0` |",
  ];
  const signalPassed = expectedSignals.every((signal) => run.stdout.includes(signal));

  return {
    name: "minimal-r1-migration-check",
    evidenceId: "R3-EVD-5",
    validationCheckpoint: "VAL-5",
    claim:
      "Migration check integration still passes YAML compatibility, generated sidecar, and comparison steps for the minimal R1 pair.",
    command,
    exitCode: run.exitCode,
    stdoutSignal: excerptSignalLines(run.stdout, expectedSignals),
    stderr: run.stderr,
    status: statusFor(run.exitCode === 0 && run.stderr === "" && signalPassed),
  };
}

async function collectSidecarByteStability(): Promise<ByteStabilityProbeEvidence> {
  const temporaryRepo = await preparedTemporaryRepo();

  try {
    const artifactPath = path.join(temporaryRepo, generatedSidecarPath);
    const artifactBefore = await snapshotArtifact(artifactPath);
    const command = deriveSidecarCheckCommand();
    const run = await runCli(temporaryRepo, [
      "derive-sidecar",
      "--document",
      r1DocumentPath,
      "--type-profile",
      typeProfilePath,
      "--check",
    ]);
    const artifactAfter = await snapshotArtifact(artifactPath);
    const bytesStable = snapshotsMatch(artifactBefore, artifactAfter);
    const expectedStdout = `${generatedSidecarPath}\n`;

    return {
      name: "minimal-r1-generated-sidecar-check-byte-stability",
      evidenceId: "R3-EVD-5",
      validationCheckpoint: "VAL-5",
      claim: "Generated sidecar check mode exits zero and leaves checked artifact bytes unchanged.",
      command,
      exitCode: run.exitCode,
      stdoutSignal: run.stdout.trim(),
      stderr: run.stderr,
      status: statusFor(
        run.exitCode === 0 &&
          run.stdout === expectedStdout &&
          run.stderr === "" &&
          bytesStable,
      ),
      artifactPath: generatedSidecarPath,
      artifactBefore,
      artifactAfter,
      bytesStable,
      byteStabilityProof: byteStabilityProof(artifactBefore, artifactAfter),
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

async function runCli(cwd: string, args: readonly string[]): Promise<CommandRun> {
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

async function preparedTemporaryRepo(): Promise<string> {
  const temporaryRepo = await mkdtemp(path.join(os.tmpdir(), "markdown-trace-r3-3c-"));

  for (const relativePath of [
    "package.json",
    r1DocumentPath,
    manualRegistryPath,
    typeProfilePath,
    generatedSidecarPath,
  ]) {
    await copyRepoFile(temporaryRepo, relativePath);
  }

  return temporaryRepo;
}

async function copyRepoFile(temporaryRepo: string, relativePath: string): Promise<void> {
  const targetPath = path.join(temporaryRepo, relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(path.join(repoRoot, relativePath), targetPath);
}

async function snapshotArtifact(artifactPath: string): Promise<ArtifactSnapshot> {
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

function snapshotsMatch(left: ArtifactSnapshot, right: ArtifactSnapshot): boolean {
  return (
    left.state === right.state &&
    left.sha256 === right.sha256 &&
    left.sizeBytes === right.sizeBytes
  );
}

function byteStabilityProof(
  before: ArtifactSnapshot,
  after: ArtifactSnapshot,
): string {
  if (!snapshotsMatch(before, after)) {
    return "artifact bytes changed during check mode";
  }

  if (before.state === "missing") {
    return "artifact missing before and after check mode";
  }

  return `sha256 unchanged at ${before.sha256} and size unchanged at ${before.sizeBytes} bytes`;
}

function excerptSignalLines(stdout: string, signals: readonly string[]): string {
  const lines = stdout
    .split("\n")
    .filter((line) => signals.some((signal) => line.includes(signal)))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return [...new Set(lines)].join(" ");
}

function migrationCheckCommand(): string {
  return [
    "markdown-trace migration-check",
    `--document ${r1DocumentPath}`,
    `--manual-registry ${manualRegistryPath}`,
    `--type-profile ${typeProfilePath}`,
  ].join(" ");
}

function deriveSidecarCheckCommand(): string {
  return [
    "markdown-trace derive-sidecar",
    `--document ${r1DocumentPath}`,
    `--type-profile ${typeProfilePath}`,
    "--check",
  ].join(" ");
}

function statusFor(passed: boolean): CompatibilityProbeStatus {
  return passed ? "PASS" : "FAIL";
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
