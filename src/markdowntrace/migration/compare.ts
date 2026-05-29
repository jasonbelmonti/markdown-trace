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
import { normalizeMigrationComparison } from "./normalize.js";

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

    return classifyDimension(dimension, diffEntries(manual, generated), input.documentPath);
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
  documentPath: string,
): MigrationDimensionResult {
  if (deltas.length === 0) {
    return {
      dimension,
      status: "equivalent",
      deltas: [],
    };
  }

  const status: MigrationDimensionStatus =
    dimension === "metadata" && isIntentionalGeneratedMetadataDelta(deltas, documentPath)
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
  documentPath: string,
): boolean {
  const deltaByPath = new Map(deltas.map((delta) => [delta.path, delta]));

  return (
    deltaByPath.get("generated.present")?.expected === false &&
    deltaByPath.get("generated.present")?.actual === true &&
    deltaByPath.get("generated.source.documentPath")?.actual === documentPath &&
    deltaByPath.get("generated.artifactVersion")?.actual ===
      "markdown-trace.generated-sidecar.v0" &&
    deltaByPath.get("generated.artifactKind")?.actual === "registry" &&
    deltaByPath.get("generated.reviewMarker")?.actual === "generated-by-markdown-trace" &&
    deltaByPath.get("generated.humanEditable")?.actual === false &&
    deltaByPath.get("generated.generator.packageName")?.actual === "markdown-trace" &&
    deltaByPath.get("generated.generator.serialization")?.actual === "yaml-lf-final-newline-v0"
  );
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
