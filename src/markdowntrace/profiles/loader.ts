import { readFile } from "node:fs/promises";

import { parseAllDocuments } from "yaml";

import {
  TYPE_PROFILE_VERSION,
  TypeProfileLoadError,
  type EntityTypeProfile,
  type EntityTypeRule,
} from "./model.js";

export async function loadTypeProfile(profilePath: string): Promise<EntityTypeProfile> {
  let profileText: string;

  try {
    profileText = await readFile(profilePath, "utf8");
  } catch (error) {
    throw new TypeProfileLoadError(`${profilePath} cannot be read`, { cause: error });
  }

  let documents: ReturnType<typeof parseAllDocuments>;

  try {
    documents = parseAllDocuments(profileText);
  } catch (error) {
    throw new TypeProfileLoadError(`${profilePath} contains invalid YAML`, { cause: error });
  }

  if (documents.length !== 1) {
    throw new TypeProfileLoadError(`${profilePath} must contain exactly one YAML document`);
  }

  const [document] = documents;
  if (document.errors.length > 0) {
    throw new TypeProfileLoadError(`${profilePath} contains invalid YAML`, {
      cause: document.errors[0],
    });
  }

  let profileData: unknown;

  try {
    profileData = document.toJSON();
  } catch (error) {
    throw new TypeProfileLoadError(`${profilePath} contains invalid YAML`, { cause: error });
  }

  return parseTypeProfileData(profileData, profilePath);
}

export function parseTypeProfileData(data: unknown, sourceName = "type profile"): EntityTypeProfile {
  const root = asRecord(data);

  if (root === undefined) {
    throw new TypeProfileLoadError(`${sourceName} must be a YAML mapping`);
  }

  if (root.profileVersion !== TYPE_PROFILE_VERSION) {
    throw new TypeProfileLoadError(
      `${sourceName} profileVersion must be ${TYPE_PROFILE_VERSION}`,
    );
  }

  const entityTypes = asRecord(root.entityTypes);
  if (entityTypes === undefined || Object.keys(entityTypes).length === 0) {
    throw new TypeProfileLoadError(`${sourceName} entityTypes must be a non-empty mapping`);
  }

  return {
    profileVersion: TYPE_PROFILE_VERSION,
    entityTypes: Object.fromEntries(
      Object.entries(entityTypes).map(([name, value]) => [
        parseTypeName(name, sourceName),
        parseEntityTypeRule(value, `${sourceName} entityTypes.${name}`),
      ]),
    ),
  };
}

function parseEntityTypeRule(value: unknown, sourceName: string): EntityTypeRule {
  const record = asRecord(value);

  if (record === undefined) {
    throw new TypeProfileLoadError(`${sourceName} must be a mapping`);
  }

  const labelPrefixes = optionalStringList(record.labelPrefixes, `${sourceName}.labelPrefixes`);
  const canonicalPattern = optionalString(record.canonicalPattern, `${sourceName}.canonicalPattern`);

  if (canonicalPattern !== undefined) {
    try {
      new RegExp(canonicalPattern);
    } catch (error) {
      throw new TypeProfileLoadError(`${sourceName}.canonicalPattern must be a valid RegExp`, {
        cause: error,
      });
    }
  }

  return {
    ...(labelPrefixes === undefined ? {} : { labelPrefixes }),
    ...(canonicalPattern === undefined ? {} : { canonicalPattern }),
  };
}

function parseTypeName(name: string, sourceName: string): string {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new TypeProfileLoadError(`${sourceName} entity type '${name}' is invalid`);
  }

  return name;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function optionalString(value: unknown, sourceName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeProfileLoadError(`${sourceName} must be a non-empty string`);
  }

  return value;
}

function optionalStringList(value: unknown, sourceName: string): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    throw new TypeProfileLoadError(`${sourceName} must be a non-empty string list`);
  }

  return value;
}
