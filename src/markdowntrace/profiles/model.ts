export class TypeProfileLoadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TypeProfileLoadError";
  }
}

export const TYPE_PROFILE_VERSION = "markdown-trace.type-profile.v1";

export interface EntityTypeRule {
  readonly labelPrefixes?: readonly string[];
  readonly canonicalPattern?: string;
}

export interface EntityTypeProfile {
  readonly profileVersion: typeof TYPE_PROFILE_VERSION;
  readonly entityTypes: Readonly<Record<string, EntityTypeRule>>;
}

export interface ProfiledEntityDefinition {
  readonly canonicalId: string;
  readonly label: string;
  readonly type?: string;
}

export function requireProfiledEntityType(
  definition: ProfiledEntityDefinition,
  typeProfile: EntityTypeProfile,
): string {
  if (definition.type === undefined) {
    throw new TypeProfileLoadError(
      `ctx://trace definition for '${definition.canonicalId}' must include a type`,
    );
  }

  const rule = typeProfile.entityTypes[definition.type];

  if (rule === undefined) {
    throw new TypeProfileLoadError(
      `entity type '${definition.type}' is not declared by the active profile`,
    );
  }

  assertLabelMatchesRule(definition, rule);
  assertCanonicalIdMatchesRule(definition, rule);

  return definition.type;
}

function assertLabelMatchesRule(
  definition: ProfiledEntityDefinition,
  rule: EntityTypeRule,
): void {
  if (rule.labelPrefixes === undefined) {
    return;
  }

  if (!rule.labelPrefixes.some((prefix) => labelHasPrefix(definition.label, prefix))) {
    throw new TypeProfileLoadError(
      `label '${definition.label}' does not match type '${definition.type}' label prefixes`,
    );
  }
}

function labelHasPrefix(label: string, prefix: string): boolean {
  return label === prefix || label.startsWith(`${prefix}-`);
}

function assertCanonicalIdMatchesRule(
  definition: ProfiledEntityDefinition,
  rule: EntityTypeRule,
): void {
  if (rule.canonicalPattern === undefined) {
    return;
  }

  if (!new RegExp(rule.canonicalPattern).test(definition.canonicalId)) {
    throw new TypeProfileLoadError(
      `canonical id '${definition.canonicalId}' does not match type '${definition.type}' pattern`,
    );
  }
}
