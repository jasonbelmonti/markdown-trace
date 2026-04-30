export interface SourceLine {
  readonly number: number;
  readonly text: string;
}

const headingPattern = /^ {0,3}(#{1,6})\s+/;

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
  const sectionLevel = getHeadingLevel(lines[headingLine - 1]?.text);
  const startIndex = headingLine;
  const endIndex = findNextSectionBoundaryIndex(lines, startIndex, sectionLevel);

  return lines.slice(startIndex, endIndex);
}

function findNextSectionBoundaryIndex(
  lines: readonly SourceLine[],
  startIndex: number,
  sectionLevel: number | undefined,
): number {
  for (let index = startIndex; index < lines.length; index += 1) {
    const candidateLevel = getHeadingLevel(lines[index].text);

    if (
      candidateLevel !== undefined &&
      (sectionLevel === undefined || candidateLevel <= sectionLevel)
    ) {
      return index;
    }
  }

  return lines.length;
}

function getHeadingLevel(text: string | undefined): number | undefined {
  const match = text?.match(headingPattern);
  return match?.[1].length;
}
