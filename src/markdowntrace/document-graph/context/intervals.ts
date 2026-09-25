import type { ContextPart } from "../contracts/context.js";
import type { Identifier, SourceRange } from "../contracts/source.js";

export type ContextRole = "owned-content" | "heading" | "table-header";

export interface ContextClaim {
  readonly range: SourceRange;
  readonly identifier: Identifier;
  readonly role: ContextRole;
}

interface Interval {
  range: SourceRange;
  identifiers: Set<Identifier>;
  roles: Set<ContextRole>;
}

const roleOrder: readonly ContextRole[] = ["owned-content", "heading", "table-header"];

/** Union only ranges with shared source offsets. Touching ranges remain separate parts. */
export function projectIntervals(
  text: string,
  claims: readonly ContextClaim[],
  selectionOrder: readonly Identifier[],
): { parts: ContextPart[]; usedUtf8Bytes: number } {
  const intervals: Interval[] = [];
  const ordered = [...claims].sort(
    (a, b) =>
      a.range.start.offset - b.range.start.offset ||
      a.range.end.offset - b.range.end.offset,
  );
  for (const claim of ordered) {
    const previous = intervals.at(-1);
    if (previous && claim.range.start.offset < previous.range.end.offset) {
      if (claim.range.end.offset > previous.range.end.offset)
        previous.range = { start: previous.range.start, end: claim.range.end };
      previous.identifiers.add(claim.identifier);
      previous.roles.add(claim.role);
    } else {
      intervals.push({
        range: claim.range,
        identifiers: new Set([claim.identifier]),
        roles: new Set([claim.role]),
      });
    }
  }
  const parts: ContextPart[] = intervals.map(({ range, identifiers, roles }) => ({
    range,
    text: text.slice(range.start.offset, range.end.offset),
    forIdentifiers: selectionOrder.filter((identifier) => identifiers.has(identifier)) as [Identifier, ...Identifier[]],
    roles: roleOrder.filter((role) => roles.has(role)) as [ContextRole, ...ContextRole[]],
  }));
  return {
    parts,
    usedUtf8Bytes: parts.reduce((total, part) => total + Buffer.byteLength(part.text), 0),
  };
}
