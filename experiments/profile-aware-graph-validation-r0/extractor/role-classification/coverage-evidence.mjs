import { groupBy, numberedId, unique } from "../collections.mjs";
import { isCoverageMatrixTable, normalizeHeader, rowKey } from "./policy.mjs";

export function coverageRowFacts({ classifications, tableByIndex }) {
  const tableRows = groupBy(
    classifications.filter((classification) => classification.table !== undefined),
    (classification) => rowKey(classification.table),
  );

  return [...tableRows.entries()].flatMap(([key, rowClassifications], index) => {
    const tableContext = rowClassifications[0]?.table;
    const table = tableByIndex.get(tableContext?.tableIndex);
    const matrixRow = isCoverageMatrixTable(table, rowClassifications[0]?.section?.title);
    const definitions = rowClassifications.filter((classification) =>
      ["primary_definition", "supplemental_definition"].includes(classification.role),
    );
    const rowSources = definitions.length > 0 ? definitions : matrixRow ? firstColumnClassifications(rowClassifications) : [];
    const rowTargets = rowClassifications.filter(
      (classification) =>
        !rowSources.some((source) => source.occurrenceId === classification.occurrenceId) &&
        ["coverage_reference", "table_reference", "section_reference"].includes(classification.role),
    );

    if (rowSources.length === 0 || rowTargets.length === 0) {
      return [];
    }

    const sourceFacts = uniqueByLabel(rowSources);
    const targetFacts = uniqueByLabel(rowTargets);

    return [
      {
        coverageRowId: numberedId("coverage-row", index + 1),
        tableIndex: tableContext.tableIndex,
        rowIndex: tableContext.rowIndex,
        section: rowClassifications[0]?.section,
        rowKind: matrixRow ? "matrix_coverage_row" : "definition_coverage_row",
        sourceLabels: sourceFacts.map((source) => source.label),
        targetLabels: targetFacts.map((target) => target.label),
        sourceOccurrenceIds: sourceFacts.map((source) => source.occurrenceId),
        targetOccurrenceIds: targetFacts.map((target) => target.occurrenceId),
        relationshipHints: unique(rowTargets.map((target) => relationshipHint(target, matrixRow))),
        targetRelationshipHints: targetFacts.map((target) => relationshipHint(target, matrixRow)),
        role: "coverage_row",
      },
    ];
  });
}

export function rawCandidateEdges({ coverageRows, rangeReferences }) {
  return [
    ...coverageRows.flatMap((row) =>
      row.sourceLabels.flatMap((sourceLabel, sourceIndex) =>
        row.targetLabels.flatMap((targetLabel, targetIndex) => {
          if (targetLabel === sourceLabel) {
            return [];
          }

          return [{
            sourceOccurrenceId: row.sourceOccurrenceIds[sourceIndex],
            fromLabel: sourceLabel,
            toLabel: targetLabel,
            targetOccurrenceId: row.targetOccurrenceIds[targetIndex],
            relationshipHint:
              row.targetRelationshipHints?.[targetIndex] ?? row.relationshipHints[0] ?? "coverage_reference",
            evidenceRole: row.role,
            coverageRowId: row.coverageRowId,
          }];
        }),
      ),
    ),
    ...rangeReferences.map((range) => ({
      sourceOccurrenceId: range.occurrenceId,
      fromLabel: range.start,
      toRange: {
        start: range.start,
        end: range.end,
      },
      relationshipHint: range.role,
      evidenceRole: range.role,
      resolution: range.resolution,
    })),
  ];
}

function relationshipHint(classification, matrixRow) {
  if (matrixRow) {
    return "traceability_matrix_coverage";
  }

  const header = normalizeHeader(classification.table?.columnHeader);

  if (header === "") {
    return "table_coverage_reference";
  }

  return `${header.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_coverage`;
}

function firstColumnClassifications(rowClassifications) {
  const minColumn = Math.min(...rowClassifications.map((classification) => classification.table?.columnIndex ?? 0));
  return rowClassifications.filter((classification) => classification.table?.columnIndex === minColumn);
}

function uniqueByLabel(classifications) {
  const seen = new Set();
  const facts = [];

  for (const classification of classifications) {
    if (seen.has(classification.label)) {
      continue;
    }

    seen.add(classification.label);
    facts.push(classification);
  }

  return facts;
}
