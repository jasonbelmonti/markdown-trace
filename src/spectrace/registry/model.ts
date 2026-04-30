export class RegistryLoadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RegistryLoadError";
  }
}

export interface Definition {
  readonly kind: string;
  readonly text: string;
}

export interface ExpectedRange {
  readonly labelFamily: string;
  readonly start: string;
  readonly end: string;
  readonly expandsTo: readonly string[];
}

export interface ExpectedReferences {
  readonly labels: readonly string[];
  readonly ranges: readonly ExpectedRange[];
}

export interface RegistryEntity {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly defines: Definition;
  readonly expectedReferences: ExpectedReferences;
}

export interface RegistryEdge {
  readonly source: string;
  readonly relationship: string;
  readonly target: string;
}

export interface ExternalReference {
  readonly system: string;
  readonly key: string;
  readonly relatedEntity: string;
  readonly role: string;
}

export interface RegistryDocument {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly fixtureFamily: string;
  readonly sourceDocs: readonly string[];
}

interface EntityRegistryInput {
  readonly registryVersion: string;
  readonly document: RegistryDocument;
  readonly entities: readonly RegistryEntity[];
  readonly edges: readonly RegistryEdge[];
  readonly externalRefs: readonly ExternalReference[];
}

export class EntityRegistry {
  readonly registryVersion: string;
  readonly document: RegistryDocument;
  readonly entities: readonly RegistryEntity[];
  readonly edges: readonly RegistryEdge[];
  readonly externalRefs: readonly ExternalReference[];
  readonly entitiesById: ReadonlyMap<string, RegistryEntity>;
  readonly entitiesByLabel: ReadonlyMap<string, RegistryEntity>;

  constructor(input: EntityRegistryInput) {
    this.registryVersion = input.registryVersion;
    this.document = input.document;
    this.entities = input.entities;
    this.edges = input.edges;
    this.externalRefs = input.externalRefs;
    this.entitiesById = new Map(input.entities.map((entity) => [entity.id, entity]));
    this.entitiesByLabel = new Map(input.entities.map((entity) => [entity.label, entity]));
  }
}
