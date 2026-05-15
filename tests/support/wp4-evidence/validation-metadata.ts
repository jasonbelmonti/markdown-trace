import { scanMarkdown } from "../../../src/markdowntrace/markdown/index.js";
import { loadRegistry } from "../../../src/markdowntrace/registry/index.js";
import { documentPath, registryPath } from "./paths.js";

export interface ValidationMetadataEvidence {
  readonly enginePackage: string;
  readonly documentVersion: string;
}

export async function readValidationMetadata(): Promise<ValidationMetadataEvidence> {
  const registry = await loadRegistry(registryPath);
  const adapterFacts = await scanMarkdown(documentPath, registry);

  return {
    enginePackage: `${adapterFacts.metadata.enginePackage.name}@${adapterFacts.metadata.enginePackage.version}`,
    documentVersion: adapterFacts.metadata.documentVersion,
  };
}
