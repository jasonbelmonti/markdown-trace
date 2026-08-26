import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  documentQueries,
  normalize,
  parse,
  type EngineTable,
  type EngineTableCell,
  type SourceRange,
} from "@jasonbelmonti/markdown-engine";

import { graphProfileHash, type GraphProfile, type GraphTableRole } from "../graph-profile/index.js";
import type {
  TraceEvidenceAnchor,
  TraceEvidenceCandidateEdge,
  TraceEvidenceCoverageRow,
  TraceEvidenceDiagnostic,
  TraceEvidenceOccurrence,
  TraceEvidenceResult,
} from "./model.js";

const ID_TOKEN_PATTERN = /\b[A-Z][A-Z0-9]*-\d+(?:-[A-Z0-9]+)*\b/g;

interface ExtractTraceEvidenceOptions {
  readonly sourcePath?: string;
}

interface PendingDefinition {
  readonly label: string;
  readonly family: string;
  readonly sourceRange?: SourceRange;
}

interface PendingEdge {
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly relationshipClass: TraceEvidenceCandidateEdge["relationshipClass"];
  readonly anchor: TraceEvidenceAnchor;
  readonly sourceRange?: SourceRange;
}

export async function extractTraceEvidenceFromFile(
  sourcePath: string,
  profile: GraphProfile,
): Promise<TraceEvidenceResult> {
  const markdown = await readFile(sourcePath, "utf8");

  return extractTraceEvidence(markdown, profile, { sourcePath });
}

export function extractTraceEvidence(
  markdown: string,
  profile: GraphProfile,
  options: ExtractTraceEvidenceOptions = {},
): TraceEvidenceResult {
  const sourcePath = options.sourcePath ?? "document.md";
  const parsed = parse(markdown, { path: sourcePath });
  const normalized = normalize(parsed.parsed);
  const definitions: PendingDefinition[] = [];
  const edges: PendingEdge[] = [];

  for (const table of documentQueries.tables(normalized.document)) {
    extractTableEvidence(table, profile, definitions, edges);
  }

  const sortedDefinitions = [...definitions].sort(compareDefinition);
  const definitionFacts: TraceEvidenceOccurrence[] = sortedDefinitions.map(
    (definition, index) => ({
      occurrenceId: numberedId("definition", index + 1),
      label: definition.label,
      family: definition.family,
      role: "primary_definition",
      sourceKind: "table_cell",
      sourceRange: definition.sourceRange,
    }),
  );
  const candidateEdges: TraceEvidenceCandidateEdge[] = [...edges]
    .sort(compareEdge)
    .map((edge, index) => ({
      edgeId: numberedId("candidate-edge", index + 1),
      fromLabel: edge.fromLabel,
      toLabel: edge.toLabel,
      relationshipClass: edge.relationshipClass,
      rawEvidenceAnchor: edge.anchor,
    }));
  const coverageRows = toCoverageRows(candidateEdges, definitionFacts);
  const terminalMentions = terminalOccurrences(candidateEdges, profile);
  const sourceSha256 = sha256(markdown);
  const profileSha256 = graphProfileHash(profile);

  return {
    schemaVersion: "markdown-trace.trace-evidence.v1",
    authority: "trace-evidence",
    source: {
      path: sourcePath,
      sha256: sourceSha256,
      lineCount: lineCount(markdown),
    },
    profile: {
      profileId: profile.profileId,
      artifactFamily: profile.artifactFamily,
      profileVersion: profile.profileVersion,
      sha256: profileSha256,
    },
    run: {
      packageVersion: "0.1.0",
      markdownEngineVersion: "2.0.0",
      runtimeVersion: process.version,
    },
    definitions: definitionFacts,
    supplementalDefinitions: [],
    coverageRows,
    mentions: terminalMentions,
    ranges: [],
    candidateEdges,
    diagnostics: [
      ...engineDiagnostics("parse", parsed.diagnostics),
      ...engineDiagnostics("normalize", normalized.diagnostics),
    ],
    hashes: {
      sourceSha256,
      profileSha256,
    },
  };
}

