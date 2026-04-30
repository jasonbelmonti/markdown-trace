export type ValidationStatus = "passed" | "failed";

export type ValidationFindingCategory =
  | "missing-registered-definition"
  | "missing-reference"
  | "missing-edge-target"
  | "incomplete-range";

export interface ValidationFinding {
  readonly category: ValidationFindingCategory;
  readonly message: string;
  readonly entityId?: string;
  readonly label?: string;
  readonly relationship?: string;
  readonly targetId?: string;
}

export interface ValidationSummary {
  readonly registeredEntityCount: number;
  readonly scannedDefinitionCount: number;
  readonly scannedReferenceCount: number;
  readonly scannedRangeCount: number;
  readonly findingCount: number;
}

export interface ValidationResult {
  readonly status: ValidationStatus;
  readonly findings: readonly ValidationFinding[];
  readonly summary: ValidationSummary;
}
