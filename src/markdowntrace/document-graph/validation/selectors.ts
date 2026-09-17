import { documentQueries } from "@jasonbelmonti/markdown-engine";
import type { SourceSelector } from "../contracts/validation-profile.js";
import type { SourceRange } from "../contracts/source.js";
import type { Extraction } from "../extraction-model.js";
import { contains, requiredRange } from "./source.js";

export function selectTargets(
  document: Extraction["document"],
  select: SourceSelector,
) {
  const scopes =
    select.section === undefined
      ? null
      : documentQueries
          .sections(document, { title: select.section })
          .flatMap((section) => [section.headingTarget, ...section.bodyTargets])
          .map((target) => requiredRange(target.sourceRange));
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
