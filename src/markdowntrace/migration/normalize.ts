import type { TraceGraph, TraceGraphEdge, TraceGraphNode } from "../graph/index.js";
import type {
  EntityRegistry,
  ExternalReference,
  RegistryEdge,
  RegistryEntity,
} from "../registry/index.js";
import type { ValidationFinding, ValidationSummary } from "../validation/index.js";
import {
  MIGRATION_COMPARISON_DIMENSIONS,
  MIGRATION_COMPARISON_SIDES,
  type MigrationComparisonDimension,
  type MigrationComparisonSideInput,
  type MigrationGeneratedMetadata,
  type MigrationNormalizationInput,
  type MigrationNormalizedComparison,
  type MigrationNormalizedEntry,
  type MigrationNormalizedValue,
  type MigrationValidationInput,
} from "./model.js";

export function normalizeMigrationComparison(
  input: MigrationNormalizationInput,
): MigrationNormalizedComparison {
  return {
    dimensions: MIGRATION_COMPARISON_DIMENSIONS.map((dimension) => ({
      dimension,
      snapshots: MIGRATION_COMPARISON_SIDES.map((side) => ({
        side,
        entries: normalizeDimensionEntries(input[side], dimension),
      })),
    })),
  };
}

export function normalizeRegistryEntries(
  registry: EntityRegistry,
): readonly MigrationNormalizedEntry[] {
  const entries: MigrationNormalizedEntry[] = [
    entry("registryVersion", registry.registryVersion),
    entry("document.id", registry.document.id),
    entry("document.title", registry.document.title),
    entry("document.path", registry.document.path),
    entry("document.fixtureFamily", registry.document.fixtureFamily),
  ];

  for (const [index, sourceDoc] of sortedTexts(registry.document.sourceDocs).entries()) {
    entries.push(entry(`document.sourceDocs.${index}`, sourceDoc));
  }

  for (const entity of sortedEntities(registry.entities)) {
    entries.push(...normalizeEntityEntries(entity));
  }

  for (const [index, edgeValue] of sortedEdges(registry.edges).entries()) {
    entries.push(entry(`edges.${index}.source`, edgeValue.source));
    entries.push(entry(`edges.${index}.relationship`, edgeValue.relationship));
    entries.push(entry(`edges.${index}.target`, edgeValue.target));
  }

  for (const [index, externalRef] of sortedExternalReferences(registry.externalRefs).entries()) {
    entries.push(entry(`externalRefs.${index}.system`, externalRef.system));
    entries.push(entry(`externalRefs.${index}.key`, externalRef.key));
    entries.push(entry(`externalRefs.${index}.relatedEntity`, externalRef.relatedEntity));
    entries.push(entry(`externalRefs.${index}.role`, externalRef.role));
  }

  return sortEntries(entries);
}

export function normalizeGraphEntries(graph: TraceGraph): readonly MigrationNormalizedEntry[] {
  const entries: MigrationNormalizedEntry[] = [];

  for (const [index, node] of sortedNodes(graph.nodes).entries()) {
    entries.push(entry(`nodes.${index}.id`, node.id));
    entries.push(entry(`nodes.${index}.label`, node.label));
    entries.push(entry(`nodes.${index}.type`, node.type));
  }

  for (const [index, edgeValue] of sortedGraphEdges(graph.edges).entries()) {
    entries.push(entry(`edges.${index}.source`, edgeValue.source));
    entries.push(entry(`edges.${index}.target`, edgeValue.target));
  }

  return sortEntries(entries);
}

