import type { MarkdownScanFacts } from "../markdown/index.js";

export type ReferenceKey = `${string}\0${string}`;

export function buildReferenceIndex(
  scanFacts: MarkdownScanFacts,
): ReadonlySet<ReferenceKey> {
  const keys = new Set<ReferenceKey>();

  for (const reference of scanFacts.references) {
    keys.add(toReferenceKey(reference.sourceEntityId, reference.label));
  }

  for (const range of scanFacts.ranges) {
    for (const label of range.expandsTo) {
      keys.add(toReferenceKey(range.sourceEntityId, label));
    }
  }

  return keys;
}

export function toReferenceKey(sourceEntityId: string, label: string): ReferenceKey {
  return `${sourceEntityId}\0${label}`;
}
