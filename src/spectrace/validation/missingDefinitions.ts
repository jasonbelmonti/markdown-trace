import type { EntityRegistry } from "../registry/index.js";
import type { MarkdownScanFacts } from "../markdown/index.js";
import type { ValidationFinding } from "./types.js";

export function findMissingDefinitions(
  registry: EntityRegistry,
  scanFacts: MarkdownScanFacts,
): readonly ValidationFinding[] {
  const definedEntityIds = new Set(
    scanFacts.definitions.map((definition) => definition.entityId),
  );

  return registry.entities
    .filter((entity) => !definedEntityIds.has(entity.id))
    .map((entity) => ({
      category: "missing-registered-definition",
      entityId: entity.id,
      label: entity.label,
      message: `${entity.id} (${entity.label}) is registered but its definition was not found`,
    }));
}
