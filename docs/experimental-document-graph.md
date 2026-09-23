# Experimental document graph and backlinks

The first document-wide graph API is runnable from a built checkout or packed tarball at `@jasonbelmonti/markdown-trace/experimental/graph`. It uses Markdown Engine 3.6.0 for structure and source maps. The package remains private; the experimental entry point and draft language may change before a stable release.

Run the mixed-layout example:

```sh
npm ci
npm run demo:graph
# Optional: inspect another document using the demo's REQ/WP/VAL vocabulary.
npm run demo:graph -- path/to/spec.md REQ-2
```

The default example produces six identifiers, ten occurrences and four relationships. `REQ-2` has two incoming references: one from the `WP-1` nested list at line 8, and one from the `WP-2` table row at line 14. The demo prints their exact locations and source text.

## Inspect your own document

From this repository checkout, build once and export the complete graph:

```sh
npm ci
npm run build
node scripts/demo-document-graph.mjs "/absolute/path/to/your-spec.md" --graph > /tmp/markdown-trace-graph.json
cat /tmp/markdown-trace-graph.json
```

Only the direct `node` command is redirected, so npm output cannot contaminate the JSON. The snapshot includes `source`, `identifiers`, `occurrences`, `relationships`, `fragments`, `exclusions`, `diagnostics` and `coverage`. Fragment ranges locate source text; the snapshot is not an assembled context bundle. The demo admits up to 2,000,000 UTF-8 source bytes and 50,000 occurrences; the API accepts explicit caller limits.

For a located backlink summary instead:

```sh
node scripts/demo-document-graph.mjs "/absolute/path/to/your-spec.md" REQ-1
```

## Export a Mermaid diagram

From the built checkout, write Mermaid text directly to a file:

```sh
node scripts/demo-document-graph.mjs "/absolute/path/to/your-spec.md" --mermaid > /tmp/markdown-trace-graph.mmd
```

Use the same `--profile` option for custom vocabulary. `--graph` and `--mermaid` are mutually exclusive. The output has no Markdown fence or console preamble; paste it inside a `mermaid` fenced code block in a compatible Markdown viewer, or open it with a Mermaid renderer.

The diagram includes every identifier, including isolated ones, and one directed, labeled edge per reference occurrence. Repeated references remain separate edges. Missing/duplicate definitions and unknown entity kinds are labeled. References without a unique owner use separate warning nodes showing their source line/column; ambiguous nodes list candidate identifiers without assigning the edge to any candidate. The metadata box shows extraction coverage, diagnostic/exclusion counts, and that policy has not been evaluated.

The export is a visual projection of the snapshot, not its full serialization. Use `--graph` for detailed diagnostics, provenance and source ranges. The exporter does not parse Markdown, evaluate validation rules, filter large graphs, or render SVG/PNG. Large diagrams remain subject to the chosen renderer's limits; export does not truncate them.

The library adapter also works with an analyzer-produced snapshot restored from JSON:

```js
import { exportMermaid } from '@jasonbelmonti/markdown-trace/experimental/graph';

const mermaid = exportMermaid(analysis.snapshot); // string, ending in a newline
```

`exportMermaid(snapshot: GraphSnapshot): string` is a synchronous, read-only formatter. It accepts a valid `markdown-trace.document-graph.v1` snapshot; it does not validate arbitrary JSON or require an issued analysis handle. Snapshot array order determines diagram order and generated node IDs.

## Custom vocabulary

The default profile maps REQ/WP/VAL to requirement/work/validation. Other canonical IDs remain in the graph with `entityKind: null`; they are not discarded. To map your own prefixes, copy and edit [the JSON profile](../fixtures/document-graph/profile.json), then supply it explicitly:

```sh
node scripts/demo-document-graph.mjs "/absolute/path/to/your-spec.md" \
  --profile "/absolute/path/to/your-profile.json" --graph > /tmp/markdown-trace-graph.json
```

Any Markdown file can be analyzed, but meaningful declarations and typed edges require the link convention below. Bare IDs alone create mentions, not definitions; unowned references produce partial coverage. Arbitrary prose is not interpreted as a relationship. This draft2 URI convention is separate from the legacy registry links with dotted IDs and `type=` fields; those are not automatically migrated.

## API example

```js
import {
  compileProfile, analyzeDocument, lookupIdentifier, findIncoming, findOutgoing,
} from '@jasonbelmonti/markdown-trace/experimental/graph';

const unwrap = result => {
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
};
const profile = unwrap(compileProfile({
  schemaVersion: 'markdown-trace.document-profile.v1',
  profileId: 'my-spec',
  interpretation: {
    language: 'markdown-trace.identity.draft2',
    entityKinds: [
      { name: 'requirement', prefixes: ['REQ'] },
      { name: 'work', prefixes: ['WP'] },
    ],
  },
  validation: { minEntities: 0, allowedRelations: [], rules: [] },
}));
const text = '# [Requirement](ctx://trace/entity/REQ-1?role=definition)\n\n'
  + '- [Work](ctx://trace/entity/WP-1?role=definition) '
  + '[requirement](ctx://trace/entity/REQ-1?rel=implements)';
const analysis = unwrap(analyzeDocument({ documentId: 'spec.md', text }, profile, {
  maxSourceUtf8Bytes: 1_000_000,
  maxOccurrences: 10_000,
}));
const definition = unwrap(lookupIdentifier(analysis, 'REQ-1'));
const backlinks = unwrap(findIncoming(analysis, 'REQ-1'));
const outgoing = unwrap(findOutgoing(analysis, 'WP-1', {
  relations: ['implements'], offset: 0, limit: 100,
}));
```

