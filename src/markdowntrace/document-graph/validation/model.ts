import type { AnalysisState } from "../analysis-state.js";
import type {
  GraphSnapshot,
  Occurrence,
  IdentifierRecord,
} from "../contracts/analysis.js";
import type { SourceRange } from "../contracts/source.js";

export interface ValidationContext extends AnalysisState {
  graph: GraphSnapshot;
  occurrences: Map<string, Occurrence>;
  documentRange: SourceRange;
}
export interface RuleCounts {
  selected: number;
  evaluated: number;
}
export type ReportFinding = (
  code: string,
  message: string,
  range?: SourceRange,
  identifier?: string,
  status?: "fail" | "indeterminate",
) => void;

export type RuleRunner = (
  id: string,
  action: (report: ReportFinding) => RuleCounts,
) => void;
export type ResolvedIdentifierRecord = IdentifierRecord & {
  definition: Extract<IdentifierRecord["definition"], { status: "resolved" }>;
};
