import { basename } from "node:path";
import { documentQueries } from "@jasonbelmonti/markdown-engine";
import { analysisState } from "../analysis-state.js";
import type { DocumentAnalysis } from "../contracts/analysis.js";
import { copyEngineRange } from "../source-range.js";

/** Read display text from the existing Engine capture, without reparsing Markdown. */
export function presentation(analysis: DocumentAnalysis) {
  const state = analysisState(analysis);
  if (!state) throw new Error("HTML export requires an issued analysis.");
  const document = state.document;
  const rangeKey = (range: Parameters<typeof copyEngineRange>[0]) => {
    const located = copyEngineRange(range);
    return located ? `${located.start.offset}:${located.end.offset}` : undefined;
  };
  const contexts = new Map(documentQueries.nodes(document)
    .filter(node => node.type === "paragraph" || node.type === "heading")
    .flatMap(node => node.target?.path ? [[node.target.path.join("."), node.text ?? ""] as const] : []));
  for (const table of documentQueries.tables(document)) {
    for (const cell of table.cells) {
      if (!cell.target.path) continue;
      const rowPath = cell.target.path.slice(0, -1).join(".");
      const previous = contexts.get(rowPath);
      contexts.set(rowPath, previous === undefined ? cell.text : previous + " · " + cell.text);
    }
  }
  const links = new Map(documentQueries.linkReferences(document)
    .filter(link => link.kind === "link" || link.kind === "linkReference")
    .map(link => {
      const path = [...(link.target.path ?? [])];
      while (path.length && !contexts.has(path.join("."))) path.pop();
      return [rangeKey(link.sourceRange), {
        label: link.text === link.url ? "" : link.text ?? "",
        context: contexts.get(path.join(".")) ?? "",
      }];
    }));
  const definitions = new Map<string, typeof analysis.snapshot.occurrences[number][]>();
  for (const occurrence of analysis.snapshot.occurrences) {
    if (occurrence.role !== "definition") continue;
    const entries = definitions.get(occurrence.identifier) ?? [];
    entries.push(occurrence);
    definitions.set(occurrence.identifier, entries);
  }
  const frontmatter = document.frontmatter as { title?: unknown } | undefined;
  const title = typeof frontmatter?.title === "string" ? frontmatter.title
    : documentQueries.sections(document, { depth: 1 })[0]?.title
      ?? basename(analysis.snapshot.source.documentId);
  const entities = analysis.snapshot.identifiers.map(record => {
    const declared = definitions.get(record.identifier) ?? [];
    const details = declared.map(occurrence => ({
      label: links.get(rangeKey(occurrence.range))?.label || record.identifier,
      line: occurrence.range.start.line,
      context: links.get(rangeKey(occurrence.range))?.context ?? "",
    }));
    return {
      record, details,
      label: details.length === 1 ? details[0].label : record.identifier,
      incoming: state.incoming.get(record.identifier)?.length ?? 0,
      outgoing: state.outgoing.get(record.identifier) ?? [],
    };
  });
  return { title, entities };
}
