import {
  validateGraphDocument,
  type GraphArtifactFamily,
  type GraphDiagnostic,
  type GraphValidationEvidenceAnchor,
  type GraphValidationHashes,
  type GraphValidationNode,
  type GraphValidationOperationalDiagnostic,
  type GraphValidationOperationalResult,
  type GraphValidationOperationalStage,
  type GraphValidationProfileDescriptor,
  type GraphValidationRelationship,
  type GraphValidationRelationshipClass,
  type GraphValidationResult,
  type GraphValidationRunResult,
  type GraphValidationRuntimeMetadata,
  type GraphValidationSourceDescriptor,
  type GraphValidationSourcePosition,
  type GraphValidationSourceRange,
  type GraphValidationSummary,
  type RequiredPathResult,
  type ValidateGraphDocumentOptions,
} from "@jasonbelmonti/markdown-trace";

export interface PublicContractClosure {
  readonly artifactFamily: GraphArtifactFamily;
  readonly diagnostic: GraphDiagnostic;
  readonly evidenceAnchor: GraphValidationEvidenceAnchor;
  readonly hashes: GraphValidationHashes;
  readonly node: GraphValidationNode;
  readonly operationalDiagnostic: GraphValidationOperationalDiagnostic;
  readonly operationalResult: GraphValidationOperationalResult;
  readonly operationalStage: GraphValidationOperationalStage;
  readonly options: ValidateGraphDocumentOptions;
  readonly profile: GraphValidationProfileDescriptor;
  readonly relationship: GraphValidationRelationship;
  readonly relationshipClass: GraphValidationRelationshipClass;
  readonly requiredPath: RequiredPathResult;
  readonly result: GraphValidationResult;
  readonly runResult: GraphValidationRunResult;
  readonly runtime: GraphValidationRuntimeMetadata;
  readonly source: GraphValidationSourceDescriptor;
  readonly sourcePosition: GraphValidationSourcePosition;
  readonly sourceRange: GraphValidationSourceRange;
  readonly summary: GraphValidationSummary;
}

export const validate: (
  options: ValidateGraphDocumentOptions,
) => Promise<GraphValidationRunResult> = validateGraphDocument;
