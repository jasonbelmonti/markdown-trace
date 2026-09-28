import type { GraphSnapshot, SourceFragment } from "../contracts/analysis.js";
import type { SourceRange } from "../contracts/source.js";

export type SupportRole = "owned-content" | "heading" | "table-header";
export interface SupportClaim { readonly range: SourceRange; readonly role: SupportRole }
export type EntitySupport =
  | { readonly status: "missing" }
  | { readonly status: "ambiguous"; readonly fragment: SourceFragment }
  | { readonly status: "ready"; readonly claims: readonly SupportClaim[] };

/** Resolve owned fragments and recursive structural support without admission policy. */
export function entitySupport(snapshot: GraphSnapshot, identifier: string): EntitySupport {
  const record = snapshot.identifiers.find(item => item.identifier === identifier);
  if (!record || !record.entityKind || record.definition.status !== "resolved")
    return { status: "missing" };
  const declarationId = record.definition.occurrenceId;
  const definition = snapshot.occurrences.find(item => item.id === declarationId);
  const byId = new Map(snapshot.fragments.map(fragment => [fragment.id, fragment]));
  const definitionFragment = definition && byId.get(definition.fragmentId);
  if (!definitionFragment) return { status: "missing" };
  if (definitionFragment.owner.status === "ambiguous")
    return { status: "ambiguous", fragment: definitionFragment };
  const owned = snapshot.fragments.filter(fragment =>
    fragment.owner.status === "owned" && fragment.owner.declarationId === declarationId);
  const ownedIds = new Set(owned.map(fragment => fragment.id));
  const claims: SupportClaim[] = owned.map(fragment => ({ range: fragment.range, role: "owned-content" }));
  const visited = new Set<string>();
  function addSupport(fragment: SourceFragment): void {
    for (const id of fragment.requiredContext) {
      if (visited.has(id)) continue;
      visited.add(id);
      const dependency = byId.get(id);
      if (!dependency) throw new Error(`Missing required context fragment ${id}`);
      if (!ownedIds.has(id)) claims.push({
        range: dependency.range,
        role: dependency.structure === "heading" ? "heading" : "table-header",
      });
      addSupport(dependency);
    }
  }
  for (const fragment of owned) addSupport(fragment);
  return { status: "ready", claims };
}
