import type { TraceGraph } from "../graph/index.js";
import type { EntityRegistry, GeneratedSidecarArtifact } from "../registry/index.js";
import type { ValidationResult } from "../validation/index.js";

export const MIGRATION_COMPARISON_DIMENSIONS = [
  "registry",
  "graph",
  "metadata",
  "validation",
] as const;

export const MIGRATION_COMPARISON_SIDES = ["manual", "generated"] as const;

export const MIGRATION_DIMENSION_STATUSES = [
  "equivalent",
  "intentional",
  "blocking",
] as const;

export type MigrationComparisonDimension = (typeof MIGRATION_COMPARISON_DIMENSIONS)[number];
export type MigrationComparisonSide = (typeof MIGRATION_COMPARISON_SIDES)[number];
export type MigrationDimensionStatus = (typeof MIGRATION_DIMENSION_STATUSES)[number];

export type MigrationNormalizedValue = string | number | boolean | null;

export interface MigrationNormalizedEntry {
  readonly path: string;
  readonly value: MigrationNormalizedValue;
}

export interface MigrationDimensionSnapshot {
  readonly side: MigrationComparisonSide;
  readonly entries: readonly MigrationNormalizedEntry[];
}

export interface MigrationNormalizedDimension {
  readonly dimension: MigrationComparisonDimension;
  readonly snapshots: readonly MigrationDimensionSnapshot[];
}

export interface MigrationNormalizedComparison {
  readonly dimensions: readonly MigrationNormalizedDimension[];
}

export interface MigrationDelta {
  readonly path: string;
  readonly expected: MigrationNormalizedValue;
  readonly actual: MigrationNormalizedValue;
  readonly rationale: string;
}

export interface MigrationDimensionResult {
  readonly dimension: MigrationComparisonDimension;
  readonly status: MigrationDimensionStatus;
  readonly deltas: readonly MigrationDelta[];
}

export interface MigrationComparisonReport {
  readonly documentPath: string;
  readonly manualRegistryPath: string;
  readonly generatedSidecarPath: string;
  readonly dimensions: readonly MigrationDimensionResult[];
  readonly exitCode: number;
}

export interface MigrationValidationInput {
  readonly exitCode: number;
  readonly result: ValidationResult;
}

export type MigrationGeneratedMetadata = GeneratedSidecarArtifact["generated"];

export interface MigrationComparisonSideInput {
  readonly registry: EntityRegistry;
  readonly graph: TraceGraph;
  readonly metadata?: MigrationGeneratedMetadata;
  readonly validation: MigrationValidationInput;
}

export interface MigrationNormalizationInput {
  readonly manual: MigrationComparisonSideInput;
  readonly generated: MigrationComparisonSideInput;
}
