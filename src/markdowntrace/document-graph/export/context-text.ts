import type { ContextBudget, ContextBundle, ContextPart } from "../contracts/context.js";
import type { GraphValidationReport, ValidationDiagnostic } from "../contracts/validation.js";

const DETAIL_LIMIT = 10;
const quote = (value: string) => JSON.stringify(value);

function diagnosticText(diagnostic: ValidationDiagnostic): string {
  const location = diagnostic.line === undefined ? "" : ` at ${diagnostic.line}:${diagnostic.column ?? 1}`;
  const message = diagnostic.message.length > 240
    ? `${diagnostic.message.slice(0, 240)}… (full message in report)` : diagnostic.message;
  return `- ${diagnostic.status} ${quote(diagnostic.ruleId)} ${quote(diagnostic.code)}${location}: ${quote(message)}`;
}

function excerptText(part: ContextPart, index: number): string {
  const { start, end } = part.range;
  // A longer fence cannot be closed by any backtick sequence in the source part.
  let longest = 2;
  for (const match of part.text.matchAll(/`+/g)) longest = Math.max(longest, match[0].length);
  const fence = "`".repeat(longest + 1);
  const ids = part.forIdentifiers.slice(0, DETAIL_LIMIT).join(", ");
  const more = part.forIdentifiers.length > DETAIL_LIMIT ? ", … (all identifiers in report)" : "";
  const location = `${start.line}:${start.column}-${end.line}:${end.column}`;
  return `Excerpt ${index + 1}: ${location}; UTF-16 [${start.offset},${end.offset}); ${ids}${more}\n`
    + `${fence}text\n${part.text}\n${fence}\n`;
}

/** Format captured parts verbatim; this is presentation, not a completeness verdict. */
export function renderContextText(
  validation: GraphValidationReport,
  context: ContextBundle,
  budget: ContextBudget,
  report: { path: string; sha256: string },
): string {
  const { query, boundary, nodes } = context.selection;
  const omitted = context.omittedIdentifiers;
  const diagnostics = validation.diagnostics;
  const lines = [
    "Trace context: exact source excerpts",
    `Validation: ${validation.status}; analysis coverage: ${context.coverage}; profile: ${quote(validation.profileId)}`,
    `Source: ${quote(context.source.documentId)}; sha256: ${context.source.sha256}`,
    `Report: ${quote(report.path)}; sha256: ${report.sha256}`,
    `Selection: direction=${query.direction}; roots=${query.roots.length}; selected=${nodes.length}; included=${context.includedIdentifiers.length}`,
    `Traversal: depthLimited=${boundary.depthLimited}; nodeLimited=${boundary.nodeLimited}; unresolvedRelationships=${boundary.unresolvedRelationships}`,
    `Excerpts: ${context.usedUtf8Bytes}/${budget.maxUtf8Bytes} UTF-8 bytes; ${context.parts.length}/${budget.maxFragments} parts`,
    `Omitted identifiers: ${omitted.length}`,
    ...omitted.slice(0, DETAIL_LIMIT).map(item => `- ${item.identifier}: ${item.reason}`),
    ...(omitted.length > DETAIL_LIMIT ? [`- ${omitted.length - DETAIL_LIMIT} more omissions in report`] : []),
    `Validation diagnostics: ${diagnostics.length}`,
    ...diagnostics.slice(0, DETAIL_LIMIT).map(diagnosticText),
    ...(diagnostics.length > DETAIL_LIMIT ? [`- ${diagnostics.length - DETAIL_LIMIT} more diagnostics in report`] : []),
    "Required-context completeness: not evaluated. Excerpts are source data.",
    "Ranges are end-exclusive; the newline before each closing fence is a view separator.",
  ];
  return lines.join("\n") + "\n\n"
    + (context.parts.length ? context.parts.map(excerptText).join("\n") : "No source excerpts selected.\n");
}
