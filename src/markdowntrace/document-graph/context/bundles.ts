import type { GraphSnapshot, SourceFragment } from "../contracts/analysis.js";
import type { ContextOmission } from "../contracts/context.js";
import type { Identifier } from "../contracts/source.js";
import type { ContextClaim, ContextRole } from "./intervals.js";

export type EntityBundle =
  | { readonly status: "ready"; readonly claims: readonly ContextClaim[] }
  | { readonly status: "ambiguous"; readonly omission: ContextOmission };

/** Resolve one selected declaration to its owned fragments and structural support. */
export function buildEntityBundle(
  snapshot: GraphSnapshot,
  identifier: Identifier,
): EntityBundle {
  const record = snapshot.identifiers.find((item) => item.identifier === identifier);
  if (!record || record.definition.status !== "resolved")
    throw new Error(`Selection has no resolved definition for ${identifier}`);
  const declarationId = record.definition.occurrenceId;
  const definition = snapshot.occurrences.find((item) => item.id === declarationId);
  const byId = new Map(snapshot.fragments.map((fragment) => [fragment.id, fragment]));
  const definitionFragment = definition && byId.get(definition.fragmentId);
  if (!definitionFragment)
    throw new Error(`Selection has no definition fragment for ${identifier}`);
  if (definitionFragment.owner.status === "ambiguous") {
    return {
      status: "ambiguous",
      omission: {
        identifier,
        reason: "ambiguous-ownership",
        fragmentId: definitionFragment.id,
        sourceRange: definitionFragment.range,
        declarationIds: definitionFragment.owner.declarationIds,
      },
    };
  }

  const owned = snapshot.fragments.filter(
    (fragment) =>
      fragment.owner.status === "owned" &&
      fragment.owner.declarationId === declarationId,
  );
  const ownedIds = new Set(owned.map((fragment) => fragment.id));
  const claims: ContextClaim[] = owned.map((fragment) => ({
    range: fragment.range,
    identifier,
    role: "owned-content",
  }));
  const visited = new Set<string>();
  function addSupport(fragment: SourceFragment): void {
    for (const dependencyId of fragment.requiredContext) {
      if (visited.has(dependencyId)) continue;
      visited.add(dependencyId);
      const dependency = byId.get(dependencyId);
      if (!dependency)
        throw new Error(`Missing required context fragment ${dependencyId}`);
      if (!ownedIds.has(dependencyId)) {
        const role: ContextRole = dependency.structure === "heading" ? "heading" : "table-header";
        claims.push({ range: dependency.range, identifier, role });
      }
      addSupport(dependency);
    }
  }
  for (const fragment of owned) addSupport(fragment);
  return { status: "ready", claims };
}
