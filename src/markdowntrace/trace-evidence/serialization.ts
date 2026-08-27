import { createHash } from "node:crypto";

import type { SourceRange } from "@jasonbelmonti/markdown-engine";

import type {
  TraceEvidenceAnchor,
  TraceEvidenceCandidateEdge,
  TraceEvidenceCoverageRow,
  TraceEvidenceDiagnostic,
  TraceEvidenceOccurrence,
  TraceEvidenceResult,
} from "./model.js";

export function serializeTraceEvidence(evidence: TraceEvidenceResult): string {
  return JSON.stringify(stableTraceEvidence(evidence));
}

export function traceEvidenceHash(evidence: TraceEvidenceResult): string {
  return createHash("sha256").update(serializeTraceEvidence(evidence)).digest("hex");
}

function stableTraceEvidence(evidence: TraceEvidenceResult): unknown {
  return {
    schemaVersion: evidence.schemaVersion,
    authority: evidence.authority,
    source: {
      sha256: evidence.source.sha256,
      lineCount: evidence.source.lineCount,
    },
    profile: {
      profileId: evidence.profile.profileId,
      artifactFamily: evidence.profile.artifactFamily,
      profileVersion: evidence.profile.profileVersion,
      sha256: evidence.profile.sha256,
    },
    definitions: evidence.definitions.map(stableOccurrence),
    supplementalDefinitions: evidence.supplementalDefinitions.map(stableOccurrence),
    coverageRows: evidence.coverageRows.map(stableCoverageRow),
    mentions: evidence.mentions.map(stableOccurrence),
    ranges: evidence.ranges,
    candidateEdges: evidence.candidateEdges.map(stableCandidateEdge),
    diagnostics: evidence.diagnostics.map(stableDiagnostic),
  };
}

function stableOccurrence(occurrence: TraceEvidenceOccurrence): unknown {
  return {
    occurrenceId: occurrence.occurrenceId,
    label: occurrence.label,
    family: occurrence.family,
    role: occurrence.role,
    sourceKind: occurrence.sourceKind,
    ...optionalSourceRange(occurrence.sourceRange),
  };
}

function stableCoverageRow(row: TraceEvidenceCoverageRow): unknown {
  return {
    coverageRowId: row.coverageRowId,
    sourceLabel: row.sourceLabel,
    targetLabels: row.targetLabels,
    relationshipClasses: row.relationshipClasses,
    ...optionalSourceRange(row.sourceRange),
    targetSourceRanges: row.targetSourceRanges.map(stableSourceRange),
  };
}

function stableCandidateEdge(edge: TraceEvidenceCandidateEdge): unknown {
  return {
    edgeId: edge.edgeId,
    fromLabel: edge.fromLabel,
    toLabel: edge.toLabel,
    relationshipClass: edge.relationshipClass,
    rawEvidenceAnchor: stableAnchor(edge.rawEvidenceAnchor),
  };
}

function stableAnchor(anchor: TraceEvidenceAnchor): unknown {
  return {
    tableTargetId: anchor.tableTargetId,
    rowIndex: anchor.rowIndex,
    columnIndex: anchor.columnIndex,
    columnHeader: anchor.columnHeader,
    ...optionalSourceRange(anchor.sourceRange),
  };
}

function stableDiagnostic(diagnostic: TraceEvidenceDiagnostic): unknown {
  return {
    stage: diagnostic.stage,
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    ...optionalSourceRange(diagnostic.sourceRange),
  };
}

function optionalSourceRange(
  sourceRange: SourceRange | undefined,
): { readonly sourceRange?: unknown } {
  return sourceRange === undefined
    ? {}
    : { sourceRange: stableSourceRange(sourceRange) };
}

function stableSourceRange(sourceRange: SourceRange): unknown {
  return {
    start: stableSourcePosition(sourceRange.start),
    end: stableSourcePosition(sourceRange.end),
  };
}

function stableSourcePosition(position: SourceRange["start"]): unknown {
  return {
    line: position.line,
    column: position.column,
    ...(position.offset === undefined ? {} : { offset: position.offset }),
  };
}
