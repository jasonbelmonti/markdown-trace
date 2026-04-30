import type { EntityRegistry } from "../registry/index.js";
import type { ValidationFinding } from "./types.js";

export function findMissingEdgeTargets(
  registry: EntityRegistry,
): readonly ValidationFinding[] {
  const findings = new Array<ValidationFinding>();

  for (const edge of registry.edges) {
    if (!registry.entitiesById.has(edge.source)) {
      findings.push({
        category: "missing-edge-target",
        entityId: edge.source,
        relationship: edge.relationship,
        targetId: edge.target,
        message: `${edge.relationship} edge source ${edge.source} is not registered`,
      });
    }

    if (!registry.entitiesById.has(edge.target)) {
      findings.push({
        category: "missing-edge-target",
        entityId: edge.source,
        relationship: edge.relationship,
        targetId: edge.target,
        message: `${edge.relationship} edge target ${edge.target} is not registered`,
      });
    }
  }

  return findings;
}
