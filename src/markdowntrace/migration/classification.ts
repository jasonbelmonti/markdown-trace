import {
  type MigrationApprovedIntentionalDelta,
  type MigrationAuthorityState,
  type MigrationComparisonDimension,
  type MigrationDelta,
  type MigrationDeltaValue,
  type MigrationDimensionResult,
  type MigrationGeneratedMetadataCheck,
  type MigrationMissingValue,
  type MigrationNormalizedEntry,
} from "./model.js";
import { normalizeMetadataEntries } from "./normalize.js";

interface MigrationDimensionClassificationInput {
  readonly dimension: MigrationComparisonDimension;
  readonly deltas: readonly MigrationDelta[];
  readonly authorityState: MigrationAuthorityState;
  readonly documentPath: string;
  readonly approvedIntentionalDeltas?: readonly MigrationApprovedIntentionalDelta[];
  readonly generatedMetadataCheck?: MigrationGeneratedMetadataCheck;
}

const INTENTIONAL_GENERATED_METADATA_ABSENCE_RATIONALE = [
  "Manual YAML has no generated metadata while the fixture remains yaml-authoritative;",
  "generated sidecar metadata is checked evidence under the R2 contract.",
].join(" ");

export function classifyMigrationDimension(
  input: MigrationDimensionClassificationInput,
): MigrationDimensionResult {
  const { dimension, deltas } = input;

  if (deltas.length === 0) {
    return {
      dimension,
      status: "equivalent",
      deltas: [],
    };
  }

  const intentionalDeltas = intentionalDimensionDeltas(input);

  if (intentionalDeltas !== undefined) {
    return {
      dimension,
      status: "intentional",
      deltas: intentionalDeltas,
    };
  }

  const rationale = `Manual and generated ${dimension} entries differ; unexplained drift blocks parity approval.`;

  return {
    dimension,
    status: "blocking",
    deltas: deltas.map((delta) => ({
      ...delta,
      rationale,
    })),
  };
}

function intentionalDimensionDeltas(
  input: MigrationDimensionClassificationInput,
): readonly MigrationDelta[] | undefined {
  return builtInIntentionalMetadataDeltas(input) ?? approvedIntentionalDimensionDeltas(input);
}

function builtInIntentionalMetadataDeltas(
  input: MigrationDimensionClassificationInput,
): readonly MigrationDelta[] | undefined {
  const { authorityState, deltas, dimension, documentPath, generatedMetadataCheck } = input;

  if (
    dimension !== "metadata" ||
    authorityState !== "yaml-authoritative" ||
    generatedMetadataCheck?.valid !== true
  ) {
    return undefined;
  }

  const deltaByPath = new Map(deltas.map((delta) => [delta.path, delta]));
  const checkedMetadataEntries = normalizeMetadataEntries(generatedMetadataCheck.metadata);
  const checkedMetadataByPath = entriesByPath(checkedMetadataEntries);

  if (
    !haveSamePaths(deltaByPath, checkedMetadataByPath) ||
    checkedMetadataByPath.get("generated.present") !== true ||
    checkedMetadataByPath.get("generated.source.documentPath") !== documentPath ||
    checkedMetadataByPath.get("generated.artifactVersion") !==
      "markdown-trace.generated-sidecar.v0" ||
    checkedMetadataByPath.get("generated.artifactKind") !== "registry" ||
    checkedMetadataByPath.get("generated.reviewMarker") !== "generated-by-markdown-trace" ||
    checkedMetadataByPath.get("generated.humanEditable") !== false ||
    checkedMetadataByPath.get("generated.generator.packageName") !== "markdown-trace" ||
    checkedMetadataByPath.get("generated.generator.serialization") !==
      "yaml-lf-final-newline-v0"
  ) {
    return undefined;
  }

  return checkedMetadataEntries.every((entry) =>
    hasIntentionalGeneratedMetadataAbsenceDelta(deltaByPath, entry.path, entry.value),
  )
    ? deltas.map((delta) => ({
        ...delta,
        rationale: INTENTIONAL_GENERATED_METADATA_ABSENCE_RATIONALE,
      }))
    : undefined;
}

function approvedIntentionalDimensionDeltas(
  input: MigrationDimensionClassificationInput,
): readonly MigrationDelta[] | undefined {
  if (
    input.dimension === "metadata" &&
    input.deltas.some(isManualGeneratedMetadataAbsenceDelta)
  ) {
    return undefined;
  }

  const approvedDeltas = input.approvedIntentionalDeltas?.filter(
    (delta) => delta.dimension === input.dimension,
  );

  if (approvedDeltas === undefined || approvedDeltas.length === 0) {
    return undefined;
  }

  const approvedDeltaByPath = new Map(approvedDeltas.map((delta) => [delta.path, delta]));
  const deltaByPath = new Map(input.deltas.map((delta) => [delta.path, delta]));

  if (
    approvedDeltaByPath.size !== approvedDeltas.length ||
    !haveSamePaths(deltaByPath, approvedDeltaByPath)
  ) {
    return undefined;
  }

  const classifiedDeltas = input.deltas.map((delta) => {
    const approvedDelta = approvedDeltaByPath.get(delta.path);

    if (
      approvedDelta === undefined ||
      approvedDelta.rationale.trim().length === 0 ||
      !deltaValuesEqual(delta.expected, approvedDelta.expected) ||
      !deltaValuesEqual(delta.actual, approvedDelta.actual)
    ) {
      return undefined;
    }

    return {
      ...delta,
      rationale: approvedDelta.rationale,
    };
  });

  return classifiedDeltas.every(isMigrationDelta) ? classifiedDeltas : undefined;
}

function hasIntentionalGeneratedMetadataAbsenceDelta(
  deltas: ReadonlyMap<string, MigrationDelta>,
  path: string,
  checkedValue: MigrationDeltaValue,
): boolean {
  const delta = deltas.get(path);

  if (delta === undefined || !deltaValuesEqual(delta.actual, checkedValue)) {
    return false;
  }

  return path === "generated.present" ? delta.expected === false : isMissingValue(delta.expected);
}

function isManualGeneratedMetadataAbsenceDelta(delta: MigrationDelta): boolean {
  if (!delta.path.startsWith("generated.")) {
    return false;
  }

  return delta.path === "generated.present"
    ? delta.expected === false && delta.actual === true
    : isMissingValue(delta.expected);
}

function entriesByPath(
  entries: readonly MigrationNormalizedEntry[],
): ReadonlyMap<string, MigrationDeltaValue> {
  return new Map(entries.map((entry) => [entry.path, entry.value]));
}

function haveSamePaths(
  left: ReadonlyMap<string, unknown>,
  right: ReadonlyMap<string, unknown>,
): boolean {
  if (left.size !== right.size) {
    return false;
  }

  return [...left.keys()].every((path) => right.has(path));
}

function deltaValuesEqual(left: MigrationDeltaValue, right: MigrationDeltaValue): boolean {
  if (isMissingValue(left) || isMissingValue(right)) {
    return isMissingValue(left) && isMissingValue(right);
  }

  return left === right;
}

function isMissingValue(value: MigrationDeltaValue): value is MigrationMissingValue {
  return typeof value === "object" && value !== null && value.kind === "missing";
}

function isMigrationDelta(value: MigrationDelta | undefined): value is MigrationDelta {
  return value !== undefined;
}
