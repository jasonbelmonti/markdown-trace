import {
  type MigrationComparisonReport,
  type MigrationComparisonReportInput,
  type MigrationDelta,
  type MigrationDeltaValue,
  type MigrationMissingValue,
  type MigrationNormalizedEntry,
} from "./model.js";
import { classifyMigrationDimension } from "./classification.js";
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

    return classifyMigrationDimension({
      dimension,
      deltas: diffEntries(manual, generated),
      authorityState: input.authorityState,
      documentPath: input.documentPath,
      approvedIntentionalDeltas: input.approvedIntentionalDeltas,
      generatedMetadataCheck: input.generatedMetadataCheck,
    });
  });

  return {
    documentPath: input.documentPath,
    manualRegistryPath: input.manualRegistryPath,
    generatedSidecarPath: input.generatedSidecarPath,
    dimensions,
    exitCode: dimensions.some((dimension) => dimension.status === "blocking") ? 1 : 0,
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

function compareTexts(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
