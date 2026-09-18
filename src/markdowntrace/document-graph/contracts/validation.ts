import type { AnalysisId, Identifier, Sha256, SourceRange } from "./source.js";

export type ValidationStatus = "pass" | "fail" | "indeterminate";
export interface ValidationRuleResult {
  readonly id: string;
  readonly status: ValidationStatus | "not-applicable";
  readonly selected: number;
  readonly evaluated: number;
}
export interface ValidationDiagnostic {
  readonly ruleId: string;
  readonly code: string;
  readonly status: "fail" | "indeterminate";
  readonly message: string;
  readonly identifier?: Identifier;
  readonly line?: number;
  readonly column?: number;
  readonly range?: SourceRange;
}
export interface GraphValidationReport {
  readonly schemaVersion: "markdown-trace.validation-result.experimental.v1";
  readonly status: ValidationStatus;
  readonly valid: boolean;
  readonly analysisId: AnalysisId;
  readonly sourceSha256: Sha256;
  readonly profileId: string;
  readonly interpretationHash: Sha256;
  readonly validationHash: Sha256;
  readonly parserVersion: string;
  readonly coverage: "complete" | "partial";
  readonly identifiers: number;
  readonly relationships: number;
  readonly rules: readonly ValidationRuleResult[];
  readonly diagnostics: readonly ValidationDiagnostic[];
}
