import { basename } from "node:path";
import { documentQueries } from "@jasonbelmonti/markdown-engine";
import { capturedSource } from "../analysis-state.js";
import type { DocumentAnalysis, Occurrence } from "../contracts/analysis.js";
import type { GraphValidationReport } from "../contracts/validation.js";
import type { ViewerPayload } from "./contracts.js";
import { explicitlySelected, readableLabel, viewerMetadata } from "./metadata.js";

export function viewerPayload(analysis: DocumentAnalysis, validation: GraphValidationReport): ViewerPayload {
  const capture = capturedSource(analysis);
  if (!capture) throw new Error("Explorer requires an issued analysis.");
  const graph = analysis.snapshot;
  if (validation.analysisId !== graph.analysisId || validation.sourceSha256 !== graph.source.sha256)
    throw new Error("Explorer validation must describe the same analysis.");
  const metadata = viewerMetadata(capture.document);
  const fragments = new Map(graph.fragments.map(fragment => [fragment.id, fragment]));
  const occurrences = new Map(graph.occurrences.map(occurrence => [occurrence.id, occurrence]));
  const definitions = new Map<string, Occurrence[]>();
  const contexts: ViewerPayload["contexts"] = Object.fromEntries(graph.fragments.map(fragment =>
    [fragment.id, { range: fragment.range, fields: [] }]));
  for (const occurrence of graph.occurrences) {
    if (occurrence.role !== "definition") continue;
    const entries = definitions.get(occurrence.identifier) ?? [];
    entries.push(occurrence); definitions.set(occurrence.identifier, entries);
    contexts[occurrence.fragmentId].fields = metadata(occurrence.range).fields;
  }
  const frontmatter = capture.document.frontmatter as { title?: unknown } | undefined;
  const title = typeof frontmatter?.title === "string" ? frontmatter.title
    : documentQueries.sections(capture.document, { depth: 1 })[0]?.title ?? basename(graph.source.documentId);
  return {
    version: "trace-explorer.v1", title, sourceText: capture.text, contexts, graph, validation,
    entities: graph.identifiers.map(record => {
      const declared = definitions.get(record.identifier) ?? [];
      const display = declared.length === 1 ? metadata(declared[0].range) : { label: "", fields: [] };
      return {
        id: record.identifier, kind: record.entityKind, definition: record.definition,
        label: readableLabel(record.identifier, display.label, display.fields),
        heading: declared.length > 0 && declared.every(o => fragments.get(o.fragmentId)?.structure === "heading"),
        sourceSelected: record.entityKind === "option" && record.definition.status === "resolved"
          && explicitlySelected(display.fields),
        evidence: declared.map(o => ({ occurrenceId: o.id, range: o.range, fragmentId: o.fragmentId })),
      };
    }),
    relations: graph.relationships.map(relation => {
      const occurrence = occurrences.get(relation.occurrenceId);
      if (!occurrence) throw new Error("Explorer relationship is missing its captured occurrence.");
      return { ...relation, range: occurrence.range, fragmentId: occurrence.fragmentId };
    }),
  };
}
