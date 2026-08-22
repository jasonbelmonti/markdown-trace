import type { GraphArtifactFamily, GraphProfile } from "./model.js";

export const GRAPH_PROFILE_ERROR_CODE = "markdown-trace.graph.profile_error" as const;

export type GraphProfileDiagnosticStage = "read" | "yaml" | "schema";

export interface GraphProfileDiagnostic {
  readonly code: typeof GRAPH_PROFILE_ERROR_CODE;
  readonly severity: "error";
  readonly message: string;
  readonly profileRuleId: string;
  readonly affectedIds: readonly string[];
  readonly blocking: true;
  readonly repairActionKind: "fix_graph_profile";
  readonly stage: GraphProfileDiagnosticStage;
  readonly source?: string;
}

export type GraphProfileResult =
  | { readonly ok: true; readonly profile: GraphProfile<GraphArtifactFamily> }
  | { readonly ok: false; readonly diagnostics: readonly GraphProfileDiagnostic[] };

export function graphProfileError(
  stage: GraphProfileDiagnosticStage,
  message: string,
  options: { readonly profileRuleId?: string; readonly source?: string } = {},
): GraphProfileDiagnostic {
  return Object.freeze({
    code: GRAPH_PROFILE_ERROR_CODE,
    severity: "error",
    message,
    profileRuleId: options.profileRuleId ?? `graph-profile.${stage}`,
    affectedIds: Object.freeze([]),
    blocking: true,
    repairActionKind: "fix_graph_profile",
    stage,
    ...(options.source === undefined ? {} : { source: options.source }),
  });
}
