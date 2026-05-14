import type { MarkdownAdapterFacts } from "../markdown/index.js";
import type { ExpectedRange } from "../registry/index.js";

export function hasLabelReference(
  adapterFacts: MarkdownAdapterFacts,
  entityId: string,
  label: string,
): boolean {
  return adapterFacts.labelReferences.some(
    (reference) => reference.sourceEntityId === entityId && reference.label === label,
  );
}

export function hasExpandedRangeReference(
  adapterFacts: MarkdownAdapterFacts,
  entityId: string,
  label: string,
): boolean {
  return adapterFacts.rangeReferences.some(
    (reference) =>
      reference.sourceEntityId === entityId && reference.expandsTo.includes(label),
  );
}

export function hasRangeReference(
  adapterFacts: MarkdownAdapterFacts,
  entityId: string,
  range: ExpectedRange,
): boolean {
  return adapterFacts.rangeReferences.some(
    (reference) =>
      reference.sourceEntityId === entityId &&
      reference.labelFamily === range.labelFamily &&
      reference.start === range.start &&
      reference.end === range.end &&
      sameValues(reference.expandsTo, range.expandsTo),
  );
}

function sameValues(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
