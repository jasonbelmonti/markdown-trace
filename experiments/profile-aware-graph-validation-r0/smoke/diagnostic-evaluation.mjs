const SUPPORTING_CODES = {
  duplicatePrimary: "r0.extractor.duplicate_primary_definition_candidate",
  missingMatrixCoverage: "r0.graph.missing_matrix_coverage_candidate",
  unresolvedRangeEndpoint: "r0.extractor.unresolved_range_endpoint_candidate",
  unresolvedRawRangeEndpoint: "r0.extractor.unresolved_raw_range_endpoint_candidate",
  unresolvedReference: "r0.extractor.unresolved_entity_reference_candidate",
};

export function evaluateProbe(probe, traceEvidence) {
  const evaluation = evaluateByType(probe, traceEvidence);
  const status = evaluation.evidence.length > 0 ? "pass" : "fail";

  return {
    id: probe.id,
    title: probe.title,
    fixturePath: probe.fixturePath,
    sourceSha256: traceEvidence.source.sha256,
    expectedDiagnosticCode: probe.expectedDiagnosticCode,
    actualDiagnosticCode: status === "pass" ? probe.expectedDiagnosticCode : "missing",
    status,
    semanticProof: probe.proofNote,
    sourceEvidence: evaluation.evidence,
    supportingSignals: evaluation.supportingSignals,
    extractorSummary: traceEvidence.summary,
  };
}

function evaluateByType(probe, traceEvidence) {
  switch (probe.evaluator) {
    case "unresolved-reference":
      return unresolvedReferenceEvidence(probe, traceEvidence);
    case "duplicate-primary":
      return duplicatePrimaryEvidence(probe, traceEvidence);
    case "invalid-range-endpoint":
      return invalidRangeEndpointEvidence(probe, traceEvidence);
    case "missing-matrix-coverage":
      return missingMatrixCoverageEvidence(probe, traceEvidence);
    default:
      throw new Error(`unknown smoke probe evaluator: ${probe.evaluator}`);
  }
}

function unresolvedReferenceEvidence(probe, traceEvidence) {
  const references = traceEvidence.candidateTraceFacts.entityReferences.filter(
    (reference) =>
      reference.canonicalId === probe.targetCanonicalId &&
      reference.resolution === "unresolved_candidate",
  );
  const hints = diagnosticHints(traceEvidence, SUPPORTING_CODES.unresolvedReference).filter(
    (hint) => hint.canonicalId === probe.targetCanonicalId,
  );

  return {
    evidence: references.map((reference) => ({
      kind: "unresolved_entity_reference",
      label: reference.label,
      canonicalId: reference.canonicalId,
      occurrenceId: reference.occurrenceId,
      resolution: reference.resolution,
      sourceRange: reference.sourceRange,
    })),
    supportingSignals: hints.map((hint) => ({
      code: hint.code,
      occurrenceId: hint.occurrenceId,
      canonicalId: hint.canonicalId,
      sourceRange: hint.sourceRange,
    })),
  };
}

function duplicatePrimaryEvidence(probe, traceEvidence) {
  const definitions = traceEvidence.candidateTraceFacts.primaryDefinitions.filter(
    (definition) => definition.canonicalId === probe.targetCanonicalId,
  );
  const duplicate = definitions.length > 1;
  const hints = diagnosticHints(traceEvidence, SUPPORTING_CODES.duplicatePrimary).filter(
    (hint) => hint.canonicalId === probe.targetCanonicalId,
  );
  const matrixReferences = traceEvidence.candidateTraceFacts.entityReferences.filter(
    (reference) =>
      reference.canonicalId === probe.targetCanonicalId &&
      reference.table !== undefined &&
      reference.role !== "primary_definition",
  );

  return {
    evidence: duplicate && matrixReferences.length > 0
      ? [
          {
            kind: "duplicate_heading_primary_definitions",
            canonicalId: probe.targetCanonicalId,
            label: probe.targetLabel,
            occurrenceIds: definitions.map((definition) => definition.occurrenceId),
            sourceRanges: definitions.map((definition) => ({
              occurrenceId: definition.occurrenceId,
              label: definition.label,
              sourceRange: definition.sourceRange,
            })),
            nonPrimaryMatrixReferenceIds: matrixReferences.map((reference) => reference.occurrenceId),
          },
        ]
      : [],
    supportingSignals: hints.map((hint) => ({
      code: hint.code,
      canonicalId: hint.canonicalId,
      occurrenceIds: hint.occurrenceIds,
    })),
  };
}

