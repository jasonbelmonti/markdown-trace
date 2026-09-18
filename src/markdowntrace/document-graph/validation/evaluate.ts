import { runBuiltins } from "./builtins.js";
import type { AnalysisState } from "../analysis-state.js";
import type { GraphSnapshot } from "../contracts/analysis.js";
import type {
  TraceValidationProfile,
  ValidationProfileInput,
} from "../contracts/validation-profile.js";
import type {
  GraphValidationReport,
  ValidationDiagnostic,
  ValidationRuleResult,
} from "../contracts/validation.js";
import type { ReportFinding, RuleCounts, ValidationContext } from "./model.js";
import { requiredRange } from "./source.js";
import { evaluateRule } from "./rules.js";

export function evaluate(
  graph: GraphSnapshot,
  state: AnalysisState,
  profile: TraceValidationProfile,
  data: ValidationProfileInput,
): GraphValidationReport {
  const diagnostics: ValidationDiagnostic[] = [],
    rules: ValidationRuleResult[] = [];
  const { document } = state;
  const occurrences = new Map(
    graph.occurrences.map((occurrence) => [occurrence.id, occurrence]),
  );
  const context: ValidationContext = {
    ...state,
    graph,
    occurrences,
    documentRange: requiredRange(document.sourceRange),
  };
  function run(id: string, action: (report: ReportFinding) => RuleCounts) {
    const before = diagnostics.length;
    const report: ReportFinding = (
      code,
      message,
      range,
      identifier,
      status = "fail",
    ) =>
      diagnostics.push({
        ruleId: id,
        code: "trace-validation." + code,
        status,
        message,
        identifier,
        line: range?.start.line,
        column: range?.start.column,
        range,
      });
    const counts = action(report);
    const findings = diagnostics.slice(before);
    const status = findings.some((item) => item.status === "fail")
      ? "fail"
      : findings.length
        ? "indeterminate"
        : counts.evaluated === 0
          ? "not-applicable"
          : "pass";
    rules.push({ id, status, ...counts });
  }
  runBuiltins(context, data.validation, run);
  for (const rule of data.validation.rules)
    run(rule.id, (report) => evaluateRule(rule, context, report));
  const status = rules.some((rule) => rule.status === "fail")
    ? "fail"
    : graph.coverage === "partial" ||
        rules.some((rule) => rule.status === "indeterminate")
      ? "indeterminate"
      : "pass";
  diagnostics.sort(
    (a, b) =>
      (a.range?.start.offset ?? -1) - (b.range?.start.offset ?? -1) ||
      (a.ruleId < b.ruleId
        ? -1
        : a.ruleId > b.ruleId
          ? 1
          : a.code < b.code
            ? -1
            : a.code > b.code
              ? 1
              : 0),
  );
  return {
    schemaVersion: "markdown-trace.validation-result.experimental.v1",
    status,
    valid: status === "pass",
    analysisId: graph.analysisId,
    sourceSha256: graph.source.sha256,
    profileId: profile.profileId,
    interpretationHash: profile.interpretationHash,
    validationHash: profile.validationHash,
    parserVersion: graph.parserVersion,
    coverage: graph.coverage,
    identifiers: graph.identifiers.length,
    relationships: graph.relationships.length,
    rules,
    diagnostics,
  };
}
