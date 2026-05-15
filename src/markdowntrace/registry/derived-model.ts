import type { EntityRegistry, ExternalReference } from "./model.js";

export const DERIVED_REGISTRY_VERSION = "markdown-trace.derived-registry.v0";
export const DERIVED_EDGE_RELATIONSHIP = "references";

export const DEFAULT_DERIVED_ENTITY_TYPES = {
  CON: "constraint",
  PKG: "package_boundary",
  WP: "work_package",
  MS: "milestone",
  VAL: "validation_checkpoint",
  EVD: "evidence_artifact",
} as const;

export type DerivedEntityTypeMap = Readonly<Record<string, string>>;

export interface DerivedRegistryOptions {
  readonly namespace?: string;
  readonly registryVersion?: string;
  readonly documentId?: string;
  readonly documentPath?: string;
  readonly title?: string;
  readonly fixtureFamily?: string;
  readonly sourceDocs?: readonly string[];
  readonly externalRefs?: readonly ExternalReference[];
  readonly entityTypes?: DerivedEntityTypeMap;
}

export interface DerivedRegistryDiagnostic {
  readonly stage: "parse" | "normalize";
  readonly code: string;
  readonly message: string;
  readonly severity: string;
}

export interface DerivedRegistryResult {
  readonly registry: EntityRegistry;
  readonly diagnostics: readonly DerivedRegistryDiagnostic[];
}

export interface TraceFrontmatterConfig {
  readonly namespace?: string;
  readonly registryVersion?: string;
  readonly documentId?: string;
  readonly title?: string;
  readonly fixtureFamily?: string;
  readonly sourceDocs?: readonly string[];
  readonly externalRefs?: readonly ExternalReference[];
  readonly entityTypes?: DerivedEntityTypeMap;
}