function extractTableEvidence(
  table: EngineTable,
  profile: GraphProfile,
  definitions: PendingDefinition[],
  edges: PendingEdge[],
): void {
  const headers = tableHeaders(table);
  const roles = matchingTableRoles(profile, headers);
  const rows = [...new Set(table.cells.filter((cell) => !cell.header).map((cell) => cell.rowIndex))]
    .sort((left, right) => left - right);

  for (const rowIndex of rows) {
    const cells = table.cells.filter((cell) => !cell.header && cell.rowIndex === rowIndex);
    const definition = sourceDefinition(cells, headers, profile);

    if (definition !== undefined) {
      definitions.push(definition);
    }

    for (const role of roles) {
      extractRoleEdges(table, rowIndex, cells, headers, profile, role, edges);
    }
  }
}

function sourceDefinition(
  cells: readonly EngineTableCell[],
  headers: ReadonlyMap<number, string>,
  profile: GraphProfile,
): PendingDefinition | undefined {
  const primaryHeaders = new Set(profile.definitionPolicies.primaryColumns.map(normalizeHeader));

  for (const cell of cells) {
    if (!primaryHeaders.has(normalizeHeader(headers.get(cell.columnIndex) ?? ""))) {
      continue;
    }

    const label = idTokens(cell.text)[0];
    const family = label === undefined ? undefined : familyOf(label);
    const policy = profile.idFamilies.find((candidate) => candidate.family === family)?.policy;

    if (label !== undefined && family !== undefined && policy === "primary_definition") {
      return { label, family, sourceRange: cell.sourceRange };
    }
  }

  return undefined;
}

function extractRoleEdges(
  table: EngineTable,
  rowIndex: number,
  cells: readonly EngineTableCell[],
  headers: ReadonlyMap<number, string>,
  profile: GraphProfile,
  role: GraphTableRole,
  edges: PendingEdge[],
): void {
  const relationship = profile.relationshipClasses.find(
    (candidate) => candidate.class === role.relationshipClass,
  );

  if (relationship === undefined) {
    return;
  }

  const sourceCells = cellsForColumns(cells, headers, role.sourceColumns);
  const targetCells = cellsForColumns(cells, headers, role.targetColumns);

  for (const sourceCell of sourceCells) {
    for (const sourceLabel of idTokens(sourceCell.text)) {
      const sourceFamily = familyOf(sourceLabel);

      if (
        !role.sourceFamilies.includes(sourceFamily) ||
        !relationship.sourceFamilies.includes(sourceFamily)
      ) {
        continue;
      }

      for (const targetCell of targetCells) {
        const targetHeader = headers.get(targetCell.columnIndex) ?? "";
        for (const targetLabel of idTokens(targetCell.text)) {
          const targetFamily = familyOf(targetLabel);

          if (!relationship.targetFamilies.includes(targetFamily)) {
            continue;
          }

          edges.push({
            fromLabel: sourceLabel,
            toLabel: targetLabel,
            relationshipClass: role.relationshipClass,
            anchor: {
              tableTargetId: table.target.id,
              rowIndex,
              columnIndex: targetCell.columnIndex,
              columnHeader: targetHeader,
              sourceRange: targetCell.sourceRange,
            },
            sourceRange: sourceCell.sourceRange,
          });
        }
      }
    }
  }
}

function matchingTableRoles(
  profile: GraphProfile,
  headers: ReadonlyMap<number, string>,
): readonly GraphTableRole[] {
  const normalizedHeaders = new Set([...headers.values()].map(normalizeHeader));

  return profile.tableRoles.filter(
    (role) =>
      role.relationshipDirection === "source-to-target" &&
      role.match.requiredColumns.every((column) => normalizedHeaders.has(normalizeHeader(column))),
  );
}

function cellsForColumns(
  cells: readonly EngineTableCell[],
  headers: ReadonlyMap<number, string>,
  columns: readonly string[],
): readonly EngineTableCell[] {
  const normalizedColumns = new Set(columns.map(normalizeHeader));

  return cells.filter((cell) =>
    normalizedColumns.has(normalizeHeader(headers.get(cell.columnIndex) ?? "")),
  );
}

