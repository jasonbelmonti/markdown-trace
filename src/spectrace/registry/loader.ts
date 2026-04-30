import { readFile } from "node:fs/promises";

import { parseAllDocuments } from "yaml";

import { EntityRegistry, RegistryLoadError } from "./model.js";
import { parseRegistryData } from "./schema.js";

export async function loadRegistry(path: string): Promise<EntityRegistry> {
  let registryText: string;

  try {
    registryText = await readFile(path, "utf8");
  } catch (error) {
    throw new RegistryLoadError(`${path} cannot be read`, { cause: error });
  }

  let documents: ReturnType<typeof parseAllDocuments>;

  try {
    documents = parseAllDocuments(registryText);
  } catch (error) {
    throw new RegistryLoadError(`${path} contains invalid YAML`, { cause: error });
  }

  if (documents.length !== 1) {
    throw new RegistryLoadError(`${path} must contain exactly one YAML document`);
  }

  const [document] = documents;
  if (document.errors.length > 0) {
    throw new RegistryLoadError(`${path} contains invalid YAML`, {
      cause: document.errors[0],
    });
  }

  let registryData: unknown;

  try {
    registryData = document.toJSON();
  } catch (error) {
    throw new RegistryLoadError(`${path} contains invalid YAML`, { cause: error });
  }

  return parseRegistryData(registryData);
}
