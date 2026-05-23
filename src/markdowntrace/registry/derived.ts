import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  documentQueries,
  normalize,
  parse,
  type EngineDocument,
  type EngineNode,
  type EngineSection,
} from "@jasonbelmonti/markdown-engine";

import {
  collectTraceEntityDefinitions,
  collectTraceEntityReferences,
  collectTraceRangeReferences,
  type TraceEntityDefinitionLink,
  type TraceEntityReferenceLink,
  type TraceRangeReferenceLink,
} from "../markdown/trace-links.js";
import { loadTypeProfile } from "../profiles/loader.js";
import {
  TypeProfileLoadError,
  type EntityTypeProfile,
  requireProfiledEntityType,
} from "../profiles/model.js";
import {
  labelFamily,
  parseLabel,
  scanLabels,
  scanRanges,
  type ObservedRange,
  type ParsedLabel,
} from "../markdown/label-scanner.js";
import { sectionBodySourceSlicesForTarget } from "../markdown/source-slices.js";
import { rejectErrorDiagnostics, toDerivedDiagnostics } from "./derived-diagnostics.js";
import { traceConfigFromFrontmatter } from "./derived-frontmatter.js";
import {
  DEFAULT_DERIVED_ENTITY_TYPES,
  DERIVED_EDGE_RELATIONSHIP,
  DERIVED_REGISTRY_VERSION,
  type DerivedEntityTypeMap,
  type DerivedRegistryOptions,
  type DerivedRegistryResult,
  type TraceFrontmatterConfig,
} from "./derived-model.js";
import { EntityRegistry, type RegistryDocument, type RegistryEntity } from "./model.js";
import { assertTraceLinkIntegrity } from "./trace-integrity.js";

export {
  DEFAULT_DERIVED_ENTITY_TYPES,
  DERIVED_EDGE_RELATIONSHIP,
  DERIVED_REGISTRY_VERSION,
  type DerivedEntityTypeMap,
  type DerivedRegistryDiagnostic,
  type DerivedRegistryOptions,
  type DerivedRegistryResult,
} from "./derived-model.js";

interface DerivedEntityContext {
  readonly entity: RegistryEntity;
  readonly sectionTargetId?: string;
}

interface RegisteredLabel {
  readonly label: string;
  readonly parsed: ParsedLabel;
}

export async function deriveRegistryFromMarkdown(
  documentPath: string,
  options: DerivedRegistryOptions = {},
): Promise<EntityRegistry> {
  const result = await deriveRegistryResultFromMarkdown(documentPath, options);

  return result.registry;
}

export async function deriveRegistryResultFromMarkdown(
  documentPath: string,
  options: DerivedRegistryOptions = {},
): Promise<DerivedRegistryResult> {
  const markdown = await readFile(documentPath, "utf8");
  const typeProfile =
    options.typeProfile ??
    (options.typeProfilePath === undefined
      ? undefined
      : await loadTypeProfile(options.typeProfilePath));

  return deriveRegistryResultFromMarkdownText(markdown, {
    ...options,
    typeProfile,
    documentPath: options.documentPath ?? documentPath,
  });
}

export function deriveRegistryFromMarkdownText(
  markdown: string,
  options: DerivedRegistryOptions = {},
): EntityRegistry {
  const result = deriveRegistryResultFromMarkdownText(markdown, options);

  return result.registry;
}

