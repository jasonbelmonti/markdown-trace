/** Type-checked design example, not runnable: contracts/index has declarations only. */
import {
  analyzeDocument, compileProfile, extractContext, findIncoming,
  findOutgoing, lookupIdentifier, traverseGraph, validateGraph,
} from "../contracts/index.js";
import { profileInput } from "./profile.js";
export function inspectSpec(markdown: string) {
  const profile = compileProfile(profileInput);
  if (!profile.ok) return profile;
  const analyzed = analyzeDocument(
    { documentId: "spec.md", text: markdown },
    profile.value,
    { maxSourceUtf8Bytes: 1_000_000, maxOccurrences: 50_000 },
  );
  if (!analyzed.ok) return analyzed;
  const analysis = analyzed.value;
  const validation = validateGraph(analysis, profile.value);
  // An invalid spec remains queryable; validation does not gate evidence access.
  const definition = lookupIdentifier(analysis, "REQ-1");
  const backlinks = findIncoming(analysis, "REQ-1", { limit: 100 });
  const dependencies = findOutgoing(analysis, "WP-1");
  const selected = traverseGraph(analysis, {
    roots: ["WP-1"], direction: "outgoing",
    relations: ["implements", "references"], maxDepth: 1, maxNodes: 20,
  });
  if (!selected.ok) return selected;
  const context = extractContext(analysis, {
    selection: selected.value,
    budget: { maxUtf8Bytes: 12_000, maxFragments: 40 },
  });
  const referenceLocations = backlinks.ok
    ? backlinks.value.items.map(({ occurrence }) => occurrence.range)
    : [];
  const inclusionPaths = context.ok ? context.value.selection.nodes : [];
  const ownershipOmissions = context.ok
    ? context.value.omittedIdentifiers.flatMap(omission => omission.reason === "ambiguous-ownership"
      ? [{ identifier: omission.identifier, range: omission.sourceRange, declarations: omission.declarationIds }]
      : [])
    : [];
  return { validation, definition, backlinks, dependencies, context, referenceLocations, inclusionPaths, ownershipOmissions };
}
