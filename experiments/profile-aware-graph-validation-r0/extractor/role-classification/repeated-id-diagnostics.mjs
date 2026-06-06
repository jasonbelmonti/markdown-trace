import { groupBy } from "../collections.mjs";

export function repeatedIdPolicyFacts(classifications) {
  return [...groupBy(classifications, (classification) => classification.label).entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .map(([label, occurrences]) => {
      const roleCounts = countBy(occurrences, (occurrence) => occurrence.role);
      return {
        label,
        family: occurrences[0].family,
        occurrenceCount: occurrences.length,
        roles: roleCounts,
        policy: repeatedIdPolicy(roleCounts),
        occurrenceIds: occurrences.slice(0, 12).map((occurrence) => occurrence.occurrenceId),
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function rawDiagnosticHints({ resolvedClassifications, repeatedIds, rangeReferences }) {
  return [
    ...resolvedClassifications
      .filter(
        (classification) =>
          classification.resolution === "unresolved_candidate" &&
          ["coverage_reference", "table_reference", "section_reference", "contextual_evidence_candidate"].includes(
            classification.role,
          ),
      )
      .map((classification) => ({
        code: "r0.extractor.unresolved_raw_id_candidate",
        severity: "info",
        occurrenceId: classification.occurrenceId,
        label: classification.label,
        role: classification.role,
        sourceRange: classification.sourceRange,
      })),
    ...repeatedIds
      .filter((fact) => fact.policy !== "single_primary_with_references")
      .map((fact) => ({
        code: `r0.extractor.repeated_id.${fact.policy}`,
        severity: fact.policy === "duplicate_primary_candidate" ? "warning" : "info",
        label: fact.label,
        roles: fact.roles,
        occurrenceIds: fact.occurrenceIds,
      })),
    ...rangeReferences.flatMap((range) =>
      Object.entries(range.resolution)
        .filter(([, status]) => status === "unresolved_candidate")
        .map(([endpoint]) => ({
          code: "r0.extractor.unresolved_raw_range_endpoint_candidate",
          severity: "info",
          occurrenceId: range.occurrenceId,
          endpoint,
          label: endpoint === "start" ? range.start : range.end,
          sourceRange: range.sourceRange,
        })),
    ),
  ];
}

export function roleSummary({ classifications, coverageRows, rangeReferences, repeatedIds, diagnosticHints }) {
  return {
    classificationCount: classifications.length,
    roleCounts: countBy(classifications, (classification) => classification.role),
    familyCounts: countBy(classifications, (classification) => classification.family),
    primaryDefinitionCount: classifications.filter((classification) => classification.role === "primary_definition").length,
    supplementalDefinitionCount: classifications.filter((classification) => classification.role === "supplemental_definition").length,
    coverageReferenceCount: classifications.filter((classification) => classification.role === "coverage_reference").length,
    coverageRowCount: coverageRows.length,
    mentionCount: classifications.filter((classification) => classification.role === "mention").length,
    rangeReferenceCount: rangeReferences.length,
    repeatedIdCount: repeatedIds.length,
    diagnosticHintCount: diagnosticHints.length,
  };
}

function repeatedIdPolicy(roleCounts) {
  if ((roleCounts.primary_definition ?? 0) > 1) {
    return "duplicate_primary_candidate";
  }

  if ((roleCounts.primary_definition ?? 0) === 1 && (roleCounts.supplemental_definition ?? 0) > 0) {
    return "primary_with_supplemental_definition";
  }

  if ((roleCounts.primary_definition ?? 0) === 1) {
    return "single_primary_with_references";
  }

  if ((roleCounts.coverage_reference ?? 0) > 0 || (roleCounts.table_reference ?? 0) > 0) {
    return "coverage_or_reference_only";
  }

  if ((roleCounts.table_evidence_candidate ?? 0) > 0) {
    return "non_authoritative_table_candidate";
  }

  return "mention_only";
}

function countBy(items, keyForItem) {
  const counts = {};

  for (const item of items) {
    const key = keyForItem(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}
