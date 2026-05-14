import type { MarkdownAdapterFacts } from "../markdown/index.js";
import type { EntityRegistry, RegistryEdge } from "../registry/index.js";
import type { ValidationFinding } from "./model.js";
import {
  hasExpandedRangeReference,
  hasLabelReference,
  hasRangeReference,
} from "./reference-resolution.js";

export function collectFindings(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): readonly ValidationFinding[] {
  return sortFindings([
    ...adapterDiagnosticFindings(adapterFacts),
    ...missingDefinitionFindings(registry, adapterFacts),
    ...missingReferenceFindings(registry, adapterFacts),
    ...missingRangeFindings(registry, adapterFacts),
    ...missingEdgeTargetFindings(registry),
  ]);
}

export function missingEdgeTargetFindings(
  registry: EntityRegistry,
): readonly ValidationFinding[] {
  return registry.edges.flatMap((edge) => edgeTargetFindings(registry, edge));
}

function adapterDiagnosticFindings(
  adapterFacts: MarkdownAdapterFacts,
): readonly ValidationFinding[] {
  return adapterFacts.diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => ({
      category: "adapter_diagnostic",
      message: `${diagnostic.stage} diagnostic ${diagnostic.code}: ${diagnostic.message}`,
    }));
}

function missingDefinitionFindings(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): readonly ValidationFinding[] {
  const definedEntityIds = new Set(
    adapterFacts.definitions.map((definition) => definition.entityId),
  );

  return registry.entities
    .filter((entity) => !definedEntityIds.has(entity.id))
    .map((entity) => ({
      category: "missing_registered_definition",
      entityId: entity.id,
      label: entity.label,
      message: `${entity.id} (${entity.label}) is not defined by ${entity.defines.text}`,
    }));
}

function missingReferenceFindings(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): readonly ValidationFinding[] {
  return registry.entities.flatMap((entity) =>
    entity.expectedReferences.labels
      .filter(
        (label) =>
          registry.entitiesByLabel.has(label) &&
          !hasLabelReference(adapterFacts, entity.id, label) &&
          !hasExpandedRangeReference(adapterFacts, entity.id, label),
      )
      .map((label) => ({
        category: "missing_expected_reference",
        entityId: entity.id,
        label,
        message: `${entity.id} (${entity.label}) does not reference expected label ${label}`,
      })),
  );
}

function missingRangeFindings(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): readonly ValidationFinding[] {
  return registry.entities.flatMap((entity) =>
    entity.expectedReferences.ranges
      .filter((range) => !hasRangeReference(adapterFacts, entity.id, range))
      .map((range) => ({
        category: "missing_expected_range",
        entityId: entity.id,
        label: `${range.start}..${range.end}`,
        message: `${entity.id} (${entity.label}) does not reference expected ${range.labelFamily} range ${range.start} through ${range.end}`,
      })),
  );
}

function edgeTargetFindings(
  registry: EntityRegistry,
  edge: RegistryEdge,
): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (!registry.entitiesById.has(edge.source)) {
    findings.push({
      category: "missing_edge_target",
      entityId: edge.source,
      edgeRelationship: edge.relationship,
      message: `edge source ${edge.source} for ${edge.relationship} is not registered`,
    });
  }

  if (!registry.entitiesById.has(edge.target)) {
    findings.push({
      category: "missing_edge_target",
      entityId: edge.target,
      edgeRelationship: edge.relationship,
      message: `edge target ${edge.target} for ${edge.relationship} is not registered`,
    });
  }

  return findings;
}

function sortFindings(findings: readonly ValidationFinding[]): readonly ValidationFinding[] {
  return [...findings].sort((left, right) =>
    [
      left.entityId ?? "",
      left.category,
      left.label ?? "",
      left.edgeRelationship ?? "",
      left.message,
    ]
      .join("\u0000")
      .localeCompare(
        [
          right.entityId ?? "",
          right.category,
          right.label ?? "",
          right.edgeRelationship ?? "",
          right.message,
        ].join("\u0000"),
      ),
  );
}
