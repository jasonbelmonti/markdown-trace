import type { ContextPart } from "../contracts/context.js";
import type { Identifier, SourceRange } from "../contracts/source.js";
import { mergeRanges } from "./ranges.js";

export type ContextRole = "owned-content" | "heading" | "table-header";
export interface ContextClaim {
  readonly range: SourceRange;
  readonly identifier: Identifier;
  readonly role: ContextRole;
}
const roleOrder: readonly ContextRole[] = ["owned-content", "heading", "table-header"];

/** Union only overlapping source ranges. Touching ranges remain separate parts. */
export function projectIntervals(
  text: string,
  claims: readonly ContextClaim[],
  selectionOrder: readonly Identifier[],
): { parts: ContextPart[]; usedUtf8Bytes: number } {
  const parts: ContextPart[] = mergeRanges(claims).map(({ range, claims: members }) => ({
    range,
    text: text.slice(range.start.offset, range.end.offset),
    forIdentifiers: selectionOrder.filter(identifier => members.some(member => member.identifier === identifier)) as [Identifier, ...Identifier[]],
    roles: roleOrder.filter(role => members.some(member => member.role === role)) as [ContextRole, ...ContextRole[]],
  }));
  return { parts, usedUtf8Bytes: parts.reduce((total, part) => total + Buffer.byteLength(part.text), 0) };
}
