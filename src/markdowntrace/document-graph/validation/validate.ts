import type { DocumentAnalysis } from "../contracts/analysis.js";
import type { Outcome } from "../contracts/source.js";
import type { TraceValidationProfile } from "../contracts/validation-profile.js";
import type { GraphValidationReport } from "../contracts/validation.js";
import { analysisState } from "../analysis-state.js";
import { AnalysisFailure, failure, freeze } from "../value.js";
import { validationProfileData } from "./profile.js";
import { evaluate } from "./evaluate.js";

export function validateGraph(
  analysis: DocumentAnalysis,
  profile: TraceValidationProfile,
): Outcome<GraphValidationReport> {
  const state = analysisState(analysis),
    data = validationProfileData(profile);
  if (!state || !data)
    return failure(
      "invalid-input",
      "Expected an issued analysis and validation profile.",
    );
  if (analysis.snapshot.interpretationHash !== profile.interpretationHash)
    return failure(
      "profile-mismatch",
      "Interpretation changed; reanalyze the document.",
    );
  try {
    return freeze({
      ok: true,
      value: evaluate(analysis.snapshot, state, profile, data),
    });
  } catch (error) {
    if (error instanceof AnalysisFailure)
      return failure(error.code, error.message);
    throw error;
  }
}
