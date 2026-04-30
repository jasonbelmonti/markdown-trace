import type { SourceLine } from "./lineScanning.js";
import type { MarkdownDefinitionFact, MarkdownRangeFact } from "./types.js";

const rangePattern = /\b([A-Z]+)-(\d+)\s+through\s+([A-Z]+)-(\d+)\b/g;

export function findRanges(
  lines: readonly SourceLine[],
  definition: MarkdownDefinitionFact,
): readonly MarkdownRangeFact[] {
  const ranges = new Array<MarkdownRangeFact>();

  for (const line of lines) {
    for (const match of line.text.matchAll(rangePattern)) {
      const range = toRangeFact(match, line, definition);

      if (range !== undefined) {
        ranges.push(range);
      }
    }
  }

  return ranges;
}

function toRangeFact(
  match: RegExpMatchArray,
  line: SourceLine,
  definition: MarkdownDefinitionFact,
): MarkdownRangeFact | undefined {
  const [, startFamily, startNumberText, endFamily, endNumberText] = match;

  if (startFamily !== endFamily) {
    return undefined;
  }

  const startNumber = Number.parseInt(startNumberText, 10);
  const endNumber = Number.parseInt(endNumberText, 10);

  return {
    sourceEntityId: definition.entityId,
    labelFamily: startFamily,
    start: `${startFamily}-${startNumber}`,
    end: `${endFamily}-${endNumber}`,
    expandsTo: expandRange(startFamily, startNumber, endNumber),
    line: line.number,
    text: line.text,
  };
}

function expandRange(
  labelFamily: string,
  startNumber: number,
  endNumber: number,
): readonly string[] {
  if (endNumber < startNumber) {
    return [];
  }

  return Array.from(
    { length: endNumber - startNumber + 1 },
    (_, offset) => `${labelFamily}-${startNumber + offset}`,
  );
}
