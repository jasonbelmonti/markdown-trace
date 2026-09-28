import type { GraphSnapshot } from "../contracts/analysis.js";
import type { ContextOmission } from "../contracts/context.js";
import type { Identifier } from "../contracts/source.js";
import type { ContextClaim } from "./intervals.js";
import { entitySupport } from "./support.js";

export type EntityBundle =
  | { readonly status: "ready"; readonly claims: readonly ContextClaim[] }
  | { readonly status: "ambiguous"; readonly omission: ContextOmission };

/** Resolve one selected declaration to its owned fragments and structural support. */
export function buildEntityBundle(snapshot: GraphSnapshot, identifier: Identifier): EntityBundle {
  const support = entitySupport(snapshot, identifier);
  if (support.status === "missing")
    throw new Error(`Selection has no resolved definition for ${identifier}`);
  if (support.status === "ambiguous") {
    const fragment = support.fragment;
    if (fragment.owner.status !== "ambiguous") throw new Error("Invalid ambiguous fragment");
    return { status: "ambiguous", omission: {
      identifier, reason: "ambiguous-ownership", fragmentId: fragment.id,
      sourceRange: fragment.range, declarationIds: fragment.owner.declarationIds,
    } };
  }
  return { status: "ready", claims: support.claims.map(claim => ({ ...claim, identifier })) };
}
