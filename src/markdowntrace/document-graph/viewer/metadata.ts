import { documentQueries, type EngineDocument } from "@jasonbelmonti/markdown-engine";
import { copyEngineRange } from "../source-range.js";
import type { SourceRange } from "../contracts/source.js";
import type { ViewerField } from "./contracts.js";

const key = (range: SourceRange) => `${range.start.offset}:${range.end.offset}`;
const labelHeaders = new Set(["name", "title", "option", "risk", "decision", "question", "check",
  "validation", "component", "description", "criterion", "requirement", "objective", "scenario"]);

/** Structural table fields and link labels come exclusively from Engine. */
export function viewerMetadata(document: EngineDocument) {
  const rows = new Map<string, ViewerField[]>();
  for (const table of documentQueries.tables(document)) {
    const headers = new Map(table.cells.filter(cell => cell.header).map(cell => [cell.columnIndex, cell.text]));
    for (const cell of table.cells.filter(cell => !cell.header)) {
      if (!cell.target.path) continue;
      const rowKey = cell.target.path.slice(0, -1).join(".");
      const fields = rows.get(rowKey) ?? [];
      fields.push({ name: headers.get(cell.columnIndex) ?? `Column ${cell.columnIndex + 1}`,
        value: cell.text, range: copyEngineRange(cell.sourceRange) });
      rows.set(rowKey, fields);
    }
  }
  const links = new Map<string, { label: string; fields: ViewerField[] }>();
  for (const link of documentQueries.linkReferences(document)) {
    if (link.kind !== "link" && link.kind !== "linkReference") continue;
    const range = copyEngineRange(link.sourceRange);
    if (!range) continue;
    const path = [...(link.target.path ?? [])];
    while (path.length && !rows.has(path.join("."))) path.pop();
    links.set(key(range), { label: link.text === link.url ? "" : link.text ?? "",
      fields: rows.get(path.join(".")) ?? [] });
  }
  return (range: SourceRange) => links.get(key(range)) ?? { label: "", fields: [] };
}

export function readableLabel(id: string, label: string, fields: ViewerField[]): string {
  const text = label && label !== id ? label : fields.find(field => labelHeaders.has(field.name.trim().toLowerCase())
    && field.value.trim() && field.value.trim() !== id)?.value ?? id;
  // The complete text stays in source evidence; repeated large table names cannot inflate every node.
  return text.length > 240 ? text.slice(0, 240).replace(/[\uD800-\uDBFF]$/, "") + "…" : text;
}

export function explicitlySelected(fields: ViewerField[]): boolean {
  const statuses = fields.filter(field => field.name.trim().toLowerCase() === "status");
  return statuses.length === 1 && statuses[0].value.trim().toLowerCase() === "selected";
}
