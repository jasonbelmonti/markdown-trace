import type { GraphSnapshot } from "../contracts/analysis.js";
import type { GraphValidationRule } from "../contracts/validation-profile.js";
import type {
  ValidationContext,
  ReportFinding,
  RuleCounts,
  ResolvedIdentifierRecord,
} from "./model.js";
import { selectTargets } from "./selectors.js";
import { contains } from "./source.js";

const outside = (count: number, rule: GraphValidationRule) =>
  count < rule.min || (rule.max !== null && count > rule.max);
const countStatus = (
  count: number,
  rule: GraphValidationRule,
  graph: GraphSnapshot,
): "fail" | "indeterminate" =>
  count < rule.min && graph.coverage === "partial" ? "indeterminate" : "fail";
export function evaluateRule(
  rule: GraphValidationRule,
  context: ValidationContext,
  report: ReportFinding,
): RuleCounts {
  const { document, graph, identifiers, occurrences } = context;
  if (rule.op === "declarations" || rule.op === "references") {
    const targets = selectTargets(document, rule.select);
    const candidates =
      rule.op === "declarations"
        ? graph.occurrences.filter(
            (item) =>
              item.role === "definition" &&
              rule.kinds.includes(
                identifiers.get(item.identifier)?.entityKind ?? "",
              ),
          )
        : graph.relationships
            .filter((edge) => edge.kind === rule.relation)
            .map((edge) => ({
              ...occurrences.get(edge.occurrenceId)!,
              identifier: edge.target,
            }));
    const seen = new Set();
    if (targets.length < rule.minSelections)
      report(
        "selection-count",
        "Expected at least " +
          rule.minSelections +
          " source targets; found " +
          targets.length +
          ".",
        context.documentRange,
      );
    for (const target of targets) {
      const matches = candidates.filter((item) =>
        contains(target.sourceRange, item.range),
      );
      matches.forEach((item) => seen.add(item.id));
      if (outside(matches.length, rule))
        report(
          "annotation-count",
          "Expected " +
            rule.min +
            ".." +
            (rule.max ?? "unbounded") +
            " " +
            rule.op +
            "; found " +
            matches.length +
            ".",
          target.sourceRange,
          undefined,
          countStatus(matches.length, rule, graph),
        );
      if (
        rule.matchText &&
        matches.some((item) => item.identifier !== target.text)
      )
        report(
          "text-mismatch",
          "Annotation identifier must equal the selected source text: " +
            target.text +
            ".",
          target.sourceRange,
        );
    }
    if (rule.exclusive) {
      for (const candidate of candidates.filter((item) => !seen.has(item.id)))
        report(
          "annotation-location",
          "Annotation must occur in a source target selected by this rule.",
          candidate.range,
          candidate.identifier,
        );
    }
    return { selected: targets.length, evaluated: targets.length };
  }
  const subjects = graph.identifiers.filter(
    (record): record is ResolvedIdentifierRecord =>
      rule.kinds.includes(record.entityKind ?? "") &&
      record.definition.status === "resolved",
  );
  if (rule.op === "entity-count") {
    if (outside(subjects.length, rule))
      report(
        "entity-count",
        "Resolved entity count is " + subjects.length + ".",
        context.documentRange,
        undefined,
        countStatus(subjects.length, rule, graph),
      );
    return { selected: subjects.length, evaluated: 1 };
  }
  for (const subject of subjects) {
    const related = new Set();
    const matches =
      (rule.direction === "outgoing" ? context.outgoing : context.incoming).get(
        subject.identifier,
      ) ?? [];
    for (const { relationship: edge } of matches) {
      if (edge.kind !== rule.relation || edge.source.status !== "owned")
        continue;
      const other =
        rule.direction === "outgoing" ? edge.target : edge.source.identifier;
      const record = identifiers.get(other);
      if (
        record?.definition.status === "resolved" &&
        rule.relatedKinds.includes(record.entityKind ?? "")
      )
        related.add(other);
    }
    if (outside(related.size, rule))
      report(
        "relation-count",
        "Expected " +
          rule.min +
          ".." +
          (rule.max ?? "unbounded") +
          " distinct " +
          rule.direction +
          " " +
          rule.relation +
          " neighbors; found " +
          related.size +
          ".",
        occurrences.get(subject.definition.occurrenceId)!.range,
        subject.identifier,
        countStatus(related.size, rule, graph),
      );
  }
  return { selected: subjects.length, evaluated: subjects.length };
}