export function deriveRegistryResultFromMarkdownText(
  markdown: string,
  options: DerivedRegistryOptions = {},
): DerivedRegistryResult {
  const parsed = parse(markdown, { path: options.documentPath });
  const normalized = normalize(parsed.parsed);
  const diagnostics = [
    ...toDerivedDiagnostics("parse", parsed.diagnostics),
    ...toDerivedDiagnostics("normalize", normalized.diagnostics),
  ];

  rejectErrorDiagnostics(options.documentPath, diagnostics);

  const document = normalized.document;
  const headings = documentQueries.nodes(document, { type: "heading" });
  const sections = documentQueries.sections(document);
  const linkReferences = documentQueries.linkReferences(document);
  const traceConfig = traceConfigFromFrontmatter(document.frontmatter);
  const traceDefinitions = collectTraceEntityDefinitions(headings, sections, linkReferences);

  const contexts =
    traceDefinitions.length === 0
      ? deriveHeadingContexts(document, headings, sections, options, traceConfig)
      : deriveTraceContexts(document, traceDefinitions, options);
  const registryDocument = deriveRegistryDocument(document, headings, options, traceConfig);
  const entities = contexts.map((context) => context.entity);

  return {
    registry: new EntityRegistry({
      registryVersion:
        options.registryVersion ?? traceConfig.registryVersion ?? DERIVED_REGISTRY_VERSION,
      document: registryDocument,
      entities,
      edges: deriveReferenceEdges(entities),
      externalRefs: options.externalRefs ?? traceConfig.externalRefs ?? [],
    }),
    diagnostics,
  };
}

function deriveHeadingContexts(
  document: EngineDocument,
  headings: readonly EngineNode[],
  sections: readonly EngineSection[],
  options: DerivedRegistryOptions,
  traceConfig: TraceFrontmatterConfig,
): readonly DerivedEntityContext[] {
  const namespace = options.namespace ?? traceConfig.namespace ?? "doc";
  const initialContexts = deriveEntities(headings, sections, namespace, {
    ...DEFAULT_DERIVED_ENTITY_TYPES,
    ...traceConfig.entityTypes,
    ...options.entityTypes,
  });
  const registeredLabels = collectRegisteredLabels(
    initialContexts.map((context) => context.entity),
  );

  return deriveEntityReferences(document, initialContexts, registeredLabels);
}

function deriveTraceContexts(
  document: EngineDocument,
  traceDefinitions: readonly TraceEntityDefinitionLink[],
  options: DerivedRegistryOptions,
): readonly DerivedEntityContext[] {
  const contexts = deriveTraceEntities(
    traceDefinitions,
    requireTypeProfile(options, traceDefinitions),
  );
  const references = collectTraceEntityReferences(document, traceDefinitions);
  const rangeReferences = collectTraceRangeReferences(document, traceDefinitions);

  assertTraceLinkIntegrity(contexts, references, rangeReferences, {
    documentPath: options.documentPath ?? document.path,
  });

  return deriveTraceEntityReferences(document, contexts, references, rangeReferences);
}

function deriveTraceEntities(
  definitions: readonly TraceEntityDefinitionLink[],
  typeProfile: EntityTypeProfile,
): readonly DerivedEntityContext[] {
  return definitions.map((definition) => {
    const type = requireProfiledEntityType(definition, typeProfile);

    return {
      entity: {
        id: definition.canonicalId,
        label: definition.label,
        type,
        defines: {
          kind: "heading",
          text: definition.headingText,
        },
        expectedReferences: {
          labels: [],
          ranges: [],
        },
      },
      sectionTargetId: definition.sectionTargetId,
    };
  });
}

function deriveTraceEntityReferences(
  document: EngineDocument,
  contexts: readonly DerivedEntityContext[],
  references: readonly TraceEntityReferenceLink[],
  rangeReferences: readonly TraceRangeReferenceLink[],
): readonly DerivedEntityContext[] {
  const entitiesByCanonicalId = new Map(
    contexts.map((context) => [context.entity.id, context.entity]),
  );
  const registeredLabels = collectRegisteredLabels(contexts.map((context) => context.entity));

  return contexts.map((context) => {
    const labels = new Set<string>();
    const ranges = new Map<string, ObservedRange>();

    for (const reference of references.filter(
      (candidate) => candidate.sourceCanonicalId === context.entity.id,
    )) {
      const target = entitiesByCanonicalId.get(reference.canonicalId);

      if (reference.type !== undefined && target !== undefined && reference.type !== target.type) {
        throw new TypeProfileLoadError(
          `${document.path ?? "document"} reference to '${reference.canonicalId}' declares type '${reference.type}' but definition uses '${target.type}'`,
        );
      }

      if (target !== undefined && target.id !== context.entity.id) {
        labels.add(target.label);
      } else if (target === undefined) {
        labels.add(reference.label);
      }
    }

    for (const rangeReference of rangeReferences.filter(
      (candidate) => candidate.sourceCanonicalId === context.entity.id,
    )) {
      const range = traceRangeToObservedRange(rangeReference);

      ranges.set(`${range.labelFamily}\u0000${range.start}\u0000${range.end}`, range);
      for (const label of expandRegisteredRange(range, registeredLabels)) {
        if (label !== context.entity.label) {
          labels.add(label);
        }
      }
    }

    return {
      ...context,
      entity: {
        ...context.entity,
        expectedReferences: {
          labels: [...labels].sort(),
          ranges: [...ranges.values()].map((range) => ({
            labelFamily: range.labelFamily,
            start: range.start,
            end: range.end,
            expandsTo: expandRegisteredRange(range, registeredLabels),
          })),
        },
      },
    };
  });
}

