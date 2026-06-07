const NEGATIVE_PROBE_ROOT = "experiments/profile-aware-graph-validation-r0/fixtures/negative-probes";

export const smokeProbes = [
  {
    id: "dangling-reference",
    title: "Dangling reference",
    fixturePath: `${NEGATIVE_PROBE_ROOT}/dangling-reference.md`,
    evaluator: "unresolved-reference",
    expectedDiagnosticCode: "r0.graph_validation.unresolved_reference",
    targetLabel: "VAL-99",
    targetCanonicalId: "exec.val.99",
    proofNote:
      "The diagnostic is valid only when the missing VAL-99 reference is found in parsed trace evidence and no primary definition resolves it.",
  },
  {
    id: "duplicate-primary-definition",
    title: "Duplicate primary definition",
    fixturePath: `${NEGATIVE_PROBE_ROOT}/duplicate-primary-definition.md`,
    evaluator: "duplicate-primary",
    expectedDiagnosticCode: "r0.graph_validation.duplicate_primary_definition",
    targetLabel: "WP-1",
    targetCanonicalId: "exec.wp.1",
    proofNote:
      "The diagnostic is valid only when duplicate heading-owned primary definitions are found and the matrix reference is not the duplicate cause.",
  },
  {
    id: "invalid-range-endpoint",
    title: "Invalid range endpoint",
    fixturePath: `${NEGATIVE_PROBE_ROOT}/invalid-range-endpoint.md`,
    evaluator: "invalid-range-endpoint",
    expectedDiagnosticCode: "r0.graph_validation.invalid_range_endpoint",
    rangeStart: "VAL-1",
    rangeEnd: "VAL-4",
    proofNote:
      "The diagnostic is valid only when the range start resolves and the range end remains unresolved in source-backed range evidence.",
  },
  {
    id: "missing-matrix-coverage",
    title: "Missing matrix coverage",
    fixturePath: `${NEGATIVE_PROBE_ROOT}/missing-matrix-coverage.md`,
    evaluator: "missing-matrix-coverage",
    expectedDiagnosticCode: "r0.graph_validation.missing_matrix_coverage",
    sourceLabel: "OBJ-1",
    requiredFamily: "VAL",
    availableDefinitionLabel: "VAL-1",
    observedTargets: ["WP-1", "EVD-1"],
    proofNote:
      "The diagnostic is valid only when the matrix row links OBJ-1 to WP-1 and EVD-1 while omitting any validation checkpoint target.",
  },
];
