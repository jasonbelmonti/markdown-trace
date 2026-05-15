import { scanMarkdown } from "../../../src/markdowntrace/markdown/index.js";
import { loadRegistry } from "../../../src/markdowntrace/registry/index.js";
import type { NegativeEvidence } from "./model.js";
import {
  duplicateCanonicalIdOutcome,
  duplicateLabelOutcome,
} from "./registry-load-outcomes.js";
import { derivedBoundedRangeSafetyOutcome } from "./derived-outcomes.js";
import { documentPath, registryPath } from "./paths.js";
import {
  incompleteBoundedRangeOutcome,
  missingEdgeTargetOutcome,
  missingReferenceOutcome,
  missingRegisteredDefinitionOutcome,
} from "./sidecar-outcomes.js";

export async function collectNegativeEvidence(): Promise<NegativeEvidence> {
  const registry = await loadRegistry(registryPath);
  const outcomes = [
    await missingRegisteredDefinitionOutcome(registry),
    await duplicateCanonicalIdOutcome(),
    await duplicateLabelOutcome(),
    await missingReferenceOutcome(registry),
    await missingEdgeTargetOutcome(registry),
    await incompleteBoundedRangeOutcome(registry),
    derivedBoundedRangeSafetyOutcome(),
  ];
  const adapterFacts = await scanMarkdown(documentPath, registry);

  return {
    registry,
    enginePackage: `${adapterFacts.metadata.enginePackage.name}@${adapterFacts.metadata.enginePackage.version}`,
    documentVersion: adapterFacts.metadata.documentVersion,
    outcomes,
  };
}