function traceRangeToObservedRange(range: TraceRangeReferenceLink): ObservedRange {
  return {
    labelFamily: labelFamily(range.start) ?? labelFamily(range.end) ?? "",
    start: range.start,
    end: range.end,
  };
}

function requireTypeProfile(
  options: DerivedRegistryOptions,
  definitions: readonly TraceEntityDefinitionLink[],
): EntityTypeProfile {
  if (options.typeProfile !== undefined) {
    return options.typeProfile;
  }

  const firstDefinition = definitions[0];
  const sourceRange = firstDefinition?.sourceRange;
  const location =
    sourceRange === undefined
      ? options.documentPath ?? "document"
      : `${options.documentPath ?? "document"}:${sourceRange.start.line}:${sourceRange.start.column}`;

  throw new TypeProfileLoadError(`${location} requires a type profile for ctx://trace entity links`);
}

function deriveEntities(
  headings: readonly EngineNode[],
  sections: readonly EngineSection[],
  namespace: string,
  entityTypes: DerivedEntityTypeMap,
): readonly DerivedEntityContext[] {
  return headings.flatMap((heading) => {
    const label = parseEntityLabel(heading);

    if (label === undefined) {
      return [];
    }

    const section = sections.find(
      (candidate) => candidate.headingTarget.id === heading.target?.id,
    );

    return [
      {
        entity: {
          id: canonicalId(namespace, label),
          label,
          type: entityType(label, entityTypes),
          defines: {
            kind: "heading",
            text: heading.source?.text ?? headingTextFallback(heading),
          },
          expectedReferences: {
            labels: [],
            ranges: [],
          },
        },
        sectionTargetId: section?.target.id,
      },
    ];
  });
}

function deriveEntityReferences(
  document: EngineDocument,
  contexts: readonly DerivedEntityContext[],
  registeredLabels: readonly RegisteredLabel[],
): readonly DerivedEntityContext[] {
  const labelFamilies = collectLabelFamilies(registeredLabels);

  return contexts.map((context) => {
    const labels = new Set<string>();
    const ranges = new Map<string, ObservedRange>();

    for (const slice of sectionBodySourceSlicesForTarget(document, context.sectionTargetId)) {
      for (const label of scanLabels(slice.text, labelFamilies)) {
        if (label !== context.entity.label) {
          labels.add(label);
        }
      }

      for (const range of scanRanges(slice.text, labelFamilies)) {
        ranges.set(`${range.labelFamily}\u0000${range.start}\u0000${range.end}`, range);
        for (const label of expandRegisteredRange(range, registeredLabels)) {
          if (label !== context.entity.label) {
            labels.add(label);
          }
        }
      }
    }

    return {
      ...context,
      entity: {
        ...context.entity,
        expectedReferences: {
          labels: [...labels].sort(),
          ranges: [...ranges.values()].map((range) => ({
            labelFamily: range.labelFamily,
            start: range.start,
            end: range.end,
            expandsTo: expandRegisteredRange(range, registeredLabels),
          })),
        },
      },
    };
  });
}