function invalidRangeEndpointEvidence(probe, traceEvidence) {
  const rangeReferences = traceEvidence.candidateTraceFacts.rangeReferences.filter(
    (range) =>
      range.start === probe.rangeStart &&
      range.end === probe.rangeEnd &&
      range.resolution.start === "primary_definition_found" &&
      range.resolution.end === "unresolved_candidate",
  );
  const rawRanges = traceEvidence.candidateTraceFacts.roleClassifiedRawFacts.rangeReferences.filter(
    (range) =>
      range.start === probe.rangeStart &&
      range.end === probe.rangeEnd &&
      range.resolution.start === "definition_found" &&
      range.resolution.end === "unresolved_candidate",
  );
  const hints = diagnosticHints(traceEvidence, SUPPORTING_CODES.unresolvedRangeEndpoint)
    .filter((hint) => hint.label === probe.rangeEnd)
    .concat(
      diagnosticHints(traceEvidence, SUPPORTING_CODES.unresolvedRawRangeEndpoint).filter(
        (hint) => hint.label === probe.rangeEnd,
      ),
    );

  return {
    evidence: [...rangeReferences, ...rawRanges].map((range) => ({
      kind: "invalid_range_endpoint",
      occurrenceId: range.occurrenceId,
      range: `${range.start} through ${range.end}`,
      missingEndpoint: range.end,
      resolution: range.resolution,
      sourceRange: range.sourceRange,
    })),
    supportingSignals: hints.map((hint) => ({
      code: hint.code,
      occurrenceId: hint.occurrenceId,
      endpoint: hint.endpoint,
      label: hint.label,
      sourceRange: hint.sourceRange,
    })),
  };
}

function missingMatrixCoverageEvidence(probe, traceEvidence) {
  const classificationsById = new Map(
    traceEvidence.candidateTraceFacts.roleClassifiedRawFacts.classifications.map((classification) => [
      classification.occurrenceId,
      classification,
    ]),
  );
  const requiredDefinitionExists = traceEvidence.candidateTraceFacts.primaryDefinitions.some(
    (definition) => definition.label === probe.availableDefinitionLabel,
  );
  const rows = traceEvidence.candidateTraceFacts.roleClassifiedRawFacts.coverageRows.filter(
    (row) =>
      requiredDefinitionExists &&
      row.rowKind === "matrix_coverage_row" &&
      row.sourceLabels.includes(probe.sourceLabel) &&
      probe.observedTargets.every((target) => row.targetLabels.includes(target)) &&
      !row.targetLabels.some((target) => target.startsWith(`${probe.requiredFamily}-`)),
  );

  return {
    evidence: rows.map((row) => ({
      kind: "missing_matrix_coverage",
      code: SUPPORTING_CODES.missingMatrixCoverage,
      coverageRowId: row.coverageRowId,
      sourceLabels: row.sourceLabels,
      targetLabels: row.targetLabels,
      missingTargetFamily: probe.requiredFamily,
      availableDefinitionLabel: probe.availableDefinitionLabel,
      section: row.section?.title,
      occurrenceIds: [...row.sourceOccurrenceIds, ...row.targetOccurrenceIds],
      sourceRanges: [...row.sourceOccurrenceIds, ...row.targetOccurrenceIds]
        .map((occurrenceId) => classificationsById.get(occurrenceId))
        .filter((classification) => classification !== undefined)
        .map((classification) => ({
          occurrenceId: classification.occurrenceId,
          label: classification.label,
          sourceRange: classification.sourceRange,
        })),
    })),
    supportingSignals: rows.map((row) => ({
      code: SUPPORTING_CODES.missingMatrixCoverage,
      coverageRowId: row.coverageRowId,
      sourceLabels: row.sourceLabels,
      targetLabels: row.targetLabels,
      missingTargetFamily: probe.requiredFamily,
      availableDefinitionLabel: probe.availableDefinitionLabel,
    })),
  };
}

function diagnosticHints(traceEvidence, code) {
  return traceEvidence.candidateTraceFacts.diagnosticHints.filter((hint) => hint.code === code);
}