export function normalizeMetadataEntries(
  metadata: MigrationGeneratedMetadata | undefined,
): readonly MigrationNormalizedEntry[] {
  if (metadata === undefined) {
    return [entry("generated.present", false)];
  }

  const entries: MigrationNormalizedEntry[] = [
    entry("generated.present", true),
    entry("generated.artifactVersion", metadata.artifactVersion),
    entry("generated.artifactKind", metadata.artifactKind),
    entry("generated.reviewMarker", metadata.reviewMarker),
    entry("generated.humanEditable", metadata.humanEditable),
    entry("generated.source.documentPath", metadata.source.documentPath),
    entry("generated.source.documentSha256", metadata.source.documentSha256),
    entry("generated.generator.packageName", metadata.generator.packageName),
    entry("generated.generator.packageVersion", metadata.generator.packageVersion),
    entry("generated.generator.command", metadata.generator.command),
    entry("generated.generator.serialization", metadata.generator.serialization),
  ];

  if (metadata.typeProfile === undefined) {
    entries.push(entry("generated.typeProfile.present", false));
  } else {
    entries.push(entry("generated.typeProfile.present", true));
    entries.push(entry("generated.typeProfile.path", metadata.typeProfile.path));
    entries.push(entry("generated.typeProfile.pathSha256", metadata.typeProfile.pathSha256));
    entries.push(entry("generated.typeProfile.contentSha256", metadata.typeProfile.contentSha256));
    entries.push(entry("generated.typeProfile.profileVersion", metadata.typeProfile.profileVersion));
  }

  return sortEntries(entries);
}

export function normalizeValidationEntries(
  validation: MigrationValidationInput,
): readonly MigrationNormalizedEntry[] {
  const entries: MigrationNormalizedEntry[] = [
    entry("exitCode", validation.exitCode),
    entry("valid", validation.result.valid),
    entry("metadata.enginePackage.name", validation.result.metadata.enginePackage.name),
    entry("metadata.enginePackage.version", validation.result.metadata.enginePackage.version),
    entry("metadata.documentVersion", validation.result.metadata.documentVersion),
    entry("metadata.sourcePath", validation.result.metadata.sourcePath),
    ...normalizeValidationSummaryEntries(validation.result.summary),
  ];

  for (const [index, finding] of sortedFindings(validation.result.findings).entries()) {
    entries.push(entry(`findings.${index}.category`, finding.category));
    entries.push(entry(`findings.${index}.entityId`, finding.entityId ?? null));
    entries.push(entry(`findings.${index}.label`, finding.label ?? null));
    entries.push(entry(`findings.${index}.edgeRelationship`, finding.edgeRelationship ?? null));
    entries.push(entry(`findings.${index}.message`, finding.message));
  }

  return sortEntries(entries);
}

function normalizeDimensionEntries(
  input: MigrationComparisonSideInput,
  dimension: MigrationComparisonDimension,
): readonly MigrationNormalizedEntry[] {
  switch (dimension) {
    case "registry":
      return normalizeRegistryEntries(input.registry);
    case "graph":
      return normalizeGraphEntries(input.graph);
    case "metadata":
      return normalizeMetadataEntries(input.metadata);
    case "validation":
      return normalizeValidationEntries(input.validation);
  }
}

function normalizeEntityEntries(entity: RegistryEntity): readonly MigrationNormalizedEntry[] {
  const entries: MigrationNormalizedEntry[] = [
    entry(`entities.${entity.id}.id`, entity.id),
    entry(`entities.${entity.id}.label`, entity.label),
    entry(`entities.${entity.id}.type`, entity.type),
    entry(`entities.${entity.id}.defines.kind`, entity.defines.kind),
    entry(`entities.${entity.id}.defines.text`, entity.defines.text),
  ];

  for (const [index, label] of sortedTexts(entity.expectedReferences.labels).entries()) {
    entries.push(entry(`entities.${entity.id}.expectedReferences.labels.${index}`, label));
  }

  const ranges = [...entity.expectedReferences.ranges].sort((left, right) =>
    compareTexts(
      rangeSortKey(left.labelFamily, left.start, left.end, left.expandsTo),
      rangeSortKey(right.labelFamily, right.start, right.end, right.expandsTo),
    ),
  );

  for (const [rangeIndex, range] of ranges.entries()) {
    const rangePath = `entities.${entity.id}.expectedReferences.ranges.${rangeIndex}`;
    entries.push(entry(`${rangePath}.labelFamily`, range.labelFamily));
    entries.push(entry(`${rangePath}.start`, range.start));
    entries.push(entry(`${rangePath}.end`, range.end));

    for (const [expandedIndex, expandedLabel] of sortedTexts(range.expandsTo).entries()) {
      entries.push(entry(`${rangePath}.expandsTo.${expandedIndex}`, expandedLabel));
    }
  }

  return entries;
}