`compileProfile` checks and captures the original document-profile.v1 configuration. Its `validation` section remains compile-only for compatibility. Use [`compileValidationProfile` and `validateGraph`](experimental-graph-validation.md) with the separate validation profile schema to evaluate graph and source-coverage rules. Neither compiler removes relationships or turns analysis into a validity verdict. Changing only that section leaves the graph and analysis identity unchanged.

## Link identity language

Declarations and typed references use standard Markdown links. Markdown Engine parses links and resolves reference-style destinations; Trace interprets their URI values. Labels are presentation text and do not have to match the target identifier.

```markdown
## [Sign-in requirement](ctx://trace/entity/REQ-1?role=definition)

Users can sign in.

## [Sign-in work](ctx://trace/entity/WP-1?role=definition)

Implements [the requirement](ctx://trace/entity/REQ-1?rel=implements).
Also mentions [REQ-1](ctx://trace/entity/REQ-1).
```

The typed edge is `WP-1 -> REQ-1`, with kind `implements`. The second link adds a separate generic `references` edge. Each Trace link contributes exactly one occurrence spanning the whole Markdown link; its label is not scanned again.

- The URI shape is `ctx://trace/entity/ID`, optionally followed by exactly `?role=definition` or `?rel=RELATION`. Declarations work in headings, paragraphs, list items, blockquotes and table cells. Omitted query parameters create generic references.
- IDs match `[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+`. Relation names match `[a-z][a-z0-9]*(?:-[a-z0-9]+)*`. The interpretation profile maps prefixes to entity kinds; unknown well-formed IDs and relation names remain graph facts.
- These are constrained URIs: credentials, ports, fragments, extra path segments, encoded components, duplicate/unknown parameters and combinations of declaration and relation parameters are rejected. A malformed `ctx:` destination produces a located diagnostic and no fallback occurrence from its label. Trace never opens or fetches these URIs.
- Inline links, reference-style links and angle-bracket autolinks recognized by Engine are supported. Reference definitions supply destinations but are not themselves entity declarations. The occurrence range identifies the link use, not its shared reference definition.
- Whole bare identifiers and single-identifier inline code remain generic references. Ordinary link labels are eligible for generic mentions; ordinary destinations, images, HTML nodes, frontmatter and fenced/indented code remain literal.
- Headings own their sections; a declaration in a list item's opening paragraph owns that item. Local paragraph and table-row declarations take precedence over enclosing scopes. Multiple declarations at the selected scope produce an ambiguous owner. Duplicate and missing definitions remain inspectable.

This guide is the current authoring contract. It replaces draft1's brace-marker grammar. Former brace markers have no declaration or typed-reference meaning; an eligible bare ID within ordinary text can still be a generic mention. A draft1 profile is rejected as an unsupported language version rather than silently reinterpreted.

The graph/query contracts remain unchanged. Runtime source fragments follow Engine blocks and capture supporting headings/table structure. Context projection is not implemented, and exact fragment partitioning is provisional. Custom-scheme links use ordinary Markdown syntax; whether a renderer makes their destinations clickable depends on that renderer.

## Results and limits

Profile compilation, analysis and query operations return `{ ok: true, value }` or `{ ok: false, error }`; the Mermaid formatter returns a string directly. Invalid profiles, fabricated handles, invalid query bounds, unusable source maps, and exceeded analysis limits return errors. Analysis accepts caller-supplied text; it performs no file reads or network access.

`analysis.snapshot` contains immutable identifiers, occurrences, relationships, source fragments, exclusions and diagnostics. Each reference occurrence contributes one relationship, so repeated references remain distinct. Incoming queries retain unowned and ambiguous references; outgoing queries return references with a unique owner matching the requested identifier.

`coverage: 'complete'` means extraction completed without error diagnostics. It does **not** mean the graph is valid. Malformed Trace links, unsupported structures and uncertain reference ownership produce `partial` coverage with queryable evidence. Duplicate definitions, unknown kinds and missing targets are represented explicitly and checked by the validation API.

Ranges use zero-based UTF-16 offsets, one-based lines/columns, and exclusive ends. SHA-256 hashes cover the original UTF-8 source. Keep the source text alongside the analysis when slicing locations. Issued profile/analysis handles are local to the loaded module instance; serializing a snapshot does not create a reusable handle.

Reference pages are ordered by source occurrence. Defaults are offset 0 and limit 100, with a maximum page size of 1,000. Follow `nextOffset` until it is null. Omitted relation filters select all kinds; an empty filter selects none. An absent identifier yields a null record and empty results.

Profile-driven validation is available over this same analysis. Next capabilities are bounded traversal and source-context projection. The existing package-root validator and CLI retain their compatibility behavior.
