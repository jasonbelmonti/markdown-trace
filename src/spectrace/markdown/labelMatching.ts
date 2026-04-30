import type { EntityRegistry } from "../registry/index.js";
import type { SourceLine } from "./lineScanning.js";

const labelPattern = /\b([A-Z]+)-\d+\b/g;

export interface LabelMatch {
  readonly family: string;
  readonly label: string;
  readonly line: SourceLine;
}

export function findLabelMatches(lines: readonly SourceLine[]): readonly LabelMatch[] {
  const matches = new Array<LabelMatch>();

  for (const line of lines) {
    for (const match of line.text.matchAll(labelPattern)) {
      matches.push({
        family: match[1],
        label: match[0],
        line,
      });
    }
  }

  return matches;
}

export function registeredLabelFamilies(registry: EntityRegistry): ReadonlySet<string> {
  return new Set(registry.entities.map((entity) => entity.label.split("-")[0]));
}
