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

interface ObservedRange {
  readonly labelFamily: string;
  readonly start: string;
  readonly end: string;
}

function collectLabelFamilies(registry: EntityRegistry): readonly string[] {
  return uniqueSorted(
    registry.entities.flatMap((entity) => {
      const family = labelFamily(entity.label);
      return family === undefined ? [] : [family];
    }),
  );
}

function scanLabels(text: string, labelFamilies: readonly string[]): readonly string[] {
  if (labelFamilies.length === 0) {
    return [];
  }

  return uniqueSorted(
    [...text.matchAll(labelPattern(labelFamilies))]
      .map((match) => match.groups?.label)
      .filter((label): label is string => label !== undefined),
  );
}

function scanRanges(
  text: string,
  labelFamilies: readonly string[],
): readonly ObservedRange[] {
  if (labelFamilies.length === 0) {
    return [];
  }

  return uniqueRanges(
    [...text.matchAll(rangePattern(labelFamilies))].flatMap((match) => {
      const { start, end } = match.groups ?? {};

      if (start === undefined || end === undefined) {
        return [];
      }

      const family = labelFamily(start);

      if (family === undefined || labelFamily(end) !== family) {
        return [];
      }

      return [{ labelFamily: family, start, end }];
    }),
  );
}

function labelFamily(label: string): string | undefined {
  return label.match(/^([A-Z]+)-\d+$/)?.[1];
}

function labelPattern(labelFamilies: readonly string[]): RegExp {
  return new RegExp(
    `(^|[^A-Za-z0-9-])(?<label>${familyAlternation(labelFamilies)}-\\d+)(?![A-Za-z0-9-])`,
    "g",
  );
}

function rangePattern(labelFamilies: readonly string[]): RegExp {
  const label = `${familyAlternation(labelFamilies)}-\\d+`;

  return new RegExp(
    `(^|[^A-Za-z0-9-])(?<start>${label})\\s+through\\s+(?<end>${label})(?![A-Za-z0-9-])`,
    "g",
  );
}

function familyAlternation(labelFamilies: readonly string[]): string {
  return `(?:${labelFamilies.map(escapeRegExp).join("|")})`;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function uniqueRanges(ranges: readonly ObservedRange[]): readonly ObservedRange[] {
  return [
    ...new Map(
      ranges.map((range) => [`${range.labelFamily}\u0000${range.start}\u0000${range.end}`, range]),
    ).values(),
  ].sort((left, right) =>
    `${left.labelFamily}\u0000${left.start}\u0000${left.end}`.localeCompare(
      `${right.labelFamily}\u0000${right.start}\u0000${right.end}`,
    ),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
