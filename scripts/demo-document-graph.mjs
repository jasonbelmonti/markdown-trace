import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
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

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    graph: { type: "boolean", default: false },
    profile: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});
if (values.help) {
  console.log(`Usage: node scripts/demo-document-graph.mjs [document.md] [identifier] [--graph] [--profile profile.json]

Defaults: fixtures/document-graph/mixed-layout.md, REQ-2, bundled REQ/WP/VAL profile.
--graph emits the full snapshot as JSON instead of the identifier/backlink summary.
--profile supplies a document-profile.v1 JSON file. Policy is not evaluated yet.`);
  process.exit(0);
}
if (positionals.length > 2)
  throw new Error(
    "Expected a document path and optional identifier; use --help.",
  );
const [
  documentId = "fixtures/document-graph/mixed-layout.md",
  identifier = "REQ-2",
] = positionals;
const profile = unwrap(
  compileProfile(
    JSON.parse(
      await readFile(
        values.profile ??
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
if (values.graph) {
  console.log(JSON.stringify(graph, null, 2));
} else {
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
}
