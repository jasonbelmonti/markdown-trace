import {
  classificationResolution,
  classifyOccurrences,
  definitionLabelIndex,
  rowDefinitionCandidateIndex,
} from "./role-classification/classify-occurrences.mjs";
import { coverageRowFacts, rawCandidateEdges } from "./role-classification/coverage-evidence.mjs";
import { POLICY_VERSION } from "./role-classification/policy.mjs";
import { rawRangeReferences } from "./role-classification/range-evidence.mjs";
import {
  rawDiagnosticHints,
  repeatedIdPolicyFacts,
  roleSummary,
} from "./role-classification/repeated-id-diagnostics.mjs";

export function buildRoleClassifiedRawFacts({ rawIdOccurrences, tables, traceLinks }) {
  const tableByIndex = new Map(tables.map((table, index) => [index, table]));
  const rowDefinitionCandidates = rowDefinitionCandidateIndex(rawIdOccurrences, tables);
  const classified = classifyOccurrences({
    rawIdOccurrences,
    rowDefinitionCandidates,
    tableByIndex,
    traceLinks,
  });
  const definitionsByLabel = definitionLabelIndex(classified, traceLinks);
  const resolvedClassifications = classified.map((classification) => ({
    ...classification,
    resolution: classificationResolution(classification, definitionsByLabel),
  }));
  const coverageRows = coverageRowFacts({ classifications: resolvedClassifications, tableByIndex });
  const rangeReferences = rawRangeReferences({ rawIdOccurrences, tables, definitionsByLabel, rowDefinitionCandidates });
  const candidateEdges = rawCandidateEdges({ coverageRows, rangeReferences });
  const repeatedIds = repeatedIdPolicyFacts(resolvedClassifications);
  const diagnosticHints = rawDiagnosticHints({ resolvedClassifications, repeatedIds, rangeReferences });

  return {
    policyVersion: POLICY_VERSION,
    summary: roleSummary({
      classifications: resolvedClassifications,
      coverageRows,
      rangeReferences,
      repeatedIds,
      diagnosticHints,
    }),
    classifications: resolvedClassifications,
    primaryDefinitions: resolvedClassifications.filter((classification) => classification.role === "primary_definition"),
    supplementalDefinitions: resolvedClassifications.filter(
      (classification) => classification.role === "supplemental_definition",
    ),
    coverageRows,
    mentions: resolvedClassifications.filter((classification) =>
      ["mention", "section_reference", "table_reference", "contextual_evidence_candidate"].includes(
        classification.role,
      ),
    ),
    rangeReferences,
    candidateEdges,
    repeatedIds,
    diagnosticHints,
  };
}
