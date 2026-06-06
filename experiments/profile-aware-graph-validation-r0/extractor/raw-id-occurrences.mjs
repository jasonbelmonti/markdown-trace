import { numberedId, sortByOccurrence } from "./collections.mjs";
import { sectionContextForRange, tableContextForCell, tableContextForRange } from "./document-context.mjs";
import { formatRange, formatTarget } from "./formatters.mjs";

const ID_TOKEN_PATTERN = /\b[A-Z][A-Z0-9]+-\d+(?:-[A-Z0-9]+)*\b/g;

export function collectRawIdOccurrences({ sections, tableCells, textSpans, traceLinks }) {
  const occurrences = [
    ...textSpanIdOccurrences({ sections, tableCells, textSpans }),
    ...tableCellIdOccurrences({ sections, tableCells }),
  ];
  const traceLabelRanges = traceLinkSourceRanges(traceLinks);
  const linkedOccurrences = occurrences.map((occurrence) => ({
    ...occurrence,
    linkedTraceOccurrence: linkedTraceOccurrence(occurrence, traceLabelRanges),
  }));

  return sortByOccurrence(linkedOccurrences).map((occurrence, index) => ({
    occurrenceId: numberedId("raw-id", index + 1),
    ...occurrence,
  }));
}

function textSpanIdOccurrences({ sections, tableCells, textSpans }) {
  return textSpans.flatMap((span) => {
    if (span.sourceRange === undefined || tableContextForRange(tableCells, span.sourceRange) !== undefined) {
      return [];
    }

    return scanIdTokens(span.text, {
      sourceKind: "text_span",
      sourceRange: span.sourceRange,
      sectionContext: sectionContextForRange(sections, span.sourceRange),
      tableContext: undefined,
      target: formatTarget(span.target),
    });
  });
}

function tableCellIdOccurrences({ sections, tableCells }) {
  return tableCells.flatMap(({ cell, tableIndex }) =>
    scanIdTokens(cell.text, {
      sourceKind: "table_cell",
      sourceRange: cell.sourceRange,
      sectionContext: sectionContextForRange(sections, cell.sourceRange),
      tableContext: tableContextForCell(tableCells, tableIndex, cell),
      target: formatTarget(cell.target),
    }),
  );
}

function linkedTraceOccurrence(occurrence, traceLabelRanges) {
  if (occurrence.sourceRange === undefined) {
    return undefined;
  }

  const key = `${occurrence.label}\u0000${occurrence.sourceRange.start.offset}\u0000${occurrence.sourceRange.end.offset}`;

  return traceLabelRanges.has(key) ? "same-source-range" : undefined;
}

function scanIdTokens(text, context) {
  const matches = [];

  for (const match of text.matchAll(ID_TOKEN_PATTERN)) {
    const label = match[0];
    const textOffsetInContext = match.index ?? 0;
    matches.push({
      label,
      family: label.split("-")[0],
      sourceKind: context.sourceKind,
      sourceRange: formatRange(context.sourceRange),
      rangePrecision: "context-source-range",
      textOffsetInContext,
      sectionContext: context.sectionContext,
      tableContext: context.tableContext,
      target: context.target,
    });
  }

  return matches;
}

function traceLinkSourceRanges(traceLinks) {
  return new Set(
    traceLinks
      .filter((link) => link.sourceRange !== undefined)
      .map((link) => `${link.label}\u0000${link.sourceRange.start.offset}\u0000${link.sourceRange.end.offset}`),
  );
}
