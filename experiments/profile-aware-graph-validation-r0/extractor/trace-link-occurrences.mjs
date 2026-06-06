import { numberedId, unique } from "./collections.mjs";
import {
  ancestorNodeKinds,
  headingContextForTarget,
  sectionContextForRange,
  tableContextForRange,
} from "./document-context.mjs";
import { formatRange, formatTarget } from "./formatters.mjs";
import { parseTraceUrl, traceUrlFallbackLabel } from "./trace-urls.mjs";

export function traceLinkOccurrence({
  index,
  link,
  nodeByPath,
  sections,
  tableCells,
}) {
  const parsedUrl = parseTraceUrl(link.url);
  const tableContext = tableContextForRange(tableCells, link.sourceRange);
  const sectionContext = sectionContextForRange(sections, link.sourceRange);
  const ancestorKinds = ancestorNodeKinds(link.target, nodeByPath);
  const inHeading = ancestorKinds.includes("heading");
  const role = traceRole({ inHeading, parsedUrl, tableContext });

  return {
    occurrenceId: numberedId("trace-link", index + 1),
    kind: parsedUrl.kind,
    role,
    label: link.text ?? link.label ?? traceUrlFallbackLabel(parsedUrl),
    url: link.url,
    sourceRange: formatRange(link.sourceRange),
    target: formatTarget(link.target),
    sectionContext,
    tableContext,
    headingContext: headingContextForTarget(nodeByPath, link.target),
    ancestorNodeKinds: unique(ancestorKinds),
    trace:
      parsedUrl.kind === "entity"
        ? {
            canonicalId: parsedUrl.canonicalId,
            type: parsedUrl.type,
          }
        : {
            start: parsedUrl.start,
            end: parsedUrl.end,
          },
  };
}

function traceRole({ inHeading, parsedUrl, tableContext }) {
  if (parsedUrl.kind === "range") {
    return tableContext === undefined ? "section_range_reference" : "table_range_reference";
  }

  if (inHeading && parsedUrl.type !== undefined) {
    return "primary_definition";
  }

  if (tableContext !== undefined && parsedUrl.type !== undefined) {
    return "table_evidence_candidate";
  }

  if (tableContext !== undefined) {
    return "table_reference";
  }

  if (parsedUrl.type !== undefined) {
    return "contextual_evidence_candidate";
  }

  return "section_reference";
}
