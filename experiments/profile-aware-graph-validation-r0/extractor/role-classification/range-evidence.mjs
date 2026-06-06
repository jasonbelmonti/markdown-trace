import { groupBy, numberedId } from "../collections.mjs";
import { formatRange } from "../formatters.mjs";
import {
  cellKey,
  isCoverageHeader,
  isCoverageMatrixTable,
  normalizeHeader,
  rowKey,
} from "./policy.mjs";

const RANGE_TEXT_PATTERN = /\b([A-Z][A-Z0-9]+-\d+(?:-[A-Z0-9]+)*)\s+through\s+([A-Z][A-Z0-9]+-\d+(?:-[A-Z0-9]+)*)\b/g;

export function rawRangeReferences({ rawIdOccurrences, tables, definitionsByLabel, rowDefinitionCandidates }) {
  const occurrencesByCell = groupBy(
    rawIdOccurrences.filter((occurrence) => occurrence.tableContext !== undefined),
    (occurrence) => cellKey(occurrence.tableContext),
  );
  const ranges = [];

  tables.forEach((table, tableIndex) => {
    for (const cell of table.cells.filter((candidate) => !candidate.header)) {
      for (const match of cell.text.matchAll(RANGE_TEXT_PATTERN)) {
        const cellContext = occurrencesByCell.get(cellKey({ tableIndex, rowIndex: cell.rowIndex, columnIndex: cell.columnIndex }))?.[0];
        const sectionTitle = cellContext?.sectionContext?.title;
        const header = normalizeHeader(cellContext?.tableContext?.columnHeader);
        const matrixRange = isCoverageMatrixTable(table, sectionTitle);
        const coverageRange =
          matrixRange || rowDefinitionCandidates.has(rowKey({ tableIndex, rowIndex: cell.rowIndex })) || isCoverageHeader(header);

        ranges.push({
          occurrenceId: numberedId("raw-range", ranges.length + 1),
          label: match[0],
          start: match[1],
          end: match[2],
          role: coverageRange ? "coverage_range" : "mention_range",
          section: cellContext?.sectionContext,
          table: cellContext?.tableContext,
          sourceRange: formatRange(cell.sourceRange),
          resolution: {
            start: definitionsByLabel.has(match[1]) ? "definition_found" : "unresolved_candidate",
            end: definitionsByLabel.has(match[2]) ? "definition_found" : "unresolved_candidate",
          },
        });
      }
    }
  });

  return ranges;
}
