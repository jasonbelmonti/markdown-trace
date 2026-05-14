import {
  documentQueries,
  type EngineDocument,
  type EngineSourceSlice,
} from "@jasonbelmonti/markdown-engine";

import type { MarkdownDefinitionFact } from "./model.js";

export type SectionBodySourceSlice = EngineSourceSlice & { readonly targetId: string };

export function sectionBodySourceSlices(
  document: EngineDocument,
  definition: MarkdownDefinitionFact,
): ReadonlyArray<SectionBodySourceSlice> {
  if (definition.sectionTargetId === undefined) {
    return [];
  }

  const sectionResolution = documentQueries.resolveTarget(document, {
    kind: "node",
    id: definition.sectionTargetId,
  });

  if (sectionResolution?.category !== "section") {
    return [];
  }

  return sectionResolution.section.bodyTargets.flatMap((target) => {
    const sourceSlice = documentQueries.sourceSlice(document, target);

    if (sourceSlice === undefined) {
      return [];
    }

    return [{ ...sourceSlice, targetId: target.id }];
  });
}
