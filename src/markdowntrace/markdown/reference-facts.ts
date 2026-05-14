import type { EngineDocument } from "@jasonbelmonti/markdown-engine";

import type { EntityRegistry } from "../registry/index.js";
import type {
  MarkdownDefinitionFact,
  MarkdownLabelReferenceFact,
  MarkdownRangeReferenceFact,
} from "./model.js";
import { sectionBodySourceSlices } from "./source-slices.js";

export function collectLabelReferences(
  registry: EntityRegistry,
  document: EngineDocument,
  definitions: readonly MarkdownDefinitionFact[],
): readonly MarkdownLabelReferenceFact[] {
  const labels = registry.entities.map((entity) => entity.label);

  return definitions.flatMap((definition) =>
    sectionBodySourceSlices(document, definition).flatMap((slice) =>
      labels
        .filter((label) => hasLabel(slice.text, label))
        .map((label) => ({
          sourceEntityId: definition.entityId,
          label,
          targetId: slice.targetId,
          text: slice.text,
          sourceRange: slice.range,
        })),
    ),
  );
}

export function collectRangeReferences(
  registry: EntityRegistry,
  document: EngineDocument,
  definitions: readonly MarkdownDefinitionFact[],
): readonly MarkdownRangeReferenceFact[] {
  return definitions.flatMap((definition) => {
    const entity = registry.entitiesById.get(definition.entityId);

    if (entity === undefined) {
      return [];
    }

    return sectionBodySourceSlices(document, definition).flatMap((slice) =>
      entity.expectedReferences.ranges
        .filter((range) => hasBoundedRange(slice.text, range.start, range.end))
        .map((range) => ({
          sourceEntityId: definition.entityId,
          labelFamily: range.labelFamily,
          start: range.start,
          end: range.end,
          expandsTo: range.expandsTo,
          targetId: slice.targetId,
          text: slice.text,
          sourceRange: slice.range,
        })),
    );
  });
}

function hasLabel(text: string, label: string): boolean {
  return labelPattern(label).test(text);
}

function hasBoundedRange(text: string, start: string, end: string): boolean {
  const startMatch = labelPattern(start).exec(text);

  if (startMatch === null) {
    return false;
  }

  const endMatch = labelPattern(end).exec(text.slice(startMatch.index + startMatch[0].length));
  return endMatch !== null;
}

function labelPattern(label: string): RegExp {
  return new RegExp(`(^|[^A-Za-z0-9-])${escapeRegExp(label)}(?![A-Za-z0-9-])`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
