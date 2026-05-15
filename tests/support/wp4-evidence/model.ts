export interface CommandRun {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface RepeatedCommandEvidence {
  readonly pathName: string;
  readonly command: string;
  readonly inputFixture: string;
  readonly coverage: string;
  readonly runs: readonly CommandRun[];
  readonly outputHashes: readonly string[];
  readonly identicalOrderedOutputs: boolean;
}

export interface DeterminismEvidence {
  readonly enginePackage: string;
  readonly documentVersion: string;
  readonly commands: readonly RepeatedCommandEvidence[];
}

export interface GraphExclusionEvidence {
  readonly surface: string;
  readonly containsIssueKeyInInput: boolean;
  readonly entityIds: readonly string[];
  readonly entityLabels: readonly string[];
  readonly graphNodeIds: readonly string[];
  readonly graphNodeLabels: readonly string[];
  readonly graphEdgeEndpointIds: readonly string[];
  readonly graphEdgeEndpointLabels: readonly string[];
  readonly externalReferenceKeys: readonly string[];
  readonly externalReferenceRelatedEntities: readonly string[];
}

export interface IssueKeyCollisionEvidence {
  readonly issueKey: string;
  readonly registryVersion: string;
  readonly enginePackage: string;
  readonly documentVersion: string;
  readonly surfaces: readonly GraphExclusionEvidence[];
}

export interface LocalSafetyCommandEvidence {
  readonly pathName: string;
  readonly command: string;
  readonly exitCode: number;
  readonly networkAttempts: number;
  readonly stderr: string;
  readonly approvedWrites: readonly string[];
  readonly observedWrites: readonly string[];
  readonly unapprovedWrites: readonly string[];
  readonly approvedWritesOnly: boolean;
  readonly repositoryStatusChanged: boolean;
}

export interface LocalSafetyEvidence {
  readonly enginePackage: string;
  readonly documentVersion: string;
  readonly commands: readonly LocalSafetyCommandEvidence[];
}
