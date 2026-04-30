import type { RegistryEntity } from "../registry/index.js";
import type { MarkdownDefinitionFact } from "./types.js";
import type { SourceLine } from "./lineScanning.js";

export function findDefinitions(
  lines: readonly SourceLine[],
  entities: readonly RegistryEntity[],
): readonly MarkdownDefinitionFact[] {
  const definitions = new Array<MarkdownDefinitionFact>();

  for (const entity of entities) {
    for (const line of lines) {
      if (line.text.trimEnd() !== entity.defines.text) {
        continue;
      }

      definitions.push({
        entityId: entity.id,
        label: entity.label,
        kind: entity.defines.kind,
        text: entity.defines.text,
        line: line.number,
      });
    }
  }

  return definitions.sort((left, right) => left.line - right.line);
}
