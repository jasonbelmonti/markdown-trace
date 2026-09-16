import type {
  DocumentAnalysis,
  IdentifierRecord,
} from "./contracts/analysis.js";
import type { ReferenceMatch } from "./contracts/query.js";

export interface AnalysisState {
  identifiers: Map<string, IdentifierRecord>;
  incoming: Map<string, ReferenceMatch[]>;
  outgoing: Map<string, ReferenceMatch[]>;
}
const analyses = new WeakMap<DocumentAnalysis, AnalysisState>();
export const analysisState = (
  analysis: DocumentAnalysis,
): AnalysisState | undefined => analyses.get(analysis);
export const registerAnalysis = (
  analysis: DocumentAnalysis,
  state: AnalysisState,
): void => {
  analyses.set(analysis, state);
};
