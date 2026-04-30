import type { RegistryEntity } from "../registry/index.js";
import { toReferenceKey, type ReferenceKey } from "./referenceIndex.js";
import type { ValidationFinding } from "./types.js";

export function findMissingLabelReferences(
  entity: RegistryEntity,
  referenceKeys: ReadonlySet<ReferenceKey>,
): readonly ValidationFinding[] {
  return entity.expectedReferences.labels
    .filter((label) => !referenceKeys.has(toReferenceKey(entity.id, label)))
    .map((label) => ({
      category: "missing-reference",
      entityId: entity.id,
      label,
      message: `${entity.id} (${entity.label}) is expected to reference ${label}`,
    }));
}
