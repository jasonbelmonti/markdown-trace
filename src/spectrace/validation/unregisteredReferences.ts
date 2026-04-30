import type { MarkdownReferenceFact } from "../markdown/index.js";
import type { ValidationFinding } from "./types.js";

export function findUnregisteredReferences(
  references: readonly MarkdownReferenceFact[],
): readonly ValidationFinding[] {
  return references
    .filter((reference) => reference.targetEntityId === undefined)
    .map((reference) => ({
      category: "missing-reference",
      entityId: reference.sourceEntityId,
      label: reference.label,
      line: reference.line,
      message: `${reference.sourceEntityId} references unregistered label ${reference.label}`,
    }));
}
