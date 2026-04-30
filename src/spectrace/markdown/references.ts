import type { EntityRegistry } from "../registry/index.js";
import type { SourceLine } from "./lineScanning.js";
import type { MarkdownDefinitionFact, MarkdownReferenceFact } from "./types.js";

const labelPattern = /\b[A-Z]+-\d+\b/g;

export function findReferences(
  lines: readonly SourceLine[],
  definition: MarkdownDefinitionFact,
  registry: EntityRegistry,
): readonly MarkdownReferenceFact[] {
  const references = new Array<MarkdownReferenceFact>();

  for (const line of lines) {
    for (const match of line.text.matchAll(labelPattern)) {
      const entity = registry.entitiesByLabel.get(match[0]);

      if (entity === undefined) {
        continue;
      }

      references.push({
        sourceEntityId: definition.entityId,
        label: entity.label,
        targetEntityId: entity.id,
        line: line.number,
        text: line.text,
      });
    }
  }

  return references;
}
