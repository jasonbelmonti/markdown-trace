import { documentQueries } from "@jasonbelmonti/markdown-engine";
import type { SourceSelector } from "../contracts/validation-profile.js";
import type { SourceRange } from "../contracts/source.js";
import type { Extraction } from "../extraction-model.js";
import { contains, requiredRange } from "./source.js";

export function selectTargets(
  document: Extraction["document"],
  select: SourceSelector,
) {
  const scopes = sectionRanges(document, select.section);
  const within = (range: SourceRange) =>
    scopes === null || scopes.some((scope) => contains(scope, range));
  if (select.target === "node") {
    return documentQueries
      .nodes(document, { type: select.nodeType })
      .map((node) => ({
        text: node.text ?? "",
        sourceRange: requiredRange(node.sourceRange),
      }))
      .filter((node) => within(node.sourceRange))
      .sort((a, b) => a.sourceRange.start.offset - b.sourceRange.start.offset);
  }
  return documentQueries
    .tables(document)
    .filter((table) => within(requiredRange(table.target.sourceRange)))
    .flatMap((table) => {
      const columns = new Set(
        table.cells
          .filter((cell) => cell.header && cell.text === select.column)
          .map((cell) => cell.columnIndex),
      );
      return table.cells
        .filter((cell) => !cell.header && columns.has(cell.columnIndex))
        .map((cell) => ({
          text: cell.text,
          sourceRange: requiredRange(cell.sourceRange),
        }));
    })
    .sort((a, b) => a.sourceRange.start.offset - b.sourceRange.start.offset);
}

function sectionRanges(
  document: Extraction["document"],
  title: string | undefined,
): SourceRange[] | null {
  if (title === undefined) return null;
  const sections = documentQueries.sections(document);
  const byId = new Map(sections.map((section) => [section.target.id, section]));
  const pending = sections.filter((section) => section.title === title);
  const visited = new Set<string>();
  const ranges: SourceRange[] = [];
  while (pending.length) {
    const section = pending.pop()!;
    if (visited.has(section.target.id)) continue;
    visited.add(section.target.id);
    // Engine section targets locate headings; body and child sections carry scope.
    for (const target of [section.headingTarget, ...section.bodyTargets])
      ranges.push(requiredRange(target.sourceRange));
    for (const child of section.childSections)
      pending.push(byId.get(child.id)!);
  }
  return ranges;
}
