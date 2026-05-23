export {
  DEFAULT_DERIVED_ENTITY_TYPES,
  DERIVED_EDGE_RELATIONSHIP,
  DERIVED_REGISTRY_VERSION,
  deriveRegistryFromMarkdown,
  deriveRegistryFromMarkdownText,
  deriveRegistryResultFromMarkdown,
  deriveRegistryResultFromMarkdownText,
  type DerivedEntityTypeMap,
  type DerivedRegistryDiagnostic,
  type DerivedRegistryOptions,
  type DerivedRegistryResult,
} from "./derived.js";
export { loadRegistry } from "./loader.js";
export {
  buildGeneratedSidecarArtifact,
  generatedSidecarRelativePath,
  serializeGeneratedSidecar,
  writeGeneratedSidecarArtifact,
  type BuildGeneratedSidecarOptions,
  type GeneratedSidecarArtifact,
  type GeneratedSidecarResult,
} from "./generated-sidecar.js";
export {
  serializeRegistry,
  type SerializedRegistry,
  type SerializedRegistryEdge,
} from "./serialization.js";
export {
  EntityRegistry,
  RegistryLoadError,
  type Definition,
  type ExpectedRange,
  type ExpectedReferences,
  type ExternalReference,
  type RegistryDocument,
  type RegistryEdge,
  type RegistryEntity,
} from "./model.js";
