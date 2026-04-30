export interface SourceLine {
  readonly number: number;
  readonly text: string;
}

interface FenceMarker {
  readonly marker: "`" | "~";
  readonly length: number;
}

const headingPattern = /^ {0,3}(#{1,6})\s+/;
const fencePattern = /^ {0,3}(`{3,}|~{3,})/;

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

export function getMarkdownContentLines(
  lines: readonly SourceLine[],
): readonly SourceLine[] {
  const contentLines = new Array<SourceLine>();
  let openFence: FenceMarker | undefined;

  for (const line of lines) {
    const fence = parseFence(line.text);

    if (openFence !== undefined) {
      if (isClosingFence(fence, openFence)) {
        openFence = undefined;
      }

      continue;
    }

    if (fence !== undefined) {
      openFence = fence;
      continue;
    }

    contentLines.push(line);
  }

  return contentLines;
}

export function isHeadingLine(text: string): boolean {
  return getHeadingLevel(text) !== undefined;
}

function findNextSectionBoundaryIndex(
  lines: readonly SourceLine[],
  startIndex: number,
  sectionLevel: number | undefined,
): number {
  let openFence: FenceMarker | undefined;

  for (let index = startIndex; index < lines.length; index += 1) {
    const fence = parseFence(lines[index].text);

    if (openFence !== undefined) {
      if (isClosingFence(fence, openFence)) {
        openFence = undefined;
      }

      continue;
    }

    if (fence !== undefined) {
      openFence = fence;
      continue;
    }

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

function isClosingFence(
  fence: FenceMarker | undefined,
  openFence: FenceMarker,
): boolean {
  return (
    fence !== undefined &&
    fence.marker === openFence.marker &&
    fence.length >= openFence.length
  );
}
