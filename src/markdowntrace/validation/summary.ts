import type { MarkdownAdapterFacts } from "../markdown/index.js";
import type { EntityRegistry } from "../registry/index.js";
import type { ValidationSummary } from "./model.js";
import { missingEdgeTargetFindings } from "./findings.js";
import {
  hasExpandedRangeReference,
  hasLabelReference,
  hasRangeReference,
} from "./reference-resolution.js";

export function summarizeValidation(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
  findingCount: number,
): ValidationSummary {
  return {
    entities: registry.entities.length,
    definitionsResolved: adapterFacts.definitions.length,
    expectedReferencesResolved: countResolvedReferences(registry, adapterFacts),
    expectedRangesResolved: countResolvedRanges(registry, adapterFacts),
    edgesResolved: registry.edges.length - missingEdgeTargetFindings(registry).length,
    findings: findingCount,
  };
}

function countResolvedReferences(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): number {
  return registry.entities.reduce(
    (count, entity) =>
      count +
      entity.expectedReferences.labels.filter(
        (label) =>
          hasLabelReference(adapterFacts, entity.id, label) ||
          hasExpandedRangeReference(adapterFacts, entity.id, label),
      ).length,
    0,
  );
}

function countResolvedRanges(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): number {
  return registry.entities.reduce(
    (count, entity) =>
      count +
      entity.expectedReferences.ranges.filter((range) =>
        hasRangeReference(adapterFacts, entity.id, range),
      ).length,
    0,
  );
}
