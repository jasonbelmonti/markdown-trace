import type { ExpectedRange, RegistryEntity } from "../registry/index.js";
import type { MarkdownRangeFact } from "../markdown/index.js";
import type { ValidationFinding } from "./types.js";

export function findIncompleteRanges(
  entity: RegistryEntity,
  ranges: readonly MarkdownRangeFact[],
): readonly ValidationFinding[] {
  return entity.expectedReferences.ranges
    .filter((expectedRange) => !hasExpectedRange(entity.id, expectedRange, ranges))
    .map((expectedRange) => ({
      category: "incomplete-range",
      entityId: entity.id,
      label: `${expectedRange.start} through ${expectedRange.end}`,
      message: `${entity.id} (${entity.label}) is expected to reference ${expectedRange.start} through ${expectedRange.end}`,
    }));
}

function hasExpectedRange(
  sourceEntityId: string,
  expectedRange: ExpectedRange,
  ranges: readonly MarkdownRangeFact[],
): boolean {
  return ranges.some(
    (range) =>
      range.sourceEntityId === sourceEntityId &&
      range.labelFamily === expectedRange.labelFamily &&
      range.start === expectedRange.start &&
      range.end === expectedRange.end &&
      hasSameItems(range.expandsTo, expectedRange.expandsTo),
  );
}

function hasSameItems(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}
