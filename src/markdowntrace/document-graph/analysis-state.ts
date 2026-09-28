import type {
  DocumentAnalysis,
  IdentifierRecord,
} from "./contracts/analysis.js";
import type { ReferenceMatch } from "./contracts/query.js";
import type { Extraction } from "./extraction-model.js";

export interface AnalysisState {
  text: string;
  document: Extraction["document"];
  identifiers: Map<string, IdentifierRecord>;
  incoming: Map<string, ReferenceMatch[]>;
  outgoing: Map<string, ReferenceMatch[]>;
}
const analyses = new WeakMap<DocumentAnalysis, AnalysisState>();
export const analysisState = (
  analysis: DocumentAnalysis,
): AnalysisState | undefined => analyses.get(analysis);
/** Internal, read-only access to the exact source and Engine capture. */
export const capturedSource = (
  analysis: DocumentAnalysis,
): Readonly<Pick<AnalysisState, "text" | "document">> | undefined => {
  const state = analyses.get(analysis);
  return state && { text: state.text, document: state.document };
};
export const registerAnalysis = (
  analysis: DocumentAnalysis,
  state: AnalysisState,
): void => {
  analyses.set(analysis, state);
};
