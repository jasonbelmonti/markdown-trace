import type { ValidationProfileInput } from "../contracts/validation-profile.js";
import type { ValidationContext, RuleRunner } from "./model.js";

export function runBuiltins(
  context: ValidationContext,
  validation: ValidationProfileInput["validation"],
  run: RuleRunner,
): void {
  const { graph, identifiers, occurrences } = context;
  run("builtin.extraction", (report) => {
    for (const diagnostic of graph.diagnostics.filter(
      (item) => item.severity === "error",
    ))
      report(
        diagnostic.code,
        diagnostic.message,
        diagnostic.sourceRanges[0],
        undefined,
        diagnostic.code.endsWith("malformed-link") ? "fail" : "indeterminate",
      );
    if (
      graph.coverage === "partial" &&
      !graph.diagnostics.some((item) => item.severity === "error")
    )
      report(
        "incomplete",
        "Analysis coverage is partial.",
        context.documentRange,
        undefined,
        "indeterminate",
      );
    return { selected: 1, evaluated: 1 };
  });
  run("builtin.integrity", (report) => {
    for (const record of graph.identifiers) {
      if (record.definition.status !== "resolved" || record.entityKind === null)
        report(
          "identity-invalid",
          "Expected one definition and a known entity kind; definition is " +
            record.definition.status +
            ".",
          graph.occurrences.find(
            (item) => item.identifier === record.identifier,
          )!.range,
          record.identifier,
          record.definition.status === "missing" &&
            record.entityKind !== null &&
            graph.coverage === "partial"
            ? "indeterminate"
            : "fail",
        );
    }
    for (const edge of graph.relationships) {
      if (edge.source.status !== "owned")
        report(
          "owner-invalid",
          "Reference must have one source owner.",
          occurrences.get(edge.occurrenceId)!.range,
        );
    }
    return {
      selected: graph.identifiers.length + graph.relationships.length,
      evaluated: graph.identifiers.length + graph.relationships.length,
    };
  });
  run("builtin.min-entities", (report) => {
    const count = graph.identifiers.filter(
      (record) =>
        record.definition.status === "resolved" && record.entityKind !== null,
    ).length;
    if (count < validation.minEntities)
      report(
        "entity-count",
        "Expected at least " +
          validation.minEntities +
          " resolved entities; found " +
          count +
          ".",
        context.documentRange,
        undefined,
        graph.coverage === "partial" ? "indeterminate" : "fail",
      );
    return { selected: count, evaluated: 1 };
  });
  run("builtin.allowed-relations", (report) => {
    for (const edge of graph.relationships) {
      const from =
        edge.source.status === "owned"
          ? identifiers.get(edge.source.identifier)?.entityKind
          : null;
      const to = identifiers.get(edge.target)?.entityKind;
      if (
        !validation.allowedRelations.some(
          (rule) =>
            rule.kind === edge.kind &&
            rule.from.includes(from ?? "") &&
            rule.to.includes(to ?? ""),
        )
      )
        report(
          "relation-invalid",
          "Relationship kind or endpoint types are not allowed.",
          occurrences.get(edge.occurrenceId)!.range,
        );
    }
    return {
      selected: graph.relationships.length,
      evaluated: graph.relationships.length,
    };
  });
}
