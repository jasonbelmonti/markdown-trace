import type { EngineDocument } from "@jasonbelmonti/markdown-engine";

import type { EntityRegistry } from "../registry/index.js";
import type {
  MarkdownDefinitionFact,
  MarkdownLabelReferenceFact,
  MarkdownRangeReferenceFact,
} from "./model.js";
import { labelFamily, scanLabels, scanRanges } from "./label-scanner.js";
import { sectionBodySourceSlices } from "./source-slices.js";

export function collectLabelReferences(
  registry: EntityRegistry,
  document: EngineDocument,
  definitions: readonly MarkdownDefinitionFact[],
): readonly MarkdownLabelReferenceFact[] {
  const labelFamilies = collectLabelFamilies(registry);

  return definitions.flatMap((definition) =>
    sectionBodySourceSlices(document, definition).flatMap((slice) =>
      scanLabels(slice.text, labelFamilies)
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
  const labelFamilies = collectLabelFamilies(registry);

  return definitions.flatMap((definition) => {
    const entity = registry.entitiesById.get(definition.entityId);

    if (entity === undefined) {
      return [];
    }

    return sectionBodySourceSlices(document, definition).flatMap((slice) =>
      scanRanges(slice.text, labelFamilies).map((observedRange) => {
        const declaredRange = entity.expectedReferences.ranges.find(
          (range) => range.start === observedRange.start && range.end === observedRange.end,
        );

        return {
          sourceEntityId: definition.entityId,
          labelFamily: observedRange.labelFamily,
          start: observedRange.start,
          end: observedRange.end,
          declared: declaredRange !== undefined,
          expandsTo: declaredRange?.expandsTo ?? [],
          targetId: slice.targetId,
          text: slice.text,
          sourceRange: slice.range,
        };
      }),
    );
  });
}

function collectLabelFamilies(registry: EntityRegistry): readonly string[] {
  return uniqueSorted(
    registry.entities.flatMap((entity) => {
      const family = labelFamily(entity.label);
      return family === undefined ? [] : [family];
    }),
  );
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}
