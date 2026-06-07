export function formatSmokeJson(run) {
  return `${JSON.stringify(run, null, 2)}\n`;
}

export function formatSmokeMarkdown(run) {
  return [
    "# BEL-1295 EVD-5 Negative Diagnostic Smoke",
    "",
    `Command: \`${run.command}\``,
    "",
    `Overall result: \`${run.summary.status}\` (${run.summary.passed}/${run.summary.total} probes passed)`,
    "",
    "| Probe | Fixture | Expected diagnostic | Actual diagnostic | Source evidence |",
    "| --- | --- | --- | --- | --- |",
    ...run.results.map(
      (result) =>
        `| ${result.title} | \`${result.fixturePath}\` | \`${result.expectedDiagnosticCode}\` | \`${result.actualDiagnosticCode}\` / \`${result.status}\` | ${sourceEvidenceSummary(result)} |`,
    ),
    "",
    "## Probe Evidence",
    "",
    ...run.results.flatMap((result) => formatProbeEvidence(result)),
  ].join("\n");
}

function formatProbeEvidence(result) {
  return [
    `### ${result.title}`,
    "",
    `Semantic proof: ${result.semanticProof}`,
    "",
    `Extractor source hash: \`${result.sourceSha256}\``,
    "",
    "| Evidence kind | Occurrence or row | Diagnostic basis | Source range |",
    "| --- | --- | --- | --- |",
    ...result.sourceEvidence.map(
      (evidence) =>
        `| \`${evidence.kind}\` | ${evidenceIdentifier(evidence)} | ${diagnosticBasis(evidence)} | ${sourceRangeSummary(evidence)} |`,
    ),
    "",
  ];
}

function sourceEvidenceSummary(result) {
  if (result.sourceEvidence.length === 0) {
    return "No matching source-backed evidence found.";
  }

  return result.sourceEvidence
    .slice(0, 3)
    .map((evidence) => `${evidenceIdentifier(evidence)} ${sourceRangeSummary(evidence)}`.trim())
    .join("<br>");
}

function evidenceIdentifier(evidence) {
  if (evidence.occurrenceId !== undefined) {
    return `\`${evidence.occurrenceId}\``;
  }

  if (evidence.coverageRowId !== undefined) {
    return `\`${evidence.coverageRowId}\``;
  }

  if (evidence.occurrenceIds !== undefined) {
    return evidence.occurrenceIds.map((id) => `\`${id}\``).join(", ");
  }

  return "`n/a`";
}

function diagnosticBasis(evidence) {
  if (evidence.canonicalId !== undefined) {
    return `\`${evidence.canonicalId}\``;
  }

  if (evidence.range !== undefined) {
    return `\`${evidence.range}\`, missing \`${evidence.missingEndpoint}\``;
  }

  if (evidence.missingTargetFamily !== undefined) {
    return `source \`${evidence.sourceLabels.join(", ")}\`, targets \`${evidence.targetLabels.join(", ")}\`, missing \`${evidence.missingTargetFamily}\``;
  }

  if (evidence.label !== undefined) {
    return `\`${evidence.label}\``;
  }

  return "`n/a`";
}

function sourceRangeSummary(evidence) {
  if (evidence.sourceRange !== undefined) {
    return formatRange(evidence.sourceRange);
  }

  if (evidence.sourceRanges !== undefined) {
    return evidence.sourceRanges
      .slice(0, 4)
      .map((entry) => `${entry.label} ${formatRange(entry.sourceRange)}`)
      .join("<br>");
  }

  return "n/a";
}

function formatRange(range) {
  const start = range?.start;
  const end = range?.end;

  if (start === undefined || end === undefined) {
    return "n/a";
  }

  return `line ${start.line}:${start.column} to ${end.line}:${end.column}`;
}
