import type { MarkdownScanFacts } from "../markdown/index.js";
import type { EntityRegistry } from "../registry/index.js";
import { findIncompleteRanges } from "./incompleteRanges.js";
import { findMissingLabelReferences } from "./missingLabelReferences.js";
import { buildReferenceIndex } from "./referenceIndex.js";
import { findUnregisteredReferences } from "./unregisteredReferences.js";
import type { ValidationFinding } from "./types.js";

export function findMissingReferences(
  registry: EntityRegistry,
  scanFacts: MarkdownScanFacts,
): readonly ValidationFinding[] {
  const findings = [...findUnregisteredReferences(registry, scanFacts)];
  const referenceKeys = buildReferenceIndex(registry, scanFacts);

  for (const entity of registry.entities) {
    findings.push(...findMissingLabelReferences(entity, referenceKeys));
    findings.push(...findIncompleteRanges(entity, scanFacts.ranges));
  }

  return findings;
}
