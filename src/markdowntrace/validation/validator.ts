import type { MarkdownAdapterFacts } from "../markdown/index.js";
import type { EntityRegistry } from "../registry/index.js";
import { collectFindings } from "./findings.js";
import type { ValidationResult } from "./model.js";
import { summarizeValidation } from "./summary.js";

export function validate(
  registry: EntityRegistry,
  adapterFacts: MarkdownAdapterFacts,
): ValidationResult {
  const findings = collectFindings(registry, adapterFacts);

  return {
    valid: findings.length === 0,
    metadata: adapterFacts.metadata,
    findings,
    summary: summarizeValidation(registry, adapterFacts, findings.length),
  };
}
