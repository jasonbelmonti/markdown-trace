import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import { labelFamily, parseLabel, type ParsedLabel } from "../markdown/label-scanner.js";
import type {
  TraceEntityReferenceLink,
  TraceRangeReferenceLink,
} from "../markdown/trace-links.js";
import { RegistryLoadError, type RegistryEntity } from "./model.js";

interface TraceEntityContext {
  readonly entity: RegistryEntity;
}

interface RegisteredLabel {
  readonly label: string;
  readonly parsed: ParsedLabel;
}

interface TraceIntegrityOptions {
  readonly documentPath?: string;
}

export function assertTraceLinkIntegrity(
  contexts: readonly TraceEntityContext[],
  references: readonly TraceEntityReferenceLink[],
  rangeReferences: readonly TraceRangeReferenceLink[],
  options: TraceIntegrityOptions = {},
): void {
  const entitiesById = new Map(contexts.map((context) => [context.entity.id, context.entity]));
  const labelsByLabel = new Map(contexts.map((context) => [context.entity.label, context.entity]));
  const registeredLabels = collectRegisteredLabels(contexts.map((context) => context.entity));

  for (const reference of references) {
    assertKnownSourceEntity(reference.sourceCanonicalId, entitiesById, options.documentPath);
    assertKnownReferenceTarget(reference, entitiesById, options.documentPath);
  }

  for (const rangeReference of rangeReferences) {
    assertKnownSourceEntity(rangeReference.sourceCanonicalId, entitiesById, options.documentPath);
    assertResolvableRange(rangeReference, labelsByLabel, registeredLabels, options.documentPath);
  }
}

function assertKnownSourceEntity(
  canonicalId: string,
  entitiesById: ReadonlyMap<string, RegistryEntity>,
  documentPath: string | undefined,
): void {
  if (entitiesById.has(canonicalId)) {
    return;
  }

  throw new RegistryLoadError(
    `${documentPath ?? "document"} contains ctx://trace reference data for unknown source entity '${canonicalId}'`,
  );
}

function assertKnownReferenceTarget(
  reference: TraceEntityReferenceLink,
  entitiesById: ReadonlyMap<string, RegistryEntity>,
  documentPath: string | undefined,
): void {
  if (entitiesById.has(reference.canonicalId)) {
    return;
  }

  throw new RegistryLoadError(
    `${sourceLocation(documentPath, reference.sourceRange)} references unknown ctx://trace entity '${reference.canonicalId}' (${reference.label})`,
  );
}

function assertResolvableRange(
  rangeReference: TraceRangeReferenceLink,
  labelsByLabel: ReadonlyMap<string, RegistryEntity>,
  registeredLabels: readonly RegisteredLabel[],
  documentPath: string | undefined,
): void {
  const rangeFamily = labelFamily(rangeReference.start) ?? labelFamily(rangeReference.end);
  const start = parseLabel(rangeReference.start);
  const end = parseLabel(rangeReference.end);

  if (
    rangeFamily === undefined ||
    start === undefined ||
    end === undefined ||
    start.family !== rangeFamily ||
    end.family !== rangeFamily ||
    start.family !== end.family ||
    end.sequence < start.sequence
  ) {
    throw new RegistryLoadError(
      `${sourceLocation(documentPath, rangeReference.sourceRange)} has invalid ctx://trace range '${rangeReference.start}' through '${rangeReference.end}'`,
    );
  }

  for (const endpoint of [rangeReference.start, rangeReference.end]) {
    if (!labelsByLabel.has(endpoint)) {
      throw new RegistryLoadError(
        `${sourceLocation(documentPath, rangeReference.sourceRange)} range endpoint '${endpoint}' is not registered`,
      );
    }
  }

  const missingInteriorLabel = firstMissingInteriorLabel(start, end, registeredLabels);

  if (missingInteriorLabel !== undefined) {
    throw new RegistryLoadError(
      `${sourceLocation(documentPath, rangeReference.sourceRange)} range label '${missingInteriorLabel}' is not registered`,
    );
  }
}

function firstMissingInteriorLabel(
  start: ParsedLabel,
  end: ParsedLabel,
  registeredLabels: readonly RegisteredLabel[],
): string | undefined {
  const sequences = registeredLabels
    .filter(
      (label) =>
        label.parsed.family === start.family &&
        label.parsed.sequence >= start.sequence &&
        label.parsed.sequence <= end.sequence,
    )
    .map((label) => label.parsed.sequence)
    .sort((left, right) => left - right);
  let expectedSequence = start.sequence;

  for (const sequence of sequences) {
    if (sequence > expectedSequence) {
      return formatLabel(start.family, expectedSequence, Math.max(start.width, end.width));
    }

    if (sequence === expectedSequence) {
      expectedSequence += 1;
    }
  }

  return expectedSequence > end.sequence
    ? undefined
    : formatLabel(start.family, expectedSequence, Math.max(start.width, end.width));
}

function collectRegisteredLabels(entities: readonly RegistryEntity[]): readonly RegisteredLabel[] {
  return entities.flatMap((entity) => {
    const parsed = parseLabel(entity.label);
    return parsed === undefined ? [] : [{ label: entity.label, parsed }];
  });
}

function formatLabel(family: string, sequence: number, width: number): string {
  return `${family}-${String(sequence).padStart(width, "0")}`;
}

function sourceLocation(
  documentPath: string | undefined,
  sourceRange: SourceRange | undefined,
): string {
  if (sourceRange === undefined) {
    return documentPath ?? "document";
  }

  return `${documentPath ?? "document"}:${sourceRange.start.line}:${sourceRange.start.column}`;
}
