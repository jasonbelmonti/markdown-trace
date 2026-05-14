import type { MarkdownAdapterFacts, MarkdownRangeReferenceFact } from "../markdown/index.js";
import type { EntityRegistry, ExpectedRange } from "../registry/index.js";

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
  registry: EntityRegistry,
  entityId: string,
  label: string,
): boolean {
  return adapterFacts.rangeReferences.some(
    (reference) =>
      reference.sourceEntityId === entityId &&
      reference.expandsTo.includes(label) &&
      isCompleteRangeReference(registry, reference),
  );
}

export function hasRangeReference(
  adapterFacts: MarkdownAdapterFacts,
  registry: EntityRegistry,
  entityId: string,
  range: ExpectedRange,
): boolean {
  return adapterFacts.rangeReferences.some(
    (reference) =>
      matchesRange(reference, entityId, range) && isCompleteRangeReference(registry, reference),
  );
}

export function hasObservedRangeReference(
  adapterFacts: MarkdownAdapterFacts,
  entityId: string,
  range: ExpectedRange,
): boolean {
  return adapterFacts.rangeReferences.some(
    (reference) =>
      matchesRange(reference, entityId, range),
  );
}

function matchesRange(
  reference: MarkdownRangeReferenceFact,
  entityId: string,
  range: ExpectedRange,
): boolean {
  return (
    reference.sourceEntityId === entityId &&
    reference.labelFamily === range.labelFamily &&
    reference.start === range.start &&
    reference.end === range.end &&
    reference.declared &&
    sameValues(reference.expandsTo, range.expandsTo)
  );
}

function isCompleteRangeReference(
  registry: EntityRegistry,
  reference: MarkdownRangeReferenceFact,
): boolean {
  return [reference.start, reference.end, ...reference.expandsTo].every((label) =>
    registry.entitiesByLabel.has(label),
  );
}

function sameValues(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