function deriveReferenceEdges(entities: readonly RegistryEntity[]) {
  const entitiesByLabel = new Map(entities.map((entity) => [entity.label, entity]));
  const edges = entities.flatMap((entity) =>
    entity.expectedReferences.labels.flatMap((label) => {
      const target = entitiesByLabel.get(label);

      if (target === undefined || target.id === entity.id) {
        return [];
      }

      return [
        {
          source: entity.id,
          relationship: DERIVED_EDGE_RELATIONSHIP,
          target: target.id,
        },
      ];
    }),
  );

  return [
    ...new Map(edges.map((edge) => [`${edge.source}\u0000${edge.target}`, edge])).values(),
  ].sort((left, right) =>
    `${left.source}\u0000${left.target}`.localeCompare(`${right.source}\u0000${right.target}`),
  );
}

function deriveRegistryDocument(
  document: EngineDocument,
  headings: readonly EngineNode[],
  options: DerivedRegistryOptions,
  traceConfig: TraceFrontmatterConfig,
): RegistryDocument {
  const title =
    options.title ?? traceConfig.title ?? firstDocumentTitle(headings) ?? "Untitled document";
  const documentPath = options.documentPath ?? document.path ?? "";

  return {
    id: options.documentId ?? traceConfig.documentId ?? slugify(title),
    title,
    path: documentPath,
    fixtureFamily:
      options.fixtureFamily ??
      traceConfig.fixtureFamily ??
      (documentPath === "" ? "" : path.basename(path.dirname(documentPath))),
    sourceDocs: options.sourceDocs ?? traceConfig.sourceDocs ?? [],
  };
}

function parseEntityLabel(heading: EngineNode): string | undefined {
  return heading.text?.match(/^([A-Z]+-\d+):\s+\S/)?.[1];
}

function canonicalId(namespace: string, label: string): string {
  const parsed = label.match(/^([A-Z]+)-(\d+)$/);

  if (parsed === null) {
    return `${namespace}.${slugify(label)}`;
  }

  return `${namespace}.${parsed[1].toLowerCase()}.${Number.parseInt(parsed[2], 10)}`;
}

function entityType(label: string, entityTypes: DerivedEntityTypeMap): string {
  const family = labelFamily(label);

  return family === undefined ? "document_entity" : entityTypes[family] ?? "document_entity";
}

function collectRegisteredLabels(entities: readonly RegistryEntity[]): readonly RegisteredLabel[] {
  return entities
    .flatMap((entity) => {
      const parsed = parseLabel(entity.label);
      return parsed === undefined ? [] : [{ label: entity.label, parsed }];
    })
    .sort(
      (left, right) =>
        left.parsed.family.localeCompare(right.parsed.family) ||
        left.parsed.sequence - right.parsed.sequence ||
        left.label.localeCompare(right.label),
    );
}

function collectLabelFamilies(registeredLabels: readonly RegisteredLabel[]): readonly string[] {
  return [...new Set(registeredLabels.map((label) => label.parsed.family))].sort();
}

function expandRegisteredRange(
  range: ObservedRange,
  registeredLabels: readonly RegisteredLabel[],
): readonly string[] {
  const start = parseLabel(range.start);
  const end = parseLabel(range.end);

  if (
    start === undefined ||
    end === undefined ||
    start.family !== end.family ||
    start.family !== range.labelFamily ||
    end.sequence < start.sequence
  ) {
    return [];
  }

  return registeredLabels.flatMap((registered) =>
    registered.parsed.family === start.family &&
    registered.parsed.sequence >= start.sequence &&
    registered.parsed.sequence <= end.sequence
      ? [registered.label]
      : [],
  );
}

function headingTextFallback(heading: EngineNode): string {
  const depth = typeof heading.attributes?.depth === "number" ? heading.attributes.depth : 1;
  return `${"#".repeat(depth)} ${heading.text ?? ""}`.trim();
}

function firstDocumentTitle(headings: readonly EngineNode[]): string | undefined {
  return headings.find((heading) => heading.attributes?.depth === 1)?.text;
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return slug === "" ? "document" : slug;
}
