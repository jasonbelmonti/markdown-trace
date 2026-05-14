import {
  EntityRegistry,
  RegistryLoadError,
  type Definition,
  type ExpectedRange,
  type ExpectedReferences,
  type ExternalReference,
  type RegistryDocument,
  type RegistryEdge,
  type RegistryEntity,
} from "./model.js";

type RawRecord = Record<string, unknown>;
type ItemParser<T> = (value: unknown, field: string) => T;

export function parseRegistryData(rawData: unknown): EntityRegistry {
  const data = requireRecord(rawData, "registry");
  const entities = parseRequiredItems(data.entities, "entities", parseEntity);

  requireUnique(
    entities.map((entity) => entity.id),
    "entities[].id",
  );
  requireUnique(
    entities.map((entity) => entity.label),
    "entities[].label",
  );

  return new EntityRegistry({
    registryVersion: requireText(data.registryVersion, "registryVersion"),
    document: parseDocument(data.document),
    entities,
    edges: parseRequiredItems(data.edges, "edges", parseEdge),
    externalRefs: parseOptionalItems(data.externalRefs, "externalRefs", parseExternalRef),
  });
}

function parseDocument(rawDocument: unknown): RegistryDocument {
  const document = requireRecord(rawDocument, "document");

  return {
    id: requireText(document.id, "document.id"),
    title: requireText(document.title, "document.title"),
    path: requireText(document.path, "document.path"),
    fixtureFamily: requireText(document.fixtureFamily, "document.fixtureFamily"),
    sourceDocs: parseRequiredTextItems(document.sourceDocs, "document.sourceDocs"),
  };
}

function parseEntity(rawEntity: unknown, field: string): RegistryEntity {
  const entity = requireRecord(rawEntity, field);

  return {
    id: requireText(entity.id, `${field}.id`),
    label: requireText(entity.label, `${field}.label`),
    type: requireText(entity.type, `${field}.type`),
    defines: parseDefinition(entity.defines, `${field}.defines`),
    expectedReferences: parseExpectedReferences(
      entity.expectedReferences,
      `${field}.expectedReferences`,
    ),
  };
}

function parseDefinition(rawDefinition: unknown, field: string): Definition {
  const definition = requireRecord(rawDefinition, field);

  return {
    kind: requireText(definition.kind, `${field}.kind`),
    text: requireText(definition.text, `${field}.text`),
  };
}

function parseExpectedReferences(rawReferences: unknown, field: string): ExpectedReferences {
  if (rawReferences === undefined || rawReferences === null) {
    return { labels: [], ranges: [] };
  }

  const references = requireRecord(rawReferences, field);

  return {
    labels: parseOptionalTextItems(references.labels, `${field}.labels`),
    ranges: parseOptionalItems(references.ranges, `${field}.ranges`, parseExpectedRange),
  };
}

function parseExpectedRange(rawRange: unknown, field: string): ExpectedRange {
  const expectedRange = requireRecord(rawRange, field);

  return {
    labelFamily: requireText(expectedRange.labelFamily, `${field}.labelFamily`),
    start: requireText(expectedRange.start, `${field}.start`),
    end: requireText(expectedRange.end, `${field}.end`),
    expandsTo: parseRequiredTextItems(expectedRange.expandsTo, `${field}.expandsTo`),
  };
}

function parseEdge(rawEdge: unknown, field: string): RegistryEdge {
  const edge = requireRecord(rawEdge, field);

  return {
    source: requireText(edge.from, `${field}.from`),
    relationship: requireText(edge.relationship, `${field}.relationship`),
    target: requireText(edge.to, `${field}.to`),
  };
}

function parseExternalRef(rawExternalRef: unknown, field: string): ExternalReference {
  const externalRef = requireRecord(rawExternalRef, field);

  return {
    system: requireText(externalRef.system, `${field}.system`),
    key: requireText(externalRef.key, `${field}.key`),
    relatedEntity: requireText(externalRef.relatedEntity, `${field}.relatedEntity`),
    role: requireText(externalRef.role, `${field}.role`),
  };
}

function requireRecord(value: unknown, field: string): RawRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new RegistryLoadError(`${field} must be a mapping`);
  }

  return value as RawRecord;
}

function requireList(value: unknown, field: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new RegistryLoadError(`${field} must be a list`);
  }

  return value;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new RegistryLoadError(`${field} must be a non-empty string`);
  }

  return value;
}

function parseRequiredItems<T>(
  value: unknown,
  field: string,
  parser: ItemParser<T>,
): readonly T[] {
  return parseItems(requireList(value, field), field, parser);
}

function parseOptionalItems<T>(
  value: unknown,
  field: string,
  parser: ItemParser<T>,
): readonly T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return parseItems(requireList(value, field), field, parser);
}

function parseRequiredTextItems(value: unknown, field: string): readonly string[] {
  return parseTextItems(requireList(value, field), field);
}

function parseOptionalTextItems(value: unknown, field: string): readonly string[] {
  if (value === undefined || value === null) {
    return [];
  }

  return parseTextItems(requireList(value, field), field);
}

function parseItems<T>(
  values: readonly unknown[],
  field: string,
  parser: ItemParser<T>,
): readonly T[] {
  return values.map((item, index) => parser(item, `${field}[${index}]`));
}

function parseTextItems(values: readonly unknown[], field: string): readonly string[] {
  return values.map((item, index) => requireText(item, `${field}[${index}]`));
}

function requireUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new RegistryLoadError(`${field} contains duplicate value '${value}'`);
    }

    seen.add(value);
  }
}
