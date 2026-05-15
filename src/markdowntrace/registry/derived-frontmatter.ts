import type { ExternalReference } from "./model.js";
import type { DerivedEntityTypeMap, TraceFrontmatterConfig } from "./derived-model.js";

export function traceConfigFromFrontmatter(frontmatter: unknown): TraceFrontmatterConfig {
  const root = asRecord(frontmatter);
  const config = asRecord(root?.markdownTrace);

  if (config === undefined) {
    return {};
  }

  return {
    namespace: asText(config.namespace),
    registryVersion: asText(config.registryVersion),
    documentId: asText(config.documentId),
    title: asText(config.title),
    fixtureFamily: asText(config.fixtureFamily),
    sourceDocs: asTextItems(config.sourceDocs),
    externalRefs: asExternalRefs(config.externalRefs),
    entityTypes: asTextRecord(config.entityTypes),
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function asTextItems(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );

  return items.length === value.length ? items : undefined;
}

function asTextRecord(value: unknown): DerivedEntityTypeMap | undefined {
  const record = asRecord(value);

  if (record === undefined) {
    return undefined;
  }

  const entries = Object.entries(record);

  if (entries.some(([key, item]) => key.trim() === "" || asText(item) === undefined)) {
    return undefined;
  }

  return Object.fromEntries(entries.map(([key, item]) => [key, item as string]));
}

function asExternalRefs(value: unknown): readonly ExternalReference[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const refs = value.flatMap((item) => {
    const record = asRecord(item);
    const system = asText(record?.system);
    const key = asText(record?.key);
    const relatedEntity = asText(record?.relatedEntity);
    const role = asText(record?.role);

    return system !== undefined &&
      key !== undefined &&
      relatedEntity !== undefined &&
      role !== undefined
      ? [{ system, key, relatedEntity, role }]
      : [];
  });

  return refs.length === value.length ? refs : undefined;
}
