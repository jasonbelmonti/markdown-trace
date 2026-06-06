import { groupBy, unique } from "./collections.mjs";
import { columnHeaderForCell } from "./document-context.mjs";
import { buildRoleClassifiedRawFacts } from "./role-classification.mjs";

export function buildCandidateTraceFacts({ rawIdOccurrences, tables, traceLinks }) {
  const primaryDefinitions = primaryDefinitionFacts(traceLinks);
  const primaryByCanonicalId = groupBy(primaryDefinitions, (definition) => definition.canonicalId);
  const primaryBySectionId = new Map(
    primaryDefinitions
      .filter((definition) => definition.section?.targetId !== undefined)
      .map((definition) => [definition.section.targetId, definition]),
  );
  const entityLinks = traceLinks.filter((link) => link.kind === "entity");
  const rangeLinks = traceLinks.filter((link) => link.kind === "range");
  const nonAuthoritativeEntityCandidates = nonAuthoritativeCandidateFacts(entityLinks);
  const entityReferences = entityReferenceFacts(entityLinks, primaryByCanonicalId);
  const rangeReferences = rangeReferenceFacts(rangeLinks, primaryDefinitions);
  const roleClassifiedRawFacts = buildRoleClassifiedRawFacts({ rawIdOccurrences, tables, traceLinks });

  return {
    primaryDefinitions,
    nonAuthoritativeEntityCandidates,
    entityReferences,
    rangeReferences,
    candidateEdges: [
      ...candidateEdgeFacts({ entityReferences, primaryBySectionId, rangeReferences }),
      ...roleClassifiedRawFacts.candidateEdges,
    ],
    tableEvidenceRows: tableEvidenceRows({ rawIdOccurrences, tables, traceLinks }),
    roleClassifiedRawFacts,
    diagnosticHints: [
      ...diagnosticHints({ entityReferences, primaryByCanonicalId, rangeReferences }),
      ...roleClassifiedRawFacts.diagnosticHints,
    ],
  };
}

function candidateEdgeFacts({ entityReferences, primaryBySectionId, rangeReferences }) {
  return [
    ...entityReferences.flatMap((reference) => {
      const source = sourcePrimaryDefinition(reference.section, primaryBySectionId);
      if (source === undefined) {
        return [];
      }

      return [
        {
          sourceOccurrenceId: reference.occurrenceId,
          fromCanonicalId: source.canonicalId,
          toCanonicalId: reference.canonicalId,
          relationshipHint: reference.table === undefined ? "section_mentions_entity" : "table_row_mentions_entity",
          evidenceRole: reference.role,
        },
      ];
    }),
    ...rangeReferences.flatMap((reference) => {
      const source = sourcePrimaryDefinition(reference.section, primaryBySectionId);
      if (source === undefined) {
        return [];
      }

      return [
        {
          sourceOccurrenceId: reference.occurrenceId,
          fromCanonicalId: source.canonicalId,
          toRange: {
            start: reference.start,
            end: reference.end,
          },
          relationshipHint: reference.table === undefined ? "section_mentions_range" : "table_row_mentions_range",
          evidenceRole: reference.role,
        },
      ];
    }),
  ];
}

function diagnosticHints({ entityReferences, primaryByCanonicalId, rangeReferences }) {
  return [
    ...duplicatePrimaryDefinitionHints(primaryByCanonicalId),
    ...entityReferences
      .filter((reference) => reference.resolution === "unresolved_candidate")
      .map((reference) => ({
        code: "r0.extractor.unresolved_entity_reference_candidate",
        severity: "info",
        occurrenceId: reference.occurrenceId,
        canonicalId: reference.canonicalId,
        sourceRange: reference.sourceRange,
      })),
    ...rangeReferences.flatMap((reference) =>
      Object.entries(reference.resolution)
        .filter(([, status]) => status === "unresolved_candidate")
        .map(([endpoint]) => ({
          code: "r0.extractor.unresolved_range_endpoint_candidate",
          severity: "info",
          occurrenceId: reference.occurrenceId,
          endpoint,
          label: endpoint === "start" ? reference.start : reference.end,
          sourceRange: reference.sourceRange,
        })),
    ),
  ];
}

