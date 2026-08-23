import type {
  GraphDiagnosticCode,
  GraphEvidenceRole,
  GraphIdFamilyPolicy,
  GraphRelationshipClass,
  GraphRepeatedIdPolicy,
  GraphRepairActionKind,
  GraphTableEffect,
} from "../model.js";

export const ARTIFACT_FAMILIES = ["execution-spec", "design-spec"] as const;
export const ID_FAMILY_POLICIES = [
  "primary_definition",
  "supplemental_definition",
  "terminal_coverage_node",
  "mention_only",
  "coverage_or_mention_only",
] as const satisfies readonly GraphIdFamilyPolicy[];
export const REPEATED_ID_POLICIES = [
  "single_primary_with_references",
  "primary_with_supplemental_definition",
  "terminal_coverage_node",
  "coverage_or_reference_only",
  "mention_only",
  "non_authoritative_table_candidate",
] as const satisfies readonly GraphRepeatedIdPolicy[];
export const EVIDENCE_ROLES = [
  "primary_definition",
  "supplemental_definition",
  "coverage_reference",
  "mention",
  "table_evidence_candidate",
  "range_evidence",
  "matrix_coverage",
] as const satisfies readonly GraphEvidenceRole[];
export const TABLE_EFFECTS = [
  "create_relationships",
  "create_coverage_rows",
  "create_supplemental_definitions",
  "emit_diagnostics",
] as const satisfies readonly GraphTableEffect[];
export const RELATIONSHIP_CLASSES = [
  "objective_implemented_by",
  "work_validated_by",
  "validation_supported_by",
  "objective_supported_by_evidence",
  "requirement_realized_by_behavior",
  "behavior_allocated_to_mechanism",
  "requirement_accepted_by",
  "behavior_accepted_by",
  "requirement_validated_by",
  "mechanism_verified_by",
  "matrix_coverage",
  "coverage_range",
] as const satisfies readonly GraphRelationshipClass[];
export const DIAGNOSTIC_CODES = [
  "markdown-trace.graph.unresolved_reference",
  "markdown-trace.graph.duplicate_primary_definition",
  "markdown-trace.graph.invalid_range_endpoint",
  "markdown-trace.graph.missing_matrix_coverage",
  "markdown-trace.graph.missing_required_path",
  "markdown-trace.graph.profile_error",
] as const satisfies readonly GraphDiagnosticCode[];
export const REQUIRED_PATH_DIAGNOSTIC_CODES = [
  "markdown-trace.graph.missing_required_path",
  "markdown-trace.graph.missing_matrix_coverage",
] as const;
export const REPAIR_ACTION_KINDS = [
  "define_missing_id",
  "remove_or_replace_reference",
  "deduplicate_primary_definition",
  "define_range_endpoint",
  "narrow_range",
  "add_matrix_coverage",
  "add_required_relationship_evidence",
  "fix_graph_profile",
] as const satisfies readonly GraphRepairActionKind[];

export class ProfileSchemaFailure extends Error {
  constructor(readonly path: string, message: string) {
    super(message);
  }
}

export function record(
  value: unknown,
  path: string,
  allowedKeys?: readonly string[],
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "must be a mapping");
  }
  const result = value as Record<string, unknown>;
  if (allowedKeys !== undefined) {
    const unknownKeys = Object.keys(result).filter((key) => !allowedKeys.includes(key));
    if (unknownKeys.length > 0) {
      fail(path, `contains unsupported field ${unknownKeys.sort()[0]}`);
    }
  }
  return result;
}

export function string(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(path, "must be a non-empty string");
  }
  return value;
}

export function stringList(value: unknown, path: string, allowEmpty = false): readonly string[] {
  const values = array(value, path, (item, itemPath) => string(item, itemPath));
  if (!allowEmpty && values.length === 0) {
    fail(path, "must be a non-empty list");
  }
  unique(values, path);
  return values;
}

export function tokenList<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): readonly T[] {
  const values = array(value, path, (item, itemPath) => token(item, allowed, itemPath));
  if (values.length === 0) {
    fail(path, "must be a non-empty list");
  }
  unique(values, path);
  return values;
}

export function token<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    fail(path, `must be one of ${allowed.join(", ")}`);
  }
  return value as T;
}

export function literal<T extends string | boolean>(value: unknown, expected: T, path: string): T {
  if (value !== expected) {
    fail(path, `must be ${String(expected)}`);
  }
  return expected;
}

export function array<T>(
  value: unknown,
  path: string,
  parse: (item: unknown, itemPath: string) => T,
): readonly T[] {
  if (!Array.isArray(value)) {
    fail(path, "must be a list");
  }
  return value.map((item, index) => parse(item, `${path}[${index}]`));
}

export function nonEmptyArray<T>(
  value: unknown,
  path: string,
  parse: (item: unknown, itemPath: string) => T,
): readonly T[] {
  const values = array(value, path, parse);
  if (values.length === 0) {
    fail(path, "must be a non-empty list");
  }
  return values;
}

export function emptyArray(value: unknown, path: string): readonly [] {
  const values = array(value, path, (item) => item);
  if (values.length > 0) {
    fail(path, "must be an empty list");
  }
  return [] as const;
}

export function unique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) {
    fail(path, "must not contain duplicates");
  }
}

export function requireFamilies(
  values: readonly string[],
  families: ReadonlySet<string>,
  path: string,
): void {
  for (const family of values) {
    if (!families.has(family)) {
      fail(path, "references unknown family");
    }
  }
}

export function setKey(values: readonly string[]): string {
  return [...new Set(values)].sort().join("\u0000");
}

export function fail(path: string, message: string): never {
  throw new ProfileSchemaFailure(path, message);
}

export function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}
