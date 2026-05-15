import { readFile } from "node:fs/promises";

import { expect } from "vitest";
import { parse, stringify } from "yaml";

import {
  loadRegistry,
  RegistryLoadError,
  type RegistryEntity,
} from "../../../src/markdowntrace/registry/index.js";
import type { VariantOutcome } from "./model.js";
import { registryPath } from "./paths.js";
import { withTemporaryFile } from "./temp-files.js";

type RawRegistry = {
  entities: RegistryEntity[];
};

export async function duplicateCanonicalIdOutcome(): Promise<VariantOutcome> {
  const error = await loadMutatedRegistry((rawRegistry) => {
    const source = requiredEntity(rawRegistry.entities, "exec.wp.1");
    rawRegistry.entities.push({ ...source, label: "WP-1-DUPLICATE" });
  });

  expect(error.message).toBe("entities[].id contains duplicate value 'exec.wp.1'");

  return {
    name: "duplicate-canonical-id",
    proofSurface: "registry load",
    expectedOutcome: "documented registry-load failure mode",
    actualOutcome: "`RegistryLoadError`: `entities[].id contains duplicate value 'exec.wp.1'`",
    status: "LOAD ERROR",
    findings: [],
  };
}

export async function duplicateLabelOutcome(): Promise<VariantOutcome> {
  const error = await loadMutatedRegistry((rawRegistry) => {
    const source = requiredEntity(rawRegistry.entities, "exec.wp.1");
    rawRegistry.entities.push({ ...source, id: "exec.wp.99" });
  });

  expect(error.message).toBe("entities[].label contains duplicate value 'WP-1'");

  return {
    name: "duplicate-label",
    proofSurface: "registry load",
    expectedOutcome: "documented registry-load failure mode",
    actualOutcome: "`RegistryLoadError`: `entities[].label contains duplicate value 'WP-1'`",
    status: "LOAD ERROR",
    findings: [],
  };
}

async function loadMutatedRegistry(
  mutate: (rawRegistry: RawRegistry) => void,
): Promise<RegistryLoadError> {
  const rawRegistry = parse(await readFile(registryPath, "utf8")) as RawRegistry;
  mutate(rawRegistry);

  return await withTemporaryFile(
    "negative-registry-",
    "entity-registry.yaml",
    stringify(rawRegistry),
    async (file) => {
      try {
        await loadRegistry(file);
      } catch (error) {
        expect(error).toBeInstanceOf(RegistryLoadError);
        return error as RegistryLoadError;
      }

      throw new Error("mutated registry unexpectedly loaded");
    },
  );
}

function requiredEntity(
  entities: readonly RegistryEntity[],
  entityId: string,
): RegistryEntity {
  const entity = entities.find((candidate) => candidate.id === entityId);

  if (entity === undefined) {
    throw new Error(`${entityId} is required by the fixture`);
  }

  return entity;
}
