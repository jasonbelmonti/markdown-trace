import type {
  EntityRegistry,
  ExternalReference,
  RegistryDocument,
  RegistryEdge,
  RegistryEntity,
} from "./model.js";

export interface SerializedRegistryEdge {
  readonly from: string;
  readonly relationship: string;
  readonly to: string;
}

export interface SerializedRegistry {
  readonly registryVersion: string;
  readonly document: RegistryDocument;
  readonly entities: readonly RegistryEntity[];
  readonly edges: readonly SerializedRegistryEdge[];
  readonly externalRefs: readonly ExternalReference[];
}

export function serializeRegistry(registry: EntityRegistry): SerializedRegistry {
  return {
    registryVersion: registry.registryVersion,
    document: registry.document,
    entities: registry.entities,
    edges: registry.edges.map(serializeEdge),
    externalRefs: registry.externalRefs,
  };
}

function serializeEdge(edge: RegistryEdge): SerializedRegistryEdge {
  return {
    from: edge.source,
    relationship: edge.relationship,
    to: edge.target,
  };
}
