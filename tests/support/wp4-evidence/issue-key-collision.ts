import { readFile } from "node:fs/promises";

import { deriveGraphFromRegistry } from "../../../src/markdowntrace/graph/index.js";
import { scanMarkdown } from "../../../src/markdowntrace/markdown/index.js";
import {
  deriveRegistryResultFromMarkdown,
  loadRegistry,
} from "../../../src/markdowntrace/registry/index.js";
import type { GraphExclusionEvidence, IssueKeyCollisionEvidence } from "./model.js";
import { displayDocumentPath, documentPath, registryPath } from "./paths.js";

const issueKey = "BEL-858";

export async function collectIssueKeyCollisionEvidence(): Promise<IssueKeyCollisionEvidence> {
  const documentText = await readFile(documentPath, "utf8");
  const registry = await loadRegistry(registryPath);
  const adapterFacts = await scanMarkdown(documentPath, registry);
  const sidecarGraph = deriveGraphFromRegistry(registry);
  const derived = await deriveRegistryResultFromMarkdown(documentPath, {
    documentPath: displayDocumentPath,
    namespace: "exec",
  });
  const derivedGraph = deriveGraphFromRegistry(derived.registry);

  return {
    issueKey,
    registryVersion: registry.registryVersion,
    enginePackage: `${adapterFacts.metadata.enginePackage.name}@${adapterFacts.metadata.enginePackage.version}`,
    documentVersion: adapterFacts.metadata.documentVersion,
    surfaces: [
      graphEvidence("sidecar registry graph", documentText, registry, sidecarGraph),
      graphEvidence("derived registry graph", documentText, derived.registry, derivedGraph),
    ],
  };
}

function graphEvidence(
  surface: string,
  documentText: string,
  registry: {
    readonly entities: readonly { readonly id: string; readonly label: string }[];
    readonly edges: readonly { readonly source: string; readonly target: string }[];
    readonly entitiesById: ReadonlyMap<string, { readonly label: string }>;
    readonly externalRefs: readonly { readonly key: string; readonly relatedEntity: string }[];
  },
  graph: {
    readonly nodes: readonly { readonly id: string; readonly label: string }[];
    readonly edges: readonly { readonly source: string; readonly target: string }[];
  },
): GraphExclusionEvidence {
  return {
    surface,
    containsIssueKeyInInput: documentText.includes(issueKey),
    entityIds: registry.entities.map((entity) => entity.id),
    entityLabels: registry.entities.map((entity) => entity.label),
    graphNodeIds: graph.nodes.map((node) => node.id),
    graphNodeLabels: graph.nodes.map((node) => node.label),
    graphEdgeEndpointIds: graph.edges.flatMap((edge) => [edge.source, edge.target]),
    graphEdgeEndpointLabels: graph.edges.flatMap((edge) => [
      labelFor(registry, edge.source),
      labelFor(registry, edge.target),
    ]),
    externalReferenceKeys: registry.externalRefs.map((reference) => reference.key),
    externalReferenceRelatedEntities: registry.externalRefs.map(
      (reference) => reference.relatedEntity,
    ),
  };
}

function labelFor(
  registry: {
    readonly entitiesById: ReadonlyMap<string, { readonly label: string }>;
  },
  entityId: string,
): string {
  const entity = registry.entitiesById.get(entityId);

  if (entity === undefined) {
    throw new Error(`graph edge references unknown entity ${entityId}`);
  }

  return entity.label;
}
