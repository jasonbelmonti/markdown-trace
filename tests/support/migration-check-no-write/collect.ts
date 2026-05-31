import { readFile, writeFile } from "node:fs/promises";

import type {
  ArtifactSnapshot,
  MigrationCheckNoWriteCaseEvidence,
  MigrationCheckNoWriteCaseName,
  MigrationCheckNoWriteEvidence,
  ProbeStatus,
} from "./model.js";
import {
  preparedTemporaryRepo,
  runMigrationCheckCommand,
  snapshotArtifact,
  snapshotsMatch,
  type CommandRun,
} from "./probe-runner.js";
import {
  generatedSidecarPath,
  manualRegistryPath,
  migrationCheckCommand,
} from "./paths.js";

const staleGeneratedArtifactBytes = "# stale generated artifact\n";

export async function collectMigrationCheckNoWriteEvidence(): Promise<MigrationCheckNoWriteEvidence> {
  return {
    evidenceId: "R3-EVD-3",
    validationCheckpoint: "VAL-3",
    workPackage: "R3-3B",
    issue: "BEL-1237",
    cases: [
      await collectMissingArtifactCase(),
      await collectStaleArtifactCase(),
      await collectUnexplainedDriftCase(),
    ],
  };
}

async function collectMissingArtifactCase(): Promise<MigrationCheckNoWriteCaseEvidence> {
  const temporaryRepo = await preparedTemporaryRepo([manualRegistryPath]);

  try {
    const artifactBefore = await snapshotArtifact(temporaryRepo.artifactPath);
    const run = await runMigrationCheckCommand(temporaryRepo.path);
    const artifactAfter = await snapshotArtifact(temporaryRepo.artifactPath);

    return buildCaseEvidence({
      name: "missing-generated-artifact",
      run,
      artifactBefore,
      artifactAfter,
      expectedDiagnostics: [
        "checked generated sidecar artifact is missing",
        generatedSidecarPath,
        "minimal-link-backed-execution-spec.md",
      ],
      noWritePassed: artifactBefore.state === "missing" && artifactAfter.state === "missing",
      noWriteProof: "artifact absent before and after command",
    });
  } finally {
    await temporaryRepo.remove();
  }
}

async function collectStaleArtifactCase(): Promise<MigrationCheckNoWriteCaseEvidence> {
  const temporaryRepo = await preparedTemporaryRepo([manualRegistryPath, generatedSidecarPath]);

  try {
    await writeFile(temporaryRepo.artifactPath, staleGeneratedArtifactBytes, "utf8");
    const artifactBefore = await snapshotArtifact(temporaryRepo.artifactPath);
    const run = await runMigrationCheckCommand(temporaryRepo.path);
    const artifactAfter = await snapshotArtifact(temporaryRepo.artifactPath);
    const noWritePassed = snapshotsMatch(artifactBefore, artifactAfter);

    return buildCaseEvidence({
      name: "stale-generated-artifact",
      run,
      artifactBefore,
      artifactAfter,
      expectedDiagnostics: [
        "checked generated sidecar artifact content differs from freshly derived output",
        generatedSidecarPath,
        "minimal-link-backed-execution-spec.md",
      ],
      noWritePassed,
      noWriteProof:
        artifactBefore.state === "present" && artifactBefore.sha256 !== undefined
          ? `sha256 unchanged at ${artifactBefore.sha256} and size unchanged at ${artifactBefore.sizeBytes} bytes`
          : "artifact snapshot unavailable",
    });
  } finally {
    await temporaryRepo.remove();
  }
}

async function collectUnexplainedDriftCase(): Promise<MigrationCheckNoWriteCaseEvidence> {
  const temporaryRepo = await preparedTemporaryRepo([manualRegistryPath, generatedSidecarPath]);

  try {
    const driftedRegistry = (await readFile(temporaryRepo.registryPath, "utf8")).replace(
      "title: Minimal R1 Link-Backed Fixture",
      "title: Drifted Manual Fixture",
    );
    await writeFile(temporaryRepo.registryPath, driftedRegistry, "utf8");

    const artifactBefore = await snapshotArtifact(temporaryRepo.artifactPath);
    const run = await runMigrationCheckCommand(temporaryRepo.path);
    const artifactAfter = await snapshotArtifact(temporaryRepo.artifactPath);
    const noWritePassed = snapshotsMatch(artifactBefore, artifactAfter);

    return buildCaseEvidence({
      name: "unexplained-drift",
      run,
      artifactBefore,
      artifactAfter,
      expectedDiagnostics: [
        "Migration comparison reported blocking drift.",
        "document.title",
        "Drifted Manual Fixture",
        "Minimal R1 Link-Backed Fixture",
      ],
      noWritePassed,
      noWriteProof:
        artifactBefore.state === "present" && artifactBefore.sha256 !== undefined
          ? `generated artifact sha256 unchanged at ${artifactBefore.sha256} and size unchanged at ${artifactBefore.sizeBytes} bytes`
          : "artifact snapshot unavailable",
    });
  } finally {
    await temporaryRepo.remove();
  }
}

function buildCaseEvidence(input: {
  readonly name: MigrationCheckNoWriteCaseName;
  readonly run: CommandRun;
  readonly artifactBefore: ArtifactSnapshot;
  readonly artifactAfter: ArtifactSnapshot;
  readonly expectedDiagnostics: readonly string[];
  readonly noWritePassed: boolean;
  readonly noWriteProof: string;
}): MigrationCheckNoWriteCaseEvidence {
  const diagnosticPassed = input.expectedDiagnostics.every((diagnostic) =>
    input.run.stdout.includes(diagnostic),
  );
  const status: ProbeStatus =
    input.run.exitCode === 1 &&
    input.run.stderr === "" &&
    input.noWritePassed &&
    diagnosticPassed
      ? "PASS"
      : "FAIL";

  return {
    name: input.name,
    command: migrationCheckCommand,
    exitCode: input.run.exitCode,
    stderr: input.run.stderr,
    artifactBefore: input.artifactBefore,
    artifactAfter: input.artifactAfter,
    noWriteProof: input.noWriteProof,
    noWritePassed: input.noWritePassed,
    diagnosticExcerpt: diagnosticPassed
      ? excerptDiagnosticLines(input.run.stdout, input.expectedDiagnostics)
      : "<missing diagnostic>",
    diagnosticPassed,
    status,
  };
}

function excerptDiagnosticLines(stdout: string, diagnostics: readonly string[]): string {
  const lines = stdout
    .split("\n")
    .filter((line) => diagnostics.some((diagnostic) => line.includes(diagnostic)))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return [...new Set(lines)].join(" ");
}
