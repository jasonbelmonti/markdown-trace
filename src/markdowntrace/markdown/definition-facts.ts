import type { EngineNode, EngineSection } from "@jasonbelmonti/markdown-engine";

import type { EntityRegistry, RegistryEntity } from "../registry/index.js";
import type { MarkdownDefinitionFact } from "./model.js";

export function collectDefinitions(
  registry: EntityRegistry,
  headings: readonly EngineNode[],
  sections: readonly EngineSection[],
): readonly MarkdownDefinitionFact[] {
  return registry.entities.flatMap((entity) => {
    const heading = findDefinitionHeading(entity, headings);

    if (heading?.target === undefined) {
      return [];
    }

    const section = sections.find((candidate) => candidate.headingTarget.id === heading.target?.id);

    return [
      {
        entityId: entity.id,
        label: entity.label,
        kind: entity.defines.kind,
        text: entity.defines.text,
        targetId: heading.target.id,
        sectionTargetId: section?.target.id,
        sourceRange: heading.sourceRange,
      },
    ];
  });
}

function findDefinitionHeading(
  entity: RegistryEntity,
  headings: readonly EngineNode[],
): EngineNode | undefined {
  if (entity.defines.kind !== "heading") {
    return undefined;
  }

  return headings.find((heading) => heading.source?.text === entity.defines.text);
}
