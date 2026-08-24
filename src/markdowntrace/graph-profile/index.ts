import type {
  GraphArtifactFamily,
  GraphProfile as CompleteGraphProfile,
  GraphRelationshipRequiredPath,
} from "./model.js";

export type GraphProfile<
  TArtifactFamily extends GraphArtifactFamily = "execution-spec",
> = CompleteGraphProfile<TArtifactFamily, GraphRelationshipRequiredPath>;

export {
  GRAPH_PROFILE_ERROR_CODE,
  graphProfileError,
  type GraphProfileDiagnostic,
  type GraphProfileDiagnosticStage,
  type GraphProfileResult,
} from "./diagnostics.js";
export { EXECUTION_SPEC_FIRST_SLICE_PROFILE, graphProfileHash } from "./execution-spec.js";
export { validateGraphProfile } from "./validate.js";
export {
  GRAPH_PROFILE_SCHEMA_VERSION,
  type GraphArtifactFamily,
  type GraphDiagnosticCode,
  type GraphDiagnosticRule,
  type GraphEvidenceRole,
  type GraphIdFamily,
  type GraphIdFamilyPolicy,
  type GraphRelationshipClass,
  type GraphRelationshipDefinition,
  type GraphRepairActionKind,
  type GraphRepeatedIdPolicy,
  type GraphRelationshipRequiredPath as GraphRequiredPath,
  type GraphRequiredPathSourceSelector,
  type GraphRequiredPathStep,
  type GraphTableEffect,
  type GraphTableMatch,
  type GraphTableRole,
} from "./model.js";
