import type { RegistryEntity } from "../registry/index.js";
import type { MarkdownScanFacts } from "../markdown/index.js";
import { findIncompleteRanges } from "./incompleteRanges.js";
import { findMissingLabelReferences } from "./missingLabelReferences.js";
import { buildReferenceIndex } from "./referenceIndex.js";
import { findUnregisteredReferences } from "./unregisteredReferences.js";
import type { ValidationFinding } from "./types.js";

export function findMissingReferences(
  entities: readonly RegistryEntity[],
  scanFacts: MarkdownScanFacts,
): readonly ValidationFinding[] {
  const findings = [...findUnregisteredReferences(scanFacts.references)];
  const referenceKeys = buildReferenceIndex(scanFacts);

  for (const entity of entities) {
    findings.push(...findMissingLabelReferences(entity, referenceKeys));
    findings.push(...findIncompleteRanges(entity, scanFacts.ranges));
  }

  return findings;
}
