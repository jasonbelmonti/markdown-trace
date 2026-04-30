import type { EntityRegistry } from "../registry/index.js";
import type { SourceLine } from "./lineScanning.js";
import type { IgnoredIssueKeyFact } from "./types.js";

const labelPattern = /\b[A-Z]+-\d+\b/g;

export function findIgnoredIssueKeys(
  lines: readonly SourceLine[],
  registry: EntityRegistry,
): readonly IgnoredIssueKeyFact[] {
  const ignoredIssueKeys = new Array<IgnoredIssueKeyFact>();

  for (const line of lines) {
    for (const match of line.text.matchAll(labelPattern)) {
      if (registry.entitiesByLabel.has(match[0])) {
        continue;
      }

      ignoredIssueKeys.push({
        key: match[0],
        line: line.number,
        text: line.text,
      });
    }
  }

  return ignoredIssueKeys;
}
