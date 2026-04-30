import type { RegistryEntity } from "../registry/index.js";
import type { MarkdownDefinitionFact } from "./types.js";
import {
  getMarkdownContentLines,
  isHeadingLine,
  type SourceLine,
} from "./lineScanning.js";

export function findDefinitions(
  lines: readonly SourceLine[],
  entities: readonly RegistryEntity[],
): readonly MarkdownDefinitionFact[] {
  const definitions = new Array<MarkdownDefinitionFact>();
  const definitionLines = findDefinitionLines(lines);

  for (const entity of entities) {
    for (const line of definitionLines) {
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

function findDefinitionLines(lines: readonly SourceLine[]): readonly SourceLine[] {
  const definitionLines = new Array<SourceLine>();

  for (const line of getMarkdownContentLines(lines)) {
    if (isHeadingLine(line.text)) {
      definitionLines.push(line);
    }
  }

  return definitionLines;
}
