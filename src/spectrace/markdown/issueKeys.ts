import type { EntityRegistry } from "../registry/index.js";
import type { SourceLine } from "./lineScanning.js";
import { findLabelMatches, registeredLabelFamilies } from "./labelMatching.js";
import type { IgnoredIssueKeyFact } from "./types.js";

export function findIgnoredIssueKeys(
  lines: readonly SourceLine[],
  registry: EntityRegistry,
): readonly IgnoredIssueKeyFact[] {
  const ignoredIssueKeys = new Array<IgnoredIssueKeyFact>();
  const labelFamilies = registeredLabelFamilies(registry);

  for (const match of findLabelMatches(lines)) {
    if (registry.entitiesByLabel.has(match.label) || labelFamilies.has(match.family)) {
      continue;
    }

    ignoredIssueKeys.push({
      key: match.label,
      line: match.line.number,
      text: match.line.text,
    });
  }

  return ignoredIssueKeys;
}
