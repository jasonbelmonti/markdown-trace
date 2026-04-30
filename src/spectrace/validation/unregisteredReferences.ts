import type { MarkdownScanFacts } from "../markdown/index.js";
import type { EntityRegistry } from "../registry/index.js";
import type { ValidationFinding } from "./types.js";

export function findUnregisteredReferences(
  registry: EntityRegistry,
  scanFacts: MarkdownScanFacts,
): readonly ValidationFinding[] {
  const findings = scanFacts.references
    .filter((reference) => reference.targetEntityId === undefined)
    .map<ValidationFinding>((reference) => ({
      category: "missing-reference",
      entityId: reference.sourceEntityId,
      label: reference.label,
      line: reference.line,
      message: `${reference.sourceEntityId} references unregistered label ${reference.label}`,
    }));

  for (const range of scanFacts.ranges) {
    for (const label of range.expandsTo) {
      if (registry.entitiesByLabel.has(label)) {
        continue;
      }

      findings.push({
        category: "missing-reference",
        entityId: range.sourceEntityId,
        label,
        line: range.line,
        message: `${range.sourceEntityId} range references unregistered label ${label}`,
      });
    }
  }

  return findings;
}
