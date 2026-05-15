import type { EntityRegistry } from "../registry/index.js";
import type { ValidationResult } from "../validation/index.js";

export interface ValidationReportInput {
  readonly evidenceId: string;
  readonly validationCheckpoint: string;
  readonly registryPath: string;
  readonly documentPath: string;
  readonly result: ValidationResult;
  readonly registry: EntityRegistry;
  readonly exitCode: number;
}
