export type CompatibilityProbeStatus = "PASS" | "FAIL";

export interface CommandProbeEvidence {
  readonly name: string;
  readonly evidenceId: "R3-EVD-4" | "R3-EVD-5";
  readonly validationCheckpoint: "VAL-4" | "VAL-5";
  readonly claim: string;
  readonly command: string;
  readonly exitCode: number;
  readonly stdoutSignal: string;
  readonly stderr: string;
  readonly status: CompatibilityProbeStatus;
}

export type ArtifactState = "missing" | "present";

export interface ArtifactSnapshot {
  readonly state: ArtifactState;
  readonly sha256?: string;
  readonly sizeBytes?: number;
}

export interface ByteStabilityProbeEvidence extends CommandProbeEvidence {
  readonly artifactPath: string;
  readonly artifactBefore: ArtifactSnapshot;
  readonly artifactAfter: ArtifactSnapshot;
  readonly bytesStable: boolean;
  readonly byteStabilityProof: string;
}

export interface MigrationCheckCompatibilityEvidence {
  readonly evidenceIds: readonly ["R3-EVD-4", "R3-EVD-5"];
  readonly validationCheckpoints: readonly ["VAL-4", "VAL-5"];
  readonly workPackage: "R3-3C";
  readonly issue: "BEL-1238";
  readonly yamlCompatibility: CommandProbeEvidence;
  readonly migrationCheckCompatibility: CommandProbeEvidence;
  readonly sidecarByteStability: ByteStabilityProbeEvidence;
}
