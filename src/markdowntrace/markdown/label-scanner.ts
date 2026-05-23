export interface ObservedRange {
  readonly labelFamily: string;
  readonly start: string;
  readonly end: string;
}

export interface ParsedLabel {
  readonly family: string;
  readonly sequence: number;
  readonly width: number;
}

export function labelFamily(label: string): string | undefined {
  return parseLabel(label)?.family;
}

export function parseLabel(label: string): ParsedLabel | undefined {
  const match = label.match(/^([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)-(\d+)$/);

  if (match === null) {
    return undefined;
  }

  return {
    family: match[1],
    sequence: Number.parseInt(match[2], 10),
    width: match[2].length,
  };
}

export function scanLabels(text: string, labelFamilies: readonly string[]): readonly string[] {
  if (labelFamilies.length === 0) {
    return [];
  }

  return uniqueSorted(
    [...text.matchAll(labelPattern(labelFamilies))]
      .map((match) => match.groups?.label)
      .filter((label): label is string => label !== undefined),
  );
}

export function scanRanges(
  text: string,
  labelFamilies: readonly string[],
): readonly ObservedRange[] {
  if (labelFamilies.length === 0) {
    return [];
  }

  return uniqueRanges(
    [...text.matchAll(rangePattern(labelFamilies))].flatMap((match) => {
      const { start, end } = match.groups ?? {};

      if (start === undefined || end === undefined) {
        return [];
      }

      const family = labelFamily(start);

      if (family === undefined || labelFamily(end) !== family) {
        return [];
      }

      return [{ labelFamily: family, start, end }];
    }),
  );
}

function labelPattern(labelFamilies: readonly string[]): RegExp {
  return new RegExp(
    `(^|[^A-Za-z0-9-])(?<label>${familyAlternation(labelFamilies)}-\\d+)(?![A-Za-z0-9-])`,
    "g",
  );
}

function rangePattern(labelFamilies: readonly string[]): RegExp {
  const label = `${familyAlternation(labelFamilies)}-\\d+`;

  return new RegExp(
    `(^|[^A-Za-z0-9-])(?<start>${label})\\s+through\\s+(?<end>${label})(?![A-Za-z0-9-])`,
    "g",
  );
}

function familyAlternation(labelFamilies: readonly string[]): string {
  return `(?:${labelFamilies.map(escapeRegExp).join("|")})`;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function uniqueRanges(ranges: readonly ObservedRange[]): readonly ObservedRange[] {
  return [
    ...new Map(
      ranges.map((range) => [`${range.labelFamily}\u0000${range.start}\u0000${range.end}`, range]),
    ).values(),
  ].sort((left, right) =>
    `${left.labelFamily}\u0000${left.start}\u0000${left.end}`.localeCompare(
      `${right.labelFamily}\u0000${right.start}\u0000${right.end}`,
    ),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