function duplicatePrimaryDefinitionHints(primaryByCanonicalId) {
  return [...primaryByCanonicalId.entries()].flatMap(([canonicalId, definitions]) => {
    if (definitions.length < 2) {
      return [];
    }

    return [
      {
        code: "r0.extractor.duplicate_primary_definition_candidate",
        severity: "info",
        canonicalId,
        occurrenceIds: definitions.map((definition) => definition.occurrenceId),
      },
    ];
  });
}

function entityReferenceFacts(entityLinks, primaryByCanonicalId) {
  return entityLinks
    .filter((link) => link.role !== "primary_definition")
    .map((link) => ({
      occurrenceId: link.occurrenceId,
      canonicalId: link.trace.canonicalId,
      label: link.label,
      role: link.role,
      section: link.sectionContext,
      table: link.tableContext,
      sourceRange: link.sourceRange,
      resolution: primaryByCanonicalId.has(link.trace.canonicalId) ? "primary_definition_found" : "unresolved_candidate",
    }));
}

function nonAuthoritativeCandidateFacts(entityLinks) {
  return entityLinks
    .filter((link) => link.trace.type !== undefined && link.role !== "primary_definition")
    .map((link) => ({
      occurrenceId: link.occurrenceId,
      canonicalId: link.trace.canonicalId,
      label: link.label,
      type: link.trace.type,
      role: link.role,
      reason: "typed ctx entity link is outside a heading-owned primary definition",
      section: link.sectionContext,
      table: link.tableContext,
      sourceRange: link.sourceRange,
    }));
}

function primaryDefinitionFacts(traceLinks) {
  return traceLinks
    .filter((link) => link.role === "primary_definition")
    .map((link) => ({
      occurrenceId: link.occurrenceId,
      canonicalId: link.trace.canonicalId,
      label: link.label,
      type: link.trace.type,
      section: link.sectionContext,
      sourceRange: link.sourceRange,
    }));
}

function rangeReferenceFacts(rangeLinks, primaryDefinitions) {
  return rangeLinks.map((link) => ({
    occurrenceId: link.occurrenceId,
    label: link.label,
    start: link.trace.start,
    end: link.trace.end,
    role: link.role,
    section: link.sectionContext,
    table: link.tableContext,
    sourceRange: link.sourceRange,
    resolution: {
      start: primaryByLabel(primaryDefinitions, link.trace.start) === undefined ? "unresolved_candidate" : "primary_definition_found",
      end: primaryByLabel(primaryDefinitions, link.trace.end) === undefined ? "unresolved_candidate" : "primary_definition_found",
    },
  }));
}

function sourcePrimaryDefinition(section, primaryBySectionId) {
  if (section?.targetId === undefined) {
    return undefined;
  }

  return primaryBySectionId.get(section.targetId);
}

function primaryByLabel(primaryDefinitions, label) {
  return primaryDefinitions.find((definition) => definition.label === label);
}

function tableEvidenceRows({ rawIdOccurrences, tables, traceLinks }) {
  return tables.flatMap((table, tableIndex) => {
    const rowIndexes = unique(table.cells.filter((cell) => !cell.header).map((cell) => cell.rowIndex));

    return rowIndexes.flatMap((rowIndex) => {
      const rowCells = table.cells
        .filter((cell) => cell.rowIndex === rowIndex)
        .sort((left, right) => left.columnIndex - right.columnIndex);
      const traceOccurrenceIds = traceLinks
        .filter((link) => link.tableContext?.tableIndex === tableIndex && link.tableContext.rowIndex === rowIndex)
        .map((link) => link.occurrenceId);
      const rawIdOccurrenceIds = rawIdOccurrences
        .filter(
          (occurrence) =>
            occurrence.tableContext?.tableIndex === tableIndex && occurrence.tableContext.rowIndex === rowIndex,
        )
        .map((occurrence) => occurrence.occurrenceId);

      if (traceOccurrenceIds.length === 0 && rawIdOccurrenceIds.length === 0) {
        return [];
      }

      return [
        {
          tableIndex,
          rowIndex,
          rowValues: rowCells.map((cell) => ({
            columnIndex: cell.columnIndex,
            header: columnHeaderForCell(table, cell),
            text: cell.text,
          })),
          traceOccurrenceIds,
          rawIdOccurrenceIds,
          role: "table_evidence_row",
        },
      ];
    });
  });
}
