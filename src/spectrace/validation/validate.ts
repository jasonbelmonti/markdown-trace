import type { EntityRegistry } from "../registry/index.js";
import type { MarkdownScanFacts } from "../markdown/index.js";
import { findMissingDefinitions } from "./missingDefinitions.js";
import { findMissingEdgeTargets } from "./missingEdgeTargets.js";
import { findMissingReferences } from "./missingReferences.js";
import type { ValidationResult } from "./types.js";

export function validate(
  registry: EntityRegistry,
  scanFacts: MarkdownScanFacts,
): ValidationResult {
  const findings = [
    ...findMissingDefinitions(registry, scanFacts),
    ...findMissingReferences(registry, scanFacts),
    ...findMissingEdgeTargets(registry),
  ];

  return {
    status: findings.length === 0 ? "passed" : "failed",
    findings,
    summary: {
      registeredEntityCount: registry.entities.length,
      scannedDefinitionCount: scanFacts.definitions.length,
      scannedReferenceCount: scanFacts.references.length,
      scannedRangeCount: scanFacts.ranges.length,
      findingCount: findings.length,
    },
  };
}
