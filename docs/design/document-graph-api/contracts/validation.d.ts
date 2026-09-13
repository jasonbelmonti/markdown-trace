import type { AnalysisId, Diagnostic, Sha256 } from "./source.js";
export interface RuleResult {
  readonly ruleId: string;
  readonly status: "pass" | "fail" | "not-applicable" | "indeterminate";
  readonly matchedSubjects: number;
  readonly evaluatedSubjects: number;
  readonly diagnostics: readonly Diagnostic[];
}
export interface ValidationReport {
  readonly schemaVersion: "markdown-trace.document-validation.v1";
  readonly analysisId: AnalysisId;
  readonly profileId: string;
  readonly interpretationHash: Sha256;
  readonly validationHash: Sha256;
  readonly status: "pass" | "fail" | "indeterminate";
  readonly diagnostics: readonly Diagnostic[];
  readonly ruleResults: readonly RuleResult[];
}
