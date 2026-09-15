# Experimental document graph and backlinks

The first document-wide graph API is runnable from a built checkout or packed tarball at `@jasonbelmonti/markdown-trace/experimental/graph`. It uses Markdown Engine 3.5.0 for structure and source maps. The package remains private; the experimental entry point and draft language may change before a stable release.

Run the mixed-layout example:

```sh
npm ci
npm run demo:graph
# Optional: inspect another document using the demo's REQ/WP/VAL vocabulary.
npm run demo:graph -- path/to/spec.md REQ-2
```

The default example produces six identifiers, ten occurrences and four relationships. `REQ-2` has two incoming references: one from the `WP-1` nested list at line 8, and one from the `WP-2` table row at line 14. The demo prints their exact locations and source text.

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
    language: 'markdown-trace.identity.draft1',
    entityKinds: [
      { name: 'requirement', prefixes: ['REQ'] },
      { name: 'work', prefixes: ['WP'] },
    ],
  },
  validation: { minEntities: 0, allowedRelations: [], rules: [] },
}));
const text = '# Requirement {#REQ-1}\n\n- {#WP-1} {implements:REQ-1}';
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

`compileProfile` checks and captures profile configuration. It does **not** evaluate relationship validity yet. The `validation` section is accepted for later policy evaluation; it neither removes relationships nor turns analysis into a validity verdict. Changing only that section leaves the graph and analysis identity unchanged.

## Draft identity language

- An identifier matches `[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+`, for example `REQ-1` or `WP-API-2`.
- `{#REQ-1}` declares an identifier. `{implements:REQ-1}` creates a typed reference. Relation names use lowercase hyphen-separated slugs.
- A whole bare identifier or a single-identifier inline code span creates a generic `references` relationship. A mention does not declare an identifier.
- Headings own their sections; a declaration in a list item's opening paragraph owns that item. Local paragraph and table-row declarations take precedence over enclosing scopes. Blockquotes and nested lists preserve structural boundaries.
- Multiple declarations at the selected scope produce an ambiguous owner. Duplicate definitions and dangling references remain inspectable. Unknown prefixes and relation names remain graph facts.
- Fenced/indented code, frontmatter, link destinations, images, HTML nodes and non-identifier inline code are literal. Link labels and emphasis are eligible, but syntax cannot be assembled across separate text leaves. Malformed marker groups produce diagnostics and suppress inner identifiers.

The [language and ownership clauses](design/markdown-trace-document-graph-interfaces.md) and existing source corpus describe the experimental interpretation. Runtime source-fragment partitioning currently follows Engine blocks and captures supporting headings/table structure. Context projection is not implemented, and exact fragment partitioning is provisional.

## Results and limits

Every operation returns `{ ok: true, value }` or `{ ok: false, error }`. Invalid profiles, fabricated handles, invalid query bounds, unusable source maps, and exceeded analysis limits return errors. Analysis accepts caller-supplied text; it performs no file reads or network access.

`analysis.snapshot` contains immutable identifiers, occurrences, relationships, source fragments, exclusions and diagnostics. Each reference occurrence contributes one relationship, so repeated references remain distinct. Incoming queries retain unowned and ambiguous references; outgoing queries return references with a unique owner matching the requested identifier.

`coverage: 'complete'` means extraction completed without error diagnostics. It does **not** mean the graph is valid. Malformed expressions, unsupported structures and uncertain reference ownership produce `partial` coverage with queryable evidence. Duplicate definitions, unknown kinds and missing targets are represented explicitly for later validation.

Ranges use zero-based UTF-16 offsets, one-based lines/columns, and exclusive ends. SHA-256 hashes cover the original UTF-8 source. Keep the source text alongside the analysis when slicing locations. Issued profile/analysis handles are local to the loaded module instance; serializing a snapshot does not create a reusable handle.

Reference pages are ordered by source occurrence. Defaults are offset 0 and limit 100, with a maximum page size of 1,000. Follow `nextOffset` until it is null. Omitted relation filters select all kinds; an empty filter selects none. An absent identifier yields a null record and empty results.

Next capabilities are profile-based graph validation, bounded traversal and source-context projection over this same graph. The existing package-root validator and CLI retain their compatibility behavior.
