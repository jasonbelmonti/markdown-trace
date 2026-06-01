import type {
  MigrationCheckNoWriteCaseEvidence,
  MigrationCheckNoWriteEvidence,
} from "../../migration-check-no-write/model.js";
import type { CommandProbe, NegativeProbeEvidence } from "./model.js";

export function buildNegativeProbeEvidence(input: {
  readonly noWrite: MigrationCheckNoWriteEvidence;
  readonly malformedProfile: CommandProbe;
}): NegativeProbeEvidence[] {
  const staleArtifact = requiredNoWriteCase(
    input.noWrite.cases,
    "stale-generated-artifact",
  );
  const missingArtifact = requiredNoWriteCase(
    input.noWrite.cases,
    "missing-generated-artifact",
  );

  return [
    {
      caseId: "stale-artifact-failure",
      probeName: "Stale generated artifact",
      failureSurface: "generated-sidecar content mismatch",
      exitCode: staleArtifact.exitCode,
      deterministicSignal:
        "checked generated sidecar artifact content differs from freshly derived output",
      preservationEvidence: staleArtifact.noWriteProof,
      status: staleArtifact.status,
    },
    {
      caseId: "missing-artifact-failure",
      probeName: "Missing generated artifact",
      failureSurface: "generated-sidecar missing artifact",
      exitCode: missingArtifact.exitCode,
      deterministicSignal: "checked generated sidecar artifact is missing",
      preservationEvidence: missingArtifact.noWriteProof,
      status: missingArtifact.status,
    },
    {
      caseId: "malformed-profile-failure",
      probeName: "Malformed type profile",
      failureSurface: "profile_validation",
      exitCode: input.malformedProfile.exitCode,
      deterministicSignal: malformedProfileSignal(input.malformedProfile),
      preservationEvidence:
        "controlled temporary profile input; no generated artifact path is written",
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

function malformedProfileSignal(probe: CommandProbe): string {
  const hasFailureSurface = probe.stderr.includes(
    "Failure surface: profile_validation",
  );
  const hasProfileVersionDiagnostic = probe.stderr.includes(
    "profileVersion must be markdown-trace.type-profile.v1",
  );

  return [
    hasFailureSurface ? "Failure surface: profile_validation" : "",
    hasProfileVersionDiagnostic
      ? "profileVersion must be markdown-trace.type-profile.v1"
      : "",
  ]
    .filter((part) => part.length > 0)
    .join(" ");
}
