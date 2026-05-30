import {
  type MigrationComparisonDimension,
  type MigrationComparisonReport,
  type MigrationComparisonReportInput,
  type MigrationDelta,
  type MigrationDeltaValue,
  type MigrationDimensionResult,
  type MigrationDimensionStatus,
  type MigrationMissingValue,
  type MigrationNormalizedEntry,
} from "./model.js";
import { normalizeMetadataEntries, normalizeMigrationComparison } from "./normalize.js";

const MISSING_VALUE = {
  kind: "missing",
} satisfies MigrationMissingValue;

export function compareMigrationPair(
  input: MigrationComparisonReportInput,
): MigrationComparisonReport {
  const normalized = normalizeMigrationComparison(input);
  const dimensions = normalized.dimensions.map(({ dimension, snapshots }) => {
    const manual = snapshots?.find((snapshot) => snapshot.side === "manual")?.entries ?? [];
    const generated = snapshots?.find((snapshot) => snapshot.side === "generated")?.entries ?? [];

    return classifyDimension(dimension, diffEntries(manual, generated), input);
  });

  return {
    documentPath: input.documentPath,
    manualRegistryPath: input.manualRegistryPath,
    generatedSidecarPath: input.generatedSidecarPath,
    dimensions,
    exitCode: dimensions.some((dimension) => dimension.status === "blocking") ? 1 : 0,
  };
}

function classifyDimension(
  dimension: MigrationComparisonDimension,
  deltas: readonly MigrationDelta[],
  input: MigrationComparisonReportInput,
): MigrationDimensionResult {
  if (deltas.length === 0) {
    return {
      dimension,
      status: "equivalent",
      deltas: [],
    };
  }

  const status: MigrationDimensionStatus =
    dimension === "metadata" && isIntentionalGeneratedMetadataDelta(deltas, input)
      ? "intentional"
      : "blocking";
  const intentionalRationale = [
    "Manual YAML has no generated metadata while the fixture remains yaml-authoritative;",
    "generated sidecar metadata is checked evidence under the R2 contract.",
  ].join(" ");
  const rationale =
    status === "intentional"
      ? intentionalRationale
      : `Manual and generated ${dimension} entries differ; unexplained drift blocks parity approval.`;

  return {
    dimension,
    status,
    deltas: deltas.map((delta) => ({
      ...delta,
      rationale,
    })),
  };
}

function diffEntries(
  manual: readonly MigrationNormalizedEntry[],
  generated: readonly MigrationNormalizedEntry[],
): readonly MigrationDelta[] {
  const manualEntries = entriesByPath(manual);
  const generatedEntries = entriesByPath(generated);
  const paths = [...new Set([...manualEntries.keys(), ...generatedEntries.keys()])].sort(
    compareTexts,
  );

  return paths.flatMap((entryPath) => {
    const expected = entryValue(manualEntries, entryPath);
    const actual = entryValue(generatedEntries, entryPath);

    return expected === actual
      ? []
      : [
          {
            path: entryPath,
            expected,
            actual,
            rationale: "",
          },
        ];
  });
}

function entriesByPath(
  entries: readonly MigrationNormalizedEntry[],
): ReadonlyMap<string, MigrationDeltaValue> {
  return new Map(entries.map((entry) => [entry.path, entry.value]));
}

function entryValue(
  entries: ReadonlyMap<string, MigrationDeltaValue>,
  path: string,
): MigrationDeltaValue {
  return entries.has(path) ? (entries.get(path) as MigrationDeltaValue) : MISSING_VALUE;
}

function isIntentionalGeneratedMetadataDelta(
  deltas: readonly MigrationDelta[],
  input: MigrationComparisonReportInput,
): boolean {
  if (input.generatedMetadataCheck?.valid !== true) {
    return false;
  }

  const deltaByPath = new Map(deltas.map((delta) => [delta.path, delta]));
  const checkedMetadataEntries = normalizeMetadataEntries(input.generatedMetadataCheck.metadata);
  const checkedMetadataByPath = entriesByPath(checkedMetadataEntries);

  return (
    haveSamePaths(deltaByPath, checkedMetadataByPath) &&
    checkedMetadataByPath.get("generated.present") === true &&
    checkedMetadataByPath.get("generated.source.documentPath") === input.documentPath &&
    checkedMetadataByPath.get("generated.artifactVersion") ===
      "markdown-trace.generated-sidecar.v0" &&
    checkedMetadataByPath.get("generated.artifactKind") === "registry" &&
    checkedMetadataByPath.get("generated.reviewMarker") === "generated-by-markdown-trace" &&
    checkedMetadataByPath.get("generated.humanEditable") === false &&
    checkedMetadataByPath.get("generated.generator.packageName") === "markdown-trace" &&
    checkedMetadataByPath.get("generated.generator.serialization") ===
      "yaml-lf-final-newline-v0" &&
    checkedMetadataEntries.every((entry) =>
      hasIntentionalMetadataDelta(deltaByPath, entry.path, entry.value),
    )
  );
}

function hasIntentionalMetadataDelta(
  deltas: ReadonlyMap<string, MigrationDelta>,
  path: string,
  checkedValue: MigrationDeltaValue,
): boolean {
  const delta = deltas.get(path);

  if (delta === undefined || delta.actual !== checkedValue) {
    return false;
  }

  return path === "generated.present" ? delta.expected === false : isMissingValue(delta.expected);
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

function isMissingValue(value: MigrationDeltaValue): value is MigrationMissingValue {
  return typeof value === "object" && value !== null && value.kind === "missing";
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
