import type { EntityRegistry } from "../registry/index.js";
import type { SourceLine } from "./lineScanning.js";
import { findLabelMatches, registeredLabelFamilies } from "./labelMatching.js";
import type { MarkdownDefinitionFact, MarkdownReferenceFact } from "./types.js";

export function findReferences(
  lines: readonly SourceLine[],
  definition: MarkdownDefinitionFact,
  registry: EntityRegistry,
): readonly MarkdownReferenceFact[] {
  const references = new Array<MarkdownReferenceFact>();
  const labelFamilies = registeredLabelFamilies(registry);

  for (const match of findLabelMatches(lines)) {
    const entity = registry.entitiesByLabel.get(match.label);

    if (entity !== undefined) {
      references.push(toRegisteredReference(definition, match.line, entity.label, entity.id));
    } else if (labelFamilies.has(match.family)) {
      references.push(toUnregisteredReference(definition, match.line, match.label));
    }
  }

  return references;
}

function toRegisteredReference(
  definition: MarkdownDefinitionFact,
  line: SourceLine,
  label: string,
  targetEntityId: string,
): MarkdownReferenceFact {
  return {
    sourceEntityId: definition.entityId,
    label,
    targetEntityId,
    line: line.number,
    text: line.text,
  };
}

function toUnregisteredReference(
  definition: MarkdownDefinitionFact,
  line: SourceLine,
  label: string,
): MarkdownReferenceFact {
  return {
    sourceEntityId: definition.entityId,
    label,
    line: line.number,
    text: line.text,
  };
}
