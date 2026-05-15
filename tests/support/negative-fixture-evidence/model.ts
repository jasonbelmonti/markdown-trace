import type { EntityRegistry } from "../../../src/markdowntrace/registry/index.js";
import type { ValidationFinding } from "../../../src/markdowntrace/validation/index.js";

export interface VariantOutcome {
  readonly name: string;
  readonly proofSurface: string;
  readonly expectedOutcome: string;
  readonly actualOutcome: string;
  readonly status: string;
  readonly findings: readonly ValidationFinding[];
}

export interface NegativeEvidence {
  readonly registry: EntityRegistry;
  readonly enginePackage: string;
  readonly documentVersion: string;
  readonly outcomes: readonly VariantOutcome[];
}
