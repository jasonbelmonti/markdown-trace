import type { MarkdownAdapterMetadata } from "../markdown/index.js";

export type ValidationFindingCategory =
  | "adapter_diagnostic"
  | "missing_registered_definition"
  | "missing_expected_reference"
  | "missing_expected_range"
  | "missing_edge_target";

export interface ValidationFinding {
  readonly category: ValidationFindingCategory;
  readonly entityId?: string;
  readonly label?: string;
  readonly edgeRelationship?: string;
  readonly message: string;
}

export interface ValidationSummary {
  readonly entities: number;
  readonly definitionsResolved: number;
  readonly expectedReferencesResolved: number;
  readonly expectedRangesResolved: number;
  readonly edgesResolved: number;
  readonly findings: number;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly metadata: MarkdownAdapterMetadata;
  readonly findings: readonly ValidationFinding[];
  readonly summary: ValidationSummary;
}
