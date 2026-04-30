export interface SourceLine {
  readonly number: number;
  readonly text: string;
}

const headingPattern = /^#{1,6}\s+/;

export function toSourceLines(text: string): readonly SourceLine[] {
  return text.split(/\r?\n/).map((line, index) => ({
    number: index + 1,
    text: line,
  }));
}

export function getSectionBody(
  lines: readonly SourceLine[],
  headingLine: number,
): readonly SourceLine[] {
  const startIndex = headingLine;
  const endIndex = findNextHeadingIndex(lines, startIndex);

  return lines.slice(startIndex, endIndex);
}

function findNextHeadingIndex(lines: readonly SourceLine[], startIndex: number): number {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (headingPattern.test(lines[index].text)) {
      return index;
    }
  }

  return lines.length;
}
