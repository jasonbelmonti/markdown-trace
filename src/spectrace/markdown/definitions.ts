import type { RegistryEntity } from "../registry/index.js";
import type { MarkdownDefinitionFact } from "./types.js";
import { isHeadingLine, type SourceLine } from "./lineScanning.js";

interface FenceMarker {
  readonly marker: "`" | "~";
  readonly length: number;
}

const fencePattern = /^ {0,3}(`{3,}|~{3,})/;

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
  let openFence: FenceMarker | undefined;

  for (const line of lines) {
    const fence = parseFence(line.text);

    if (openFence !== undefined) {
      if (
        fence !== undefined &&
        fence.marker === openFence.marker &&
        fence.length >= openFence.length
      ) {
        openFence = undefined;
      }

      continue;
    }

    if (fence !== undefined) {
      openFence = fence;
      continue;
    }

    if (isHeadingLine(line.text)) {
      definitionLines.push(line);
    }
  }

  return definitionLines;
}

function parseFence(text: string): FenceMarker | undefined {
  const match = text.match(fencePattern);
  const fenceText = match?.[1];

  if (fenceText === undefined) {
    return undefined;
  }

  return {
    marker: fenceText[0] as "`" | "~",
    length: fenceText.length,
  };
}