function normalizeValidationSummaryEntries(
  summary: ValidationSummary,
): readonly MigrationNormalizedEntry[] {
  return [
    entry("summary.entities", summary.entities),
    entry("summary.definitionsResolved", summary.definitionsResolved),
    entry("summary.expectedReferencesResolved", summary.expectedReferencesResolved),
    entry("summary.expectedRangesResolved", summary.expectedRangesResolved),
    entry("summary.edgesResolved", summary.edgesResolved),
    entry("summary.findings", summary.findings),
  ];
}

function sortedEntities(entities: readonly RegistryEntity[]): readonly RegistryEntity[] {
  return [...entities].sort((left, right) => compareTexts(left.id, right.id));
}

function sortedEdges(edges: readonly RegistryEdge[]): readonly RegistryEdge[] {
  return [...edges].sort((left, right) =>
    compareTexts(
      edgeSortKey(left.source, left.relationship, left.target),
      edgeSortKey(right.source, right.relationship, right.target),
    ),
  );
}

function sortedExternalReferences(
  externalRefs: readonly ExternalReference[],
): readonly ExternalReference[] {
  return [...externalRefs].sort((left, right) =>
    compareTexts(
      externalReferenceSortKey(left.system, left.key, left.relatedEntity, left.role),
      externalReferenceSortKey(right.system, right.key, right.relatedEntity, right.role),
    ),
  );
}

function sortedNodes(nodes: readonly TraceGraphNode[]): readonly TraceGraphNode[] {
  return [...nodes].sort((left, right) =>
    compareTexts(
      graphNodeSortKey(left.id, left.label, left.type),
      graphNodeSortKey(right.id, right.label, right.type),
    ),
  );
}

function sortedGraphEdges(edges: readonly TraceGraphEdge[]): readonly TraceGraphEdge[] {
  return [...edges].sort((left, right) =>
    compareTexts(
      graphEdgeSortKey(left.source, left.target),
      graphEdgeSortKey(right.source, right.target),
    ),
  );
}

function sortedFindings(findings: readonly ValidationFinding[]): readonly ValidationFinding[] {
  return [...findings].sort((left, right) =>
    compareTexts(
      findingSortKey(
        left.category,
        left.entityId,
        left.label,
        left.edgeRelationship,
        left.message,
      ),
      findingSortKey(
        right.category,
        right.entityId,
        right.label,
        right.edgeRelationship,
        right.message,
      ),
    ),
  );
}

function sortedTexts(values: readonly string[]): readonly string[] {
  return [...values].sort(compareTexts);
}

function sortEntries(
  entries: readonly MigrationNormalizedEntry[],
): readonly MigrationNormalizedEntry[] {
  return [...entries].sort((left, right) => compareTexts(left.path, right.path));
}

function entry(path: string, value: MigrationNormalizedValue): MigrationNormalizedEntry {
  return { path, value };
}

function edgeSortKey(source: string, relationship: string, target: string): string {
  return sortKey(source, relationship, target);
}

function graphNodeSortKey(id: string, label: string, type: string): string {
  return sortKey(id, label, type);
}

function graphEdgeSortKey(source: string, target: string): string {
  return sortKey(source, target);
}

function externalReferenceSortKey(
  system: string,
  key: string,
  relatedEntity: string,
  role: string,
): string {
  return sortKey(system, key, relatedEntity, role);
}

function rangeSortKey(
  labelFamily: string,
  start: string,
  end: string,
  expandsTo: readonly string[],
): string {
  return sortKey(labelFamily, start, end, ...sortedTexts(expandsTo));
}

function findingSortKey(
  category: string,
  entityId: string | undefined,
  label: string | undefined,
  edgeRelationship: string | undefined,
  message: string,
): string {
  return sortKey(
    category,
    nullableTextSortValue(entityId),
    nullableTextSortValue(label),
    nullableTextSortValue(edgeRelationship),
    message,
  );
}

function nullableTextSortValue(value: string | undefined): MigrationNormalizedValue {
  return value ?? null;
}

function sortKey(...parts: readonly MigrationNormalizedValue[]): string {
  return JSON.stringify(parts);
}

function compareTexts(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
