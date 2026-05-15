import {
  deriveRegistryResultFromMarkdown,
  type DerivedRegistryOptions,
  type DerivedRegistryDiagnostic,
  type EntityRegistry,
} from "../registry/index.js";
import type { TraceGraph } from "./model.js";

export interface DerivedRegistryGraph {
  readonly registry: EntityRegistry;
  readonly graph: TraceGraph;
  readonly diagnostics: readonly DerivedRegistryDiagnostic[];
}

export function deriveGraphFromRegistry(registry: EntityRegistry): TraceGraph {
  return {
    nodes: registry.entities.map((entity) => ({
      id: entity.id,
      label: entity.label,
      type: entity.type,
    })),
    edges: registry.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}

export async function deriveGraphFromMarkdown(
  documentPath: string,
  options: DerivedRegistryOptions = {},
): Promise<DerivedRegistryGraph> {
  const { registry, diagnostics } = await deriveRegistryResultFromMarkdown(documentPath, options);

  return {
    registry,
    graph: deriveGraphFromRegistry(registry),
    diagnostics,
  };
}
