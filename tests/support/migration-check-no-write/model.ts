export type MigrationCheckNoWriteCaseName =
  | "missing-generated-artifact"
  | "stale-generated-artifact"
  | "unexplained-drift";

export type ArtifactState = "missing" | "present";
export type ProbeStatus = "PASS" | "FAIL";

export interface ArtifactSnapshot {
  readonly state: ArtifactState;
  readonly sha256?: string;
  readonly sizeBytes?: number;
}

export interface MigrationCheckNoWriteCaseEvidence {
  readonly name: MigrationCheckNoWriteCaseName;
  readonly command: string;
  readonly exitCode: number;
  readonly stderr: string;
  readonly artifactBefore: ArtifactSnapshot;
  readonly artifactAfter: ArtifactSnapshot;
  readonly noWriteProof: string;
  readonly noWritePassed: boolean;
  readonly diagnosticExcerpt: string;
  readonly diagnosticPassed: boolean;
  readonly status: ProbeStatus;
}

export interface MigrationCheckNoWriteEvidence {
  readonly evidenceId: "R3-EVD-3";
  readonly validationCheckpoint: "VAL-3";
  readonly workPackage: "R3-3B";
  readonly issue: "BEL-1237";
  readonly cases: readonly MigrationCheckNoWriteCaseEvidence[];
}
