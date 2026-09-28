import type { SourceRange } from "../contracts/source.js";

/** Merge overlapping intervals only; preserve every claim on the resulting part. */
export function mergeRanges<T extends { readonly range: SourceRange }>(claims: readonly T[]):
  { range: SourceRange; claims: T[] }[] {
  const parts: { range: SourceRange; claims: T[] }[] = [];
  for (const claim of [...claims].sort((a, b) =>
    a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset)) {
    const last = parts.at(-1);
    if (last && claim.range.start.offset < last.range.end.offset) {
      if (claim.range.end.offset > last.range.end.offset)
        last.range = { start: last.range.start, end: claim.range.end };
      last.claims.push(claim);
    } else parts.push({ range: claim.range, claims: [claim] });
  }
  return parts;
}
