import { readFile } from "node:fs/promises";
import {
  analyzeDocument,
  compileProfile,
  findIncoming,
  lookupIdentifier,
} from "@jasonbelmonti/markdown-trace/experimental/graph";

function unwrap(result) {
  if (!result.ok) throw new Error(JSON.stringify(result.error, null, 2));
  return result.value;
}

const [
  documentId = "fixtures/document-graph/mixed-layout.md",
  identifier = "REQ-2",
] = process.argv.slice(2);
const profile = unwrap(
  compileProfile(
    JSON.parse(
      await readFile(
        new URL("../fixtures/document-graph/profile.json", import.meta.url),
        "utf8",
      ),
    ),
  ),
);
const text = await readFile(documentId, "utf8");
const analysis = unwrap(
  analyzeDocument({ documentId, text }, profile, {
    maxSourceUtf8Bytes: 2_000_000,
    maxOccurrences: 50_000,
  }),
);
const graph = analysis.snapshot;
const lookup = unwrap(lookupIdentifier(analysis, identifier));
const page = unwrap(findIncoming(analysis, identifier));
console.log(
  JSON.stringify(
    {
      documentId,
      coverage: graph.coverage,
      counts: {
        identifiers: graph.identifiers.length,
        occurrences: graph.occurrences.length,
        relationships: graph.relationships.length,
      },
      identifier: lookup.record,
      backlinks: page.items.map(({ relationship, occurrence }) => ({
        source: relationship.source,
        kind: relationship.kind,
        range: occurrence.range,
        text: text.slice(
          occurrence.range.start.offset,
          occurrence.range.end.offset,
        ),
      })),
      totalBacklinks: page.totalMatches,
      nextOffset: page.nextOffset,
      diagnostics: graph.diagnostics,
    },
    null,
    2,
  ),
);
