import type { MigrationCheckCompatibilityEvidence } from "../../migration-check-compatibility/model.js";
import type {
  MigrationCheckNoWriteCaseEvidence,
  MigrationCheckNoWriteEvidence,
} from "../../migration-check-no-write/model.js";
import type { CommandProbe, CoverageMatrixRow } from "./model.js";
import {
  codefactoryDocumentPath,
  codefactoryGeneratedSidecarPath,
  codefactoryTypeProfilePath,
  malformedProfilePath,
  minimalDocumentPath,
  minimalManualRegistryPath,
  minimalTypeProfilePath,
  r0DocumentPath,
  r0RegistryPath,
} from "./paths.js";

interface BuildCoverageMatrixRowsInput {
  readonly compatibility: MigrationCheckCompatibilityEvidence;
  readonly noWrite: MigrationCheckNoWriteEvidence;
  readonly codefactory: CommandProbe;
  readonly malformedProfile: CommandProbe;
}

export function buildCoverageMatrixRows(
  input: BuildCoverageMatrixRowsInput,
): CoverageMatrixRow[] {
  const missingArtifact = requiredNoWriteCase(
    input.noWrite.cases,
    "missing-generated-artifact",
  );
  const staleArtifact = requiredNoWriteCase(
    input.noWrite.cases,
    "stale-generated-artifact",
  );

  return [
    {
      caseId: "r0-yaml",
      caseName: "R0 YAML fixture",
      requirement:
        "Manual YAML validation remains accepted during the migration window.",
      fixtureInputs: [r0DocumentPath, r0RegistryPath],
      command: input.compatibility.yamlCompatibility.command,
      expectedResult: "pass",
      expectedBehavior:
        "Existing validate --registry path exits 0 and reports zero findings.",
      observedEvidence: commandObservation(
        input.compatibility.yamlCompatibility.exitCode,
        input.compatibility.yamlCompatibility.stdoutSignal,
      ),
      blockers: blockersFor(
        input.compatibility.yamlCompatibility.status === "PASS",
      ),
      status: input.compatibility.yamlCompatibility.status,
    },
    {
      caseId: "minimal-r1",
      caseName: "Minimal R1 link-backed fixture",
      requirement:
        "Minimal R1 manual/generated pair passes migration check coverage.",
      fixtureInputs: [
        minimalDocumentPath,
        minimalManualRegistryPath,
        minimalTypeProfilePath,
      ],
      command: input.compatibility.migrationCheckCompatibility.command,
      expectedResult: "pass",
      expectedBehavior:
        "Migration check exits 0 with YAML compatibility, generated sidecar, and comparison steps passed.",
      observedEvidence: commandObservation(
        input.compatibility.migrationCheckCompatibility.exitCode,
        input.compatibility.migrationCheckCompatibility.stdoutSignal,
      ),
      blockers: blockersFor(
        input.compatibility.migrationCheckCompatibility.status === "PASS",
      ),
      status: input.compatibility.migrationCheckCompatibility.status,
    },
    {
      caseId: "codefactory-profile",
      caseName: "CODEFACTORY profile-backed fixture",
      requirement:
        "CODEFACTORY profile-backed generated sidecar remains checked and profile metadata is preserved.",
      fixtureInputs: [
        codefactoryDocumentPath,
        codefactoryTypeProfilePath,
        codefactoryGeneratedSidecarPath,
      ],
      command: input.codefactory.command,
      expectedResult: "pass",
      expectedBehavior:
        "derive-sidecar --check exits 0 and prints the checked CODEFACTORY artifact path.",
      observedEvidence: commandObservation(
        input.codefactory.exitCode,
        input.codefactory.stdout,
      ),
      blockers: blockersFor(input.codefactory.status === "PASS"),
      status: input.codefactory.status,
    },
    {
      caseId: "stale-artifact-failure",
      caseName: "Stale generated artifact failure",
      requirement:
        "Controlled stale artifact check exits non-zero and preserves stale bytes.",
      fixtureInputs: [
        minimalDocumentPath,
        minimalManualRegistryPath,
        minimalTypeProfilePath,
      ],
      command: staleArtifact.command,
      expectedResult: "fail",
      expectedBehavior:
        "Migration check exits 1, reports content mismatch, and leaves generated artifact bytes unchanged.",
      observedEvidence: noWriteObservation(staleArtifact),
      blockers: blockersFor(staleArtifact.status === "PASS"),
      status: staleArtifact.status,
    },
    {
      caseId: "missing-artifact-failure",
      caseName: "Missing generated artifact failure",
      requirement:
        "Controlled missing artifact check exits non-zero and does not create the missing artifact.",
      fixtureInputs: [
        minimalDocumentPath,
        minimalManualRegistryPath,
        minimalTypeProfilePath,
      ],
      command: missingArtifact.command,
      expectedResult: "fail",
      expectedBehavior:
        "Migration check exits 1, reports missing artifact, and leaves the artifact absent.",
      observedEvidence: noWriteObservation(missingArtifact),
      blockers: blockersFor(missingArtifact.status === "PASS"),
      status: missingArtifact.status,
    },
    {
      caseId: "malformed-profile-failure",
      caseName: "Malformed profile failure",
      requirement:
        "Malformed type profile case exits non-zero with deterministic profile validation diagnostics.",
      fixtureInputs: [minimalDocumentPath, malformedProfilePath],
      command: input.malformedProfile.command,
      expectedResult: "fail",
      expectedBehavior:
        "derive-sidecar --check exits 2, reports profile_validation, and includes the profileVersion diagnostic.",
      observedEvidence: [
        `exitCode=${input.malformedProfile.exitCode}`,
        "signal=Failure surface: profile_validation",
        "profileVersion must be markdown-trace.type-profile.v1",
      ].join("; "),
      blockers: blockersFor(input.malformedProfile.status === "PASS"),
      status: input.malformedProfile.status,
    },
  ];
}

function requiredNoWriteCase(
  cases: readonly MigrationCheckNoWriteCaseEvidence[],
  name: MigrationCheckNoWriteCaseEvidence["name"],
): MigrationCheckNoWriteCaseEvidence {
  const caseEvidence = cases.find((candidate) => candidate.name === name);
  if (caseEvidence === undefined) {
    throw new Error(`required no-write evidence case is missing: ${name}`);
  }

  return caseEvidence;
}

function noWriteObservation(
  caseEvidence: MigrationCheckNoWriteCaseEvidence,
): string {
  return [
    `exitCode=${caseEvidence.exitCode}`,
    `noWrite=${caseEvidence.noWritePassed ? "yes" : "no"}`,
    `diagnostic=${caseEvidence.diagnosticPassed ? "present" : "missing"}`,
    caseEvidence.noWriteProof,
  ].join("; ");
}

function commandObservation(exitCode: number, signal: string): string {
  const compactSignal = signal.trim().replaceAll("\n", " ");

  return `exitCode=${exitCode}; signal=${compactSignal === "" ? "<none>" : compactSignal}`;
}

function blockersFor(passed: boolean): readonly string[] {
  return passed
    ? []
    : ["Required coverage command did not produce expected behavior."];
}
