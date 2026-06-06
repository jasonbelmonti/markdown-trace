import { groupBy } from "../collections.mjs";
import {
  isCoverageHeader,
  isCoverageMatrixTable,
  isDefinitionHeader,
  normalizeHeader,
  rowKey,
} from "./policy.mjs";

export function classifyOccurrences({
  rawIdOccurrences,
  rowDefinitionCandidates,
  tableByIndex,
  traceLinks,
}) {
  const primaryDefinitionsByLabel = new Map();

  return rawIdOccurrences.map((occurrence) => {
    const linkedTrace = linkedTraceForOccurrence(occurrence, traceLinks);
    const base = baseClassification({
      occurrence,
      rowDefinitionCandidates,
      tableByIndex,
      linkedTrace,
    });

    if (base.role !== "definition_candidate") {
      return base;
    }

    if (!primaryDefinitionsByLabel.has(occurrence.label)) {
      primaryDefinitionsByLabel.set(occurrence.label, occurrence.occurrenceId);
      return {
        ...base,
        role: "primary_definition",
        reason: "first ID-column occurrence for this label outside a traceability matrix",
      };
    }

    return {
      ...base,
      role: "supplemental_definition",
      reason: "later ID-column occurrence for a label that already has a primary definition",
      primaryOccurrenceId: primaryDefinitionsByLabel.get(occurrence.label),
    };
  });
}

export function rowDefinitionCandidateIndex(rawIdOccurrences, tables) {
  const candidates = new Set();

  for (const occurrence of rawIdOccurrences) {
    if (occurrence.tableContext === undefined) {
      continue;
    }

    const table = tables[occurrence.tableContext.tableIndex];
    const header = normalizeHeader(occurrence.tableContext.columnHeader);

    if (isDefinitionHeader(header) && !isCoverageMatrixTable(table, occurrence.sectionContext?.title)) {
      candidates.add(rowKey(occurrence.tableContext));
    }
  }

  return candidates;
}

export function definitionLabelIndex(classifications, traceLinks) {
  const rawDefinitionsByLabel = groupBy(
    classifications.filter((classification) =>
      ["primary_definition", "supplemental_definition"].includes(classification.role),
    ),
    (classification) => classification.label,
  );
  const tracePrimaryDefinitionsByLabel = groupBy(
    traceLinks.filter((link) => link.role === "primary_definition"),
    (link) => link.label,
  );

  for (const [label, definitions] of tracePrimaryDefinitionsByLabel.entries()) {
    rawDefinitionsByLabel.set(label, [...(rawDefinitionsByLabel.get(label) ?? []), ...definitions]);
  }

  return rawDefinitionsByLabel;
}

export function classificationResolution(classification, definitionsByLabel) {
  if (classification.role === "primary_definition") {
    return "primary_definition";
  }

  if (classification.role === "supplemental_definition") {
    return "supplemental_definition";
  }

  if (classification.role === "table_evidence_candidate") {
    return "non_authoritative_candidate";
  }

  return definitionsByLabel.has(classification.label) ? "definition_found" : "unresolved_candidate";
}

function baseClassification({ occurrence, rowDefinitionCandidates, tableByIndex, linkedTrace }) {
  if (linkedTrace !== undefined) {
    return classificationFact(occurrence, {
      role: linkedTrace.role,
      authority: "ctx_trace_link",
      reason: `raw ID label is backed by ${linkedTrace.role} trace link ${linkedTrace.occurrenceId}`,
      linkedTraceOccurrenceId: linkedTrace.occurrenceId,
    });
  }

  if (occurrence.tableContext === undefined) {
    return classificationFact(occurrence, {
      role: "mention",
      authority: "raw_id_text",
      reason: "raw ID occurs in prose or heading text outside a table",
    });
  }

  const table = tableByIndex.get(occurrence.tableContext.tableIndex);
  const header = normalizeHeader(occurrence.tableContext.columnHeader);

  if (isDefinitionHeader(header) && !isCoverageMatrixTable(table, occurrence.sectionContext?.title)) {
    return classificationFact(occurrence, {
      role: "definition_candidate",
      authority: "raw_id_table",
      reason: "raw ID appears in an ID-like table column outside a traceability matrix",
    });
  }

  if (
    isCoverageMatrixTable(table, occurrence.sectionContext?.title) ||
    rowDefinitionCandidates.has(rowKey(occurrence.tableContext)) ||
    isCoverageHeader(header)
  ) {
    return classificationFact(occurrence, {
      role: "coverage_reference",
      authority: "raw_id_table",
      reason: "raw ID appears in a relationship, evidence, validation, dependency, or matrix coverage cell",
    });
  }

  return classificationFact(occurrence, {
    role: "mention",
    authority: "raw_id_table",
    reason: "raw ID appears in a table cell without a definition or coverage-column signal",
  });
}

function classificationFact(occurrence, details) {
  return {
    occurrenceId: occurrence.occurrenceId,
    label: occurrence.label,
    family: occurrence.family,
    role: details.role,
    authority: details.authority,
    reason: details.reason,
    sourceKind: occurrence.sourceKind,
    section: occurrence.sectionContext,
    table: occurrence.tableContext,
    sourceRange: occurrence.sourceRange,
    linkedTraceOccurrence: occurrence.linkedTraceOccurrence,
    linkedTraceOccurrenceId: details.linkedTraceOccurrenceId,
    primaryOccurrenceId: details.primaryOccurrenceId,
  };
}

function linkedTraceForOccurrence(occurrence, traceLinks) {
  return traceLinks.find(
    (link) =>
      link.label === occurrence.label &&
      sourceRangeContains(occurrence.sourceRange, link.sourceRange),
  );
}

function sourceRangeContains(container, candidate) {
  const containerStart = container?.start?.offset;
  const containerEnd = container?.end?.offset;
  const candidateStart = candidate?.start?.offset;
  const candidateEnd = candidate?.end?.offset;

  return (
    containerStart !== undefined &&
    containerEnd !== undefined &&
    candidateStart !== undefined &&
    candidateEnd !== undefined &&
    candidateStart >= containerStart &&
    candidateEnd <= containerEnd
  );
}