function tableHeaders(table: EngineTable): ReadonlyMap<number, string> {
  return new Map(
    table.cells
      .filter((cell) => cell.header)
      .map((cell) => [cell.columnIndex, cell.text] as const),
  );
}

function toCoverageRows(
  edges: readonly TraceEvidenceCandidateEdge[],
  definitions: readonly TraceEvidenceOccurrence[],
): readonly TraceEvidenceCoverageRow[] {
  const definitionByLabel = new Map(definitions.map((definition) => [definition.label, definition]));

  return edges.map((edge, index) => ({
    coverageRowId: numberedId("coverage-row", index + 1),
    sourceLabel: edge.fromLabel,
    targetLabels: [edge.toLabel],
    relationshipClasses: [edge.relationshipClass],
    sourceRange: definitionByLabel.get(edge.fromLabel)?.sourceRange,
    targetSourceRanges:
      edge.rawEvidenceAnchor.sourceRange === undefined ? [] : [edge.rawEvidenceAnchor.sourceRange],
  }));
}

function terminalOccurrences(
  edges: readonly TraceEvidenceCandidateEdge[],
  profile: GraphProfile,
): readonly TraceEvidenceOccurrence[] {
  const terminalFamilies = new Set(
    profile.idFamilies
      .filter((candidate) => candidate.policy === "terminal_coverage_node")
      .map((candidate) => candidate.family),
  );
  const byLabel = new Map<string, TraceEvidenceCandidateEdge>();

  for (const edge of edges) {
    if (terminalFamilies.has(familyOf(edge.toLabel)) && !byLabel.has(edge.toLabel)) {
      byLabel.set(edge.toLabel, edge);
    }
  }

  return [...byLabel.values()].sort(compareEdge).map((edge, index) => ({
    occurrenceId: numberedId("terminal", index + 1),
    label: edge.toLabel,
    family: familyOf(edge.toLabel),
    role: "terminal_coverage_node",
    sourceKind: "table_cell",
    sourceRange: edge.rawEvidenceAnchor.sourceRange,
  }));
}

function engineDiagnostics(
  stage: TraceEvidenceDiagnostic["stage"],
  diagnostics: readonly {
    readonly code: string;
    readonly message: string;
    readonly severity: string;
    readonly sourceRange?: SourceRange;
  }[],
): readonly TraceEvidenceDiagnostic[] {
  return diagnostics.map((diagnostic) => ({ stage, ...diagnostic }));
}

function idTokens(text: string): readonly string[] {
  return [...text.matchAll(ID_TOKEN_PATTERN)].map((match) => match[0]);
}

function familyOf(label: string): string {
  return label.split("-", 1)[0] ?? label;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function compareDefinition(left: PendingDefinition, right: PendingDefinition): number {
  return rangeOffset(left.sourceRange) - rangeOffset(right.sourceRange) || left.label.localeCompare(right.label);
}

function compareEdge(left: PendingEdge | TraceEvidenceCandidateEdge, right: PendingEdge | TraceEvidenceCandidateEdge): number {
  const leftAnchor = "anchor" in left ? left.anchor : left.rawEvidenceAnchor;
  const rightAnchor = "anchor" in right ? right.anchor : right.rawEvidenceAnchor;

  return (
    rangeOffset(leftAnchor.sourceRange) - rangeOffset(rightAnchor.sourceRange) ||
    left.fromLabel.localeCompare(right.fromLabel) ||
    left.relationshipClass.localeCompare(right.relationshipClass) ||
    left.toLabel.localeCompare(right.toLabel)
  );
}

function rangeOffset(range: SourceRange | undefined): number {
  return range?.start.offset ?? Number.MAX_SAFE_INTEGER;
}

function numberedId(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, "0")}`;
}

function lineCount(markdown: string): number {
  return markdown.length === 0 ? 0 : markdown.split(/\r\n|\r|\n/).length;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
